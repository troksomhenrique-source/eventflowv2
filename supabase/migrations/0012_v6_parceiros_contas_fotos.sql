-- =====================================================================
-- EventFlow v6 · migração 0012
--   parceiros      empresas parceiras cadastradas por cada locadora
--   sublocacoes    pedidos de sublocação entre empresas (solicitante ↔ fornecedor)
--   contas         contas a pagar e a receber
--   item_fotos     foto (miniatura) de cada item do inventário
--
-- Premissas, as mesmas das migrações anteriores:
--   * perfis(id = auth.uid(), empresa_id, papel, ativo)
--   * empresas(id, nome, ativa)
-- Enquanto esta migração não for aplicada, o v6.html guarda estes dados
-- só no navegador (modo local) e avisa na tela.
-- =====================================================================

-- empresa de quem está logado
create or replace function public.v6_empresa_atual()
returns uuid language sql stable security definer set search_path = public as $$
  select p.empresa_id from public.perfis p where p.id = auth.uid() and p.ativo
$$;
grant execute on function public.v6_empresa_atual() to authenticated;

-- papel de quem está logado (gerencia, producao, estoque)
create or replace function public.v6_papel_atual()
returns text language sql stable security definer set search_path = public as $$
  select p.papel from public.perfis p where p.id = auth.uid() and p.ativo
$$;
grant execute on function public.v6_papel_atual() to authenticated;

-- confere o código de parceiro (id da empresa) e devolve só o nome
create or replace function public.empresa_por_codigo(p_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select e.nome from public.empresas e where e.id = p_id and coalesce(e.ativa, true)
$$;
grant execute on function public.empresa_por_codigo(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- parceiros
-- ---------------------------------------------------------------------
create table if not exists public.parceiros (
  id                  uuid primary key default gen_random_uuid(),
  empresa_id          uuid not null default public.v6_empresa_atual(),
  nome                text not null,
  documento           text,
  contato             text,
  telefone            text,
  email               text,
  cidade              text,
  observacao          text,
  empresa_parceira_id uuid,            -- preenchido quando o parceiro também usa o EventFlow
  ativo               boolean not null default true,
  criado_em           timestamptz not null default now()
);
create index if not exists parceiros_empresa_idx on public.parceiros(empresa_id);
alter table public.parceiros enable row level security;
drop policy if exists parceiros_rw on public.parceiros;
create policy parceiros_rw on public.parceiros for all to authenticated
  using (empresa_id = public.v6_empresa_atual())
  with check (empresa_id = public.v6_empresa_atual());

-- ---------------------------------------------------------------------
-- sublocacoes: visível para as duas pontas
-- ---------------------------------------------------------------------
create table if not exists public.sublocacoes (
  id                     uuid primary key default gen_random_uuid(),
  codigo                 text,
  solicitante_empresa_id uuid not null default public.v6_empresa_atual(),
  solicitante_nome       text,
  fornecedor_empresa_id  uuid,          -- nulo: parceiro fora da plataforma
  fornecedor_nome        text,
  parceiro_id            uuid,          -- cadastro do parceiro na empresa solicitante
  negocio_id             uuid,
  os_id                  uuid,
  evento                 text,
  retirada               date not null,
  devolucao              date not null,
  contra_retirada        date,
  contra_devolucao       date,
  contra_mensagem        text,
  status                 text not null default 'Enviada'
    check (status in ('Enviada','Contraproposta','Aceita','Recusada','Retirada','Devolvida','Cancelada')),
  valor                  numeric(14,2) not null default 0,
  mensagem               text,
  itens                  jsonb not null default '[]'::jsonb,
  historico              jsonb not null default '[]'::jsonb,
  criado_em              timestamptz not null default now(),
  atualizado_em          timestamptz not null default now(),
  check (devolucao >= retirada)
);
create index if not exists sublocacoes_solic_idx on public.sublocacoes(solicitante_empresa_id);
create index if not exists sublocacoes_forn_idx  on public.sublocacoes(fornecedor_empresa_id);
alter table public.sublocacoes enable row level security;
drop policy if exists sublocacoes_ver on public.sublocacoes;
create policy sublocacoes_ver on public.sublocacoes for select to authenticated
  using (solicitante_empresa_id = public.v6_empresa_atual()
      or fornecedor_empresa_id  = public.v6_empresa_atual());
drop policy if exists sublocacoes_criar on public.sublocacoes;
create policy sublocacoes_criar on public.sublocacoes for insert to authenticated
  with check (solicitante_empresa_id = public.v6_empresa_atual());
drop policy if exists sublocacoes_alterar on public.sublocacoes;
create policy sublocacoes_alterar on public.sublocacoes for update to authenticated
  using (solicitante_empresa_id = public.v6_empresa_atual()
      or fornecedor_empresa_id  = public.v6_empresa_atual())
  with check (solicitante_empresa_id = public.v6_empresa_atual()
      or fornecedor_empresa_id  = public.v6_empresa_atual());
drop policy if exists sublocacoes_apagar on public.sublocacoes;
create policy sublocacoes_apagar on public.sublocacoes for delete to authenticated
  using (solicitante_empresa_id = public.v6_empresa_atual() and status in ('Enviada','Cancelada','Recusada'));

-- quem atende não pode trocar quem pediu, e vice-versa
create or replace function public.sublocacoes_guarda()
returns trigger language plpgsql as $$
begin
  new.solicitante_empresa_id := old.solicitante_empresa_id;
  if old.fornecedor_empresa_id is not null then
    new.fornecedor_empresa_id := old.fornecedor_empresa_id;
  end if;
  new.atualizado_em := now();
  return new;
end $$;
drop trigger if exists sublocacoes_guarda on public.sublocacoes;
create trigger sublocacoes_guarda before update on public.sublocacoes
  for each row execute function public.sublocacoes_guarda();

-- ---------------------------------------------------------------------
-- contas a pagar e a receber (só a gerência)
-- ---------------------------------------------------------------------
create table if not exists public.contas (
  id             uuid primary key default gen_random_uuid(),
  empresa_id     uuid not null default public.v6_empresa_atual(),
  tipo           text not null check (tipo in ('receber','pagar')),
  descricao      text not null,
  categoria      text,
  contraparte    text,
  emissao        date not null default current_date,
  vencimento     date not null,
  valor          numeric(14,2) not null check (valor >= 0),
  pago_em        date,
  valor_pago     numeric(14,2),
  forma          text,
  os_id          uuid,
  sublocacao_id  uuid,
  reembolso_id   uuid,
  parcela        text,
  observacao     text,
  criado_em      timestamptz not null default now()
);
create index if not exists contas_empresa_venc_idx on public.contas(empresa_id, vencimento);
alter table public.contas enable row level security;
drop policy if exists contas_rw on public.contas;
create policy contas_rw on public.contas for all to authenticated
  using (empresa_id = public.v6_empresa_atual() and public.v6_papel_atual() = 'gerencia')
  with check (empresa_id = public.v6_empresa_atual() and public.v6_papel_atual() = 'gerencia');

-- ---------------------------------------------------------------------
-- fotos do inventário (miniatura em JPEG, data URL de ~40 KB)
-- ---------------------------------------------------------------------
create table if not exists public.item_fotos (
  empresa_id    uuid not null default public.v6_empresa_atual(),
  item_cod      text not null,
  imagem        text not null,
  atualizado_em timestamptz not null default now(),
  primary key (empresa_id, item_cod)
);
alter table public.item_fotos enable row level security;
drop policy if exists item_fotos_ver on public.item_fotos;
create policy item_fotos_ver on public.item_fotos for select to authenticated
  using (empresa_id = public.v6_empresa_atual());
drop policy if exists item_fotos_gravar on public.item_fotos;
create policy item_fotos_gravar on public.item_fotos for all to authenticated
  using (empresa_id = public.v6_empresa_atual() and public.v6_papel_atual() in ('gerencia','estoque'))
  with check (empresa_id = public.v6_empresa_atual() and public.v6_papel_atual() in ('gerencia','estoque'));

-- avisos em tempo real para o parceiro
do $$ begin
  alter publication supabase_realtime add table public.sublocacoes;
exception when others then null; end $$;
