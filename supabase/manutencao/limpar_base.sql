-- =====================================================================
-- EventFlow · limpar a base de testes
--
-- ATENÇÃO: apaga dados de TODAS as empresas e não tem como desfazer.
-- Faça um backup antes (Supabase → Database → Backups) se quiser guardar algo.
--
-- Como usar, no SQL Editor do Supabase:
--   PASSO 1  rode só a PRÉVIA e confira o que será apagado e o que fica.
--   PASSO 2  ajuste as opções no começo da LIMPEZA e rode o bloco inteiro.
--   PASSO 3  esvazie os arquivos em Storage (fotos, comprovantes, avatares,
--            anexos do chat) se o PASSO 2 avisar que não conseguiu.
--
-- O que nunca é apagado: tabelas de controle da plataforma (nome com
-- "owner" ou "plataforma"), a estrutura do banco, funções e permissões.
-- =====================================================================


-- ---------------------------------------------------------------------
-- PASSO 1 · PRÉVIA (só lê, não apaga nada)
-- ---------------------------------------------------------------------
select c.relname as tabela,
       (xpath('/row/n/text()',
          query_to_xml(format('select count(*) as n from public.%I', c.relname), false, true, '')))[1]::text::bigint as linhas,
       case when c.relname ilike '%owner%' or c.relname ilike '%plataforma%' then 'mantém sempre'
            when c.relname in ('empresas','perfis','avatares') then 'mantém (só apaga com apagar_empresas = true)'
            else 'apaga' end as acao
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public' and c.relkind = 'r'
 order by acao, tabela;


-- ---------------------------------------------------------------------
-- PASSO 2 · LIMPEZA (rode o bloco inteiro, do "do $$" até o "$$;")
-- ---------------------------------------------------------------------
do $$
declare
  -- false (padrão): apaga clientes, OS, cargas, estoque, chat, contas,
  --   parceiros… de todas as empresas, mas MANTÉM as empresas, os
  --   usuários (perfis) e os logins. Cada empresa volta “zerada”.
  -- true: apaga também as empresas, os perfis e os logins desses
  --   usuários. Sobra só o dono da plataforma, para cadastrar do zero.
  apagar_empresas boolean := false;

  -- Obrigatório com apagar_empresas = true: e-mails que NUNCA podem
  -- perder o login (o seu, de dono da plataforma).
  manter_emails text[] := array['seu-email@exemplo.com'];

  manter text[] := array['empresas','perfis','avatares'];  -- avatares = foto de perfil de quem fica
  lista text; s record; ids uuid[]; n int; buckets text[] := array['vt-fotos','reembolsos','chat-arquivos'];
begin
  if apagar_empresas then
    if coalesce(array_length(manter_emails,1),0) = 0 or 'seu-email@exemplo.com' = any(manter_emails) then
      raise exception 'Preencha manter_emails com o seu e-mail de dono da plataforma antes de apagar as empresas.';
    end if;
    if not exists (select 1 from auth.users where lower(email) = any(select lower(x) from unnest(manter_emails) x)) then
      raise exception 'Nenhum login encontrado com os e-mails de manter_emails. Confira a digitação.';
    end if;
    manter := array[]::text[];
    buckets := array_append(buckets, 'avatares');
    -- logins que serão removidos: quem tinha perfil, menos os e-mails protegidos
    select array_agg(p.id) into ids
      from public.perfis p join auth.users u on u.id = p.id
     where lower(u.email) <> all(select lower(x) from unnest(manter_emails) x);
  end if;

  select string_agg(format('public.%I', c.relname), ', ' order by c.relname) into lista
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r'
     and not (c.relname = any(manter))
     and c.relname not ilike '%owner%' and c.relname not ilike '%plataforma%';

  if lista is null then raise notice 'Nada a limpar.'; return; end if;

  -- um TRUNCATE só, sem CASCADE: se alguma tabela mantida depender de uma
  -- que seria apagada, o comando falha inteiro e nada é perdido
  execute 'truncate table ' || lista || ' restart identity';
  raise notice 'Tabelas limpas: %', lista;

  -- numeração dos códigos (OS, OSC, movimentos…) volta a começar do 1
  for s in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'public' and c.relkind = 'S'
              and c.relname not ilike '%owner%' and c.relname not ilike '%plataforma%' loop
    execute format('alter sequence public.%I restart', s.relname);
  end loop;

  if apagar_empresas and ids is not null then
    delete from auth.users where id = any(ids);
    get diagnostics n = row_count;
    raise notice 'Logins removidos: %', n;
  end if;

  -- arquivos: o Supabase pode bloquear apagar Storage por SQL; aí é pelo painel
  begin
    delete from storage.objects where bucket_id = any(buckets);
    get diagnostics n = row_count;
    raise notice 'Arquivos removidos do Storage: %', n;
  exception when others then
    raise notice 'Storage não foi limpo por SQL (%). Esvazie em Storage os buckets: %.', sqlerrm, array_to_string(buckets,', ');
  end;
end $$;
