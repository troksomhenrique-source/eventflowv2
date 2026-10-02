// Gera supabase/demo/empresa_demo.sql a partir de dados.js.
// Uso (na raiz do repositório): node exemplos/demo/gerar-sql.js
const fs = require("fs"), path = require("path");
const RAIZ = path.join(__dirname, "..", "..");
const SAIDA = path.join(RAIZ, "supabase", "demo", "empresa_demo.sql");
const D = require("./dados")();

/* ids do gerador ("m0000000-…") viram uuids válidos e fixos: rodar de novo reaproveita os mesmos */
const UUID_RE = /\b([0-9a-z])0000000-0000-4000-8000-(\d{12})\b/g;
const fixa = s => s.replace(UUID_RE, (_, p, n) => "de" + p.charCodeAt(0).toString(16).padStart(2, "0") + "0000-0000-4000-8000-" + n);
const id = v => (v ? fixa(v) : v);
const J = v => {
  const t = fixa(JSON.stringify(v));
  if (t.includes("$j$")) throw new Error("conteúdo com $j$");
  return "$j$" + t + "$j$";
};
const Q = v => "'" + fixa(String(v)).replace(/'/g, "''") + "'";
const so = (o, ks) => Object.fromEntries(ks.filter(k => o[k] !== undefined).map(k => [k, o[k]]));

/* ---------- logins: o primeiro de cada nível é o usado pela página de demonstração ---------- */
const CFG = require("./config");
const LOGIN = CFG.logins;
const usados = new Set();
const pessoas = D.P.map(p => {
  let email = LOGIN[p.papel];
  if (!email || usados.has(email)) email = p.email.replace(/@.*/, "@atlas.example.com");
  usados.add(email);
  return { id: p.id, email, nome: p.nome, cargo: p.cargo, papel: p.papel, cor: p.cor };
});
const G1 = D.P[0].id;

/* ---------- tabelas, na ordem pais → filhos ---------- */
const T = [];
const add = (tabela, linhas) => { if (linhas.length) T.push([tabela, linhas]); };

add("itens", D.itens.map(i => so(i, ["cod", "nome", "categoria", "unidade", "marca", "modelo", "peso_kg", "por_case", "watts", "diaria", "quantidade_total", "em_manutencao", "observacao_tecnica"])));
add("kits", D.kits.map(k => so(k, ["cod", "nome", "categoria", "observacao"])));
add("kit_itens", D.kits.flatMap(k => k.kit_itens.map(x => ({ kit_cod: k.cod, item_cod: x.item_cod, quantidade: x.quantidade }))));
add("frota", D.frota.map(v => so(v, ["cod", "nome", "tipo", "placa", "capacidade_kg", "capacidade_cases", "lugares", "observacao", "em_manutencao"])));
add("clientes", D.CL.map(c => so(c, ["id", "nome", "tipo", "documento", "contato", "telefone", "cidade", "desde"])));
add("freelancers", D.FR.map(f => so(f, ["id", "nome", "apelido", "telefone", "email", "cidade", "especialidades", "veiculo_proprio", "veiculo_desc", "observacao", "ativo",
  "cache_diaria", "cpf", "rg", "nascimento", "banco", "agencia", "conta", "tipo_conta", "titular", "pix"])));

const N = D.negocios;
add("negocios", N.map(n => so(n, ["id", "codigo", "titulo", "cliente_id", "etapa", "temperatura", "recorrente", "eventos_anteriores", "tipo_evento", "origem",
  "responsavel_id", "local_nome", "sala", "endereco", "cidade", "publico", "prazo_decisao", "montagem", "montagem_hora", "evento_inicio", "evento_inicio_hora",
  "evento_fim", "evento_fim_hora", "desmontagem", "desmontagem_hora", "valor"])));
add("negocio_ambientes", N.flatMap(n => n.negocio_ambientes.map(a => {
  const s = n.negocio_sala;
  return a.principal
    ? { id: a.id, negocio_id: n.id, nome: a.nome, principal: true, ordem: 0, area_m2: s.area_m2, comprimento_m: s.comprimento_m, largura_m: s.largura_m,
        pe_direito: s.pe_direito, carga_piso: s.carga_piso, energia_kva: s.energia_kva, pontos: s.pontos, wll_ponto_kgf: s.wll_ponto_kgf }
    : { negocio_id: n.id, ...so(a, ["id", "nome", "principal", "ordem", "comprimento_m", "largura_m", "area_m2", "pe_direito", "carga_piso", "energia_kva", "pontos", "wll_ponto_kgf", "observacao"]) };
})));
add("negocio_sala", N.map(n => ({ negocio_id: n.id, ...n.negocio_sala })));
add("briefing_blocos", N.flatMap(n => n.briefing_blocos.map(b => ({ negocio_id: n.id, ...b }))));
add("briefing_notas", N.flatMap(n => n.briefing_notas.map(b => ({ negocio_id: n.id, ...b }))));
add("visitas_tecnicas", N.filter(n => n.visitas_tecnicas).map(n => ({ negocio_id: n.id, ...n.visitas_tecnicas })));
add("vt_participantes", N.flatMap(n => n.vt_participantes.map(p => ({ negocio_id: n.id, perfil_id: p.perfil_id }))));
add("vt_checklist", N.flatMap(n => n.vt_checklist.map(c => ({ negocio_id: n.id, ordem: c.ordem, texto: c.texto, concluido: c.concluido }))));
add("projetos_3d", N.filter(n => n.projetos_3d).map(n => ({ negocio_id: n.id, ...n.projetos_3d })));
add("orcamentos", N.map(n => ({ negocio_id: n.id, ...n.orcamentos })));
add("orcamento_linhas", N.flatMap(n => n.orcamento_linhas.map(l => ({ negocio_id: n.id, ...so(l, ["tipo", "ambiente_id", "item_cod", "descricao", "categoria",
  "quantidade", "diarias", "valor_unitario", "cobranca", "fornecedor", "observacao", "ordem"]) }))));
add("fechamentos", N.filter(n => n.fechamentos).map(n => ({ negocio_id: n.id, ...n.fechamentos })));
add("fechamento_participantes", N.flatMap(n => n.fechamento_participantes.map(p => ({ negocio_id: n.id, perfil_id: p.perfil_id }))));
add("fechamento_pauta", N.flatMap(n => n.fechamento_pauta.map(p => ({ negocio_id: n.id, ordem: p.ordem, texto: p.texto, revisado: p.revisado }))));

const O = D.ordens;
add("ordens_venda", O.map(o => so(o, ["id", "codigo", "negocio_id", "cliente_id", "evento", "local_nome", "cidade", "publico", "area_m2", "montagem",
  "evento_inicio", "evento_fim", "desmontagem", "valor", "status", "descritivo", "criado_em"])));
add("os_produtores", O.flatMap(o => o.os_produtores.map(p => ({ os_id: o.id, ...p }))));
add("os_ambientes", O.flatMap(o => o.os_ambientes.map(a => ({ os_id: o.id, ...a }))));
add("os_memorial", O.flatMap(o => o.os_memorial.map(m => ({ os_id: o.id, ...m }))));
add("os_zonas", O.flatMap(o => o.os_zonas.map(z => ({ os_id: o.id, ...z }))));
add("os_estruturas", O.flatMap(o => o.os_estruturas.map(e => ({ os_id: o.id, ...e }))));
add("os_ancoragens", O.flatMap(o => o.os_ancoragens.map(a => ({ os_id: o.id, ...so(a, ["id", "ambiente_id", "estrutura_id", "nome", "quantidade", "wll_kgf"]) }))));
add("os_itens", O.flatMap(o => o.os_itens.map(i => ({ os_id: o.id, ...so(i, ["id", "ambiente_id", "item_cod", "quantidade", "quantidade_aerea", "observacao"]) }))));
add("os_logistica", O.map(o => ({ os_id: o.id, observacao: o.os_logistica.observacao })));
add("os_veiculo_dias", O.flatMap(o => o.os_veiculo_dias.map(v => ({ os_id: o.id, ...v }))));
add("os_escala", O.flatMap(o => o.os_escala.map(e => ({ os_id: o.id, ...e }))));

add("ordens_carga", D.cargas.map(c => ({ ...so(c, ["id", "codigo", "os_id", "evento_avulso", "data_carga", "hora_carga", "data_descarga", "veiculo", "equipe", "observacao"]), status: "Liberada" })));
add("osc_itens", D.cargas.flatMap(c => c.osc_itens.map(i => ({ ordem_carga_id: c.id, item_cod: i.item_cod, descricao: null, quantidade: i.quantidade, observacao: i.observacao }))));
add("movimentos", D.movs.map(m => so(m, ["id", "codigo", "data", "tipo", "ordem_carga_id", "referencia", "usuario_id"])));
add("movimento_linhas", D.movs.flatMap(m => m.movimento_linhas.map(l => ({ movimento_id: m.id, ...l }))));
add("reembolsos", D.RB.map(r => so(r, ["id", "os_id", "data", "descricao", "categoria", "valor", "forma", "status", "pago_por_freela", "pago_por_perfil", "pago_por_nome",
  "para_freela", "para_perfil", "para_nome", "observacao", "criado_por"])));

add("notas", D.notas.map(n => so(n, ["id", "titulo", "conteudo", "etiquetas", "cor", "fixada", "escopo", "autor_id", "os_id", "criado_em"])));
add("nota_checklist", D.notas.flatMap(n => n.nota_checklist.map(c => ({ nota_id: n.id, ordem: c.ordem, texto: c.texto, concluido: c.concluido }))));
add("compromissos", D.compromissos.map(c => ({ ...so(c, ["id", "titulo", "data", "hora", "duracao_min", "tipo", "local", "observacao"]), criado_por: G1 })));
add("compromisso_responsaveis", D.compromissos.flatMap(c => c.compromisso_responsaveis.map(r => ({ compromisso_id: c.id, perfil_id: r.perfil_id }))));
add("posts", D.posts.map(p => ({ id: p.id, autor_id: p.autor_id || G1, texto: p.texto, sistema: p.sistema, criado_em: p.criado_em })));
add("post_curtidas", D.posts.flatMap(p => p.post_curtidas.map(c => ({ post_id: p.id, perfil_id: c.perfil_id }))));
add("post_comentarios", D.posts.flatMap(p => p.post_comentarios.map(c => ({ post_id: p.id, ...c }))));
add("notificacoes", D.notificacoes.map(n => so(n, ["id", "texto", "tipo", "destino", "tela", "referencia", "criado_em"])));

add("canais", D.chat.canais.map(c => ({ id: c.id, tipo: c.tipo === "dm" ? "dm" : "@GRUPO", nome: c.nome || null, criado_em: c.criado_em, criado_por: G1 })));
add("canal_membros", D.chat.canais.flatMap(c => c.membros.filter((m, k, l) => l.findIndex(x => x.perfil_id === m.perfil_id) === k)
  .map(m => ({ canal_id: c.id, perfil_id: m.perfil_id, admin: m.admin, lido_em: m.lido_em }))));
add("mensagens", D.chat.msgs.map(m => ({ id: m.id, canal_id: m.canal_id, autor_id: m.autor_id, texto: m.texto, sistema: false, criado_em: m.criado_em })));

add("parceiros", D.parceiros.map(p => { const x = { ...p }; delete x.empresa_id; return x; }));
add("sublocacoes", D.sublocs);
add("contas", D.contas.map(c => { const x = { ...c }; delete x.empresa_id; return x; }));
add("item_fotos", D.fotos.map(f => ({ item_cod: f.item_cod, imagem: "@IMG:" + f.desenho })));

/* ---------- SQL ---------- */
const usadosDes = [...new Set(D.fotos.map(f => f.desenho))];
const svgUrl = s => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
const E = D.EMPRESA;
const sql = `-- =====================================================================
-- EventFlow · empresa de demonstração no banco real
-- Atlas Eventos & Locação: 18 pessoas nos 3 níveis, 117 equipamentos com
-- foto, kits, frota, 39 negócios, 21 OS com um ano de histórico, cargas,
-- reembolsos, contas, parceiros, sublocações, mural, chat, notas e agenda.
--
-- COMO USAR: Supabase → SQL Editor → cole o arquivo inteiro → Run.
-- Leva alguns segundos. No fim aparece uma tabela com quantos registros
-- entraram em cada parte e, se algo não entrou, o motivo.
--
-- Pode rodar de novo quando quiser: apaga só os dados desta empresa de
-- demonstração e recria tudo com datas atualizadas (os logins continuam).
-- Nenhuma outra empresa é tocada.
--
-- Logins (senha ${CFG.senha} para todos; a página de demonstração usa estes três):
--   Gerência  ${LOGIN.gerencia}
--   Produção  ${LOGIN.producao}
--   Estoque   ${LOGIN.estoque}
-- Gerado por exemplos/demo/gerar-sql.js — edite lá, não aqui.
-- =====================================================================

select set_config('demo.senha', ${Q(CFG.senha)}, false);   -- senha dos logins (definida em exemplos/demo/config.js)
select set_config('demo.emp', ${Q(E.id)}, false);
select set_config('demo.parc', ${Q(D.PARC_EMP)}, false);

-- ---------- ferramentas temporárias (somem ao fechar a sessão) ----------
drop table if exists pg_temp.demo_res;
create temp table demo_res(ordem serial, tabela text, ok int default 0, falhas int default 0, erro text);
drop table if exists pg_temp.demo_img;
create temp table demo_img(tipo text primary key, url text);

/* datas relativas: "@D:-3" → 3 dias atrás; "@T:-1:14:30" → ontem às 14h30 (horário de Brasília) */
create or replace function pg_temp.fix(j jsonb) returns jsonb language plpgsql as $f$
declare s text; m text[];
begin
  case jsonb_typeof(j)
  when 'object' then
    return (select coalesce(jsonb_object_agg(k, pg_temp.fix(v)), '{}'::jsonb) from jsonb_each(j) e(k, v));
  when 'array' then
    return (select coalesce(jsonb_agg(pg_temp.fix(v) order by n), '[]'::jsonb) from jsonb_array_elements(j) with ordinality a(v, n));
  when 'string' then
    s := j #>> '{}';
    if s ~ '^@D:-?\\d+$' then
      return to_jsonb(((now() at time zone 'America/Sao_Paulo')::date + substr(s, 4)::int)::text);
    end if;
    m := regexp_match(s, '^@T:(-?\\d+):(\\d\\d):(\\d\\d)$');
    if m is not null then
      return to_jsonb((((now() at time zone 'America/Sao_Paulo')::date + m[1]::int) + make_time(m[2]::int, m[3]::int, 0)) at time zone 'America/Sao_Paulo');
    end if;
    if s = '@GRUPO' then
      return to_jsonb(coalesce((select e.enumlabel from pg_enum e join pg_type t on t.oid = e.enumtypid
                                 where t.typname = 'tipo_canal' and e.enumlabel not in ('dm', 'os', 'direta', 'direto')
                                 order by (e.enumlabel in ('grupo', 'equipe', 'geral')) desc, e.enumsortorder limit 1), 'grupo'));
    end if;
    if s like '@IMG:%' then
      return to_jsonb((select url from pg_temp.demo_img where tipo = substr(s, 6)));
    end if;
    return j;
  else
    return j;
  end case;
end $f$;

/* grava uma linha só com as colunas que existem na tabela; empresa_id entra sozinho.
   Se a linha falhar, anota o motivo e segue com as outras. */
create or replace function pg_temp.ins(t text, d jsonb) returns boolean language plpgsql as $f$
declare cols text;
begin
  d := jsonb_strip_nulls(pg_temp.fix(d));
  d := coalesce((select jsonb_object_agg(k, v) from jsonb_each(d) e(k, v) where v <> '""'::jsonb), '{}'::jsonb);
  if exists(select 1 from information_schema.columns where table_schema = 'public' and table_name = t and column_name = 'empresa_id')
     and not d ? 'empresa_id' then
    d := d || jsonb_build_object('empresa_id', current_setting('demo.emp'));
  end if;
  select string_agg(quote_ident(c.column_name), ',' order by c.ordinal_position) into cols
    from information_schema.columns c
   where c.table_schema = 'public' and c.table_name = t and d ? c.column_name
     and c.is_generated = 'NEVER' and coalesce(c.identity_generation, '') <> 'ALWAYS';
  if cols is null then raise exception 'tabela % não existe ou não tem as colunas esperadas', t; end if;
  execute format('insert into public.%I (%s) select %s from jsonb_populate_record(null::public.%I, $1)', t, cols, cols, t) using d;
  return true;
exception when others then
  update pg_temp.demo_res set falhas = falhas + 1, erro = coalesce(erro, sqlerrm) where tabela = t;
  return false;
end $f$;

create or replace function pg_temp.lote(t text, linhas jsonb) returns void language plpgsql as $f$
declare x jsonb; n int := 0;
begin
  insert into pg_temp.demo_res(tabela) values (t);
  if to_regclass('public.' || t) is null then
    update pg_temp.demo_res set falhas = jsonb_array_length(linhas), erro = 'tabela não existe neste banco' where tabela = t;
    return;
  end if;
  for x in select * from jsonb_array_elements(linhas) loop
    if pg_temp.ins(t, x) then n := n + 1; end if;
  end loop;
  update pg_temp.demo_res set ok = n where tabela = t;
end $f$;

/* age como uma pessoa da empresa: valores padrão e gatilhos que usam auth.uid() funcionam */
create or replace function pg_temp.como(u uuid) returns void language sql as $f$
  select set_config('request.jwt.claim.sub', u::text, false),
         set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, false),
         set_config('request.jwt.claim.role', 'authenticated', false);
$f$;

-- ---------- 1 · empresa (e a parceira que também usa o EventFlow) ----------
do $$
declare emp uuid := current_setting('demo.emp')::uuid; parc uuid := current_setting('demo.parc')::uuid;
begin
  if not exists(select 1 from public.empresas where id = emp) then
    insert into pg_temp.demo_res(tabela) values ('empresas');
    if pg_temp.ins('empresas', ${J({ id: E.id, nome: E.nome + " (demonstração)", documento: E.documento, ativa: true, ativo: true, telefone: E.telefone, email: E.email, site: E.site, endereco: E.endereco, cidade: E.cidade })}) then
      update pg_temp.demo_res set ok = ok + 1 where tabela = 'empresas';
    end if;
  end if;
  if not exists(select 1 from public.empresas where id = parc) then
    insert into pg_temp.demo_res(tabela) values ('empresa parceira');
    if pg_temp.ins('empresas', ${J({ id: D.PARC_EMP, nome: "Sonora Locações (demonstração)", ativa: true, ativo: true })}) then
      update pg_temp.demo_res set ok = ok + 1 where tabela = 'empresa parceira';
    end if;
  end if;
  if not exists(select 1 from public.empresas where id = emp) then
    raise exception 'Não consegui criar a empresa de demonstração: %', (select erro from pg_temp.demo_res where tabela = 'empresas' and erro is not null limit 1);
  end if;
end $$;

-- ---------- 2 · limpa os dados antigos desta empresa (só dela) ----------
do $$
declare emp uuid := current_setting('demo.emp')::uuid; r record; passada int; sobrou boolean;
begin
  begin
    if to_regclass('public.ordens_carga') is not null then
      update public.ordens_carga set status = 'Liberada' where empresa_id = emp and status <> 'Liberada';
    end if;
  exception when others then null;
  end;
  for passada in 1..8 loop
    sobrou := false;
    for r in select c.table_name from information_schema.columns c join information_schema.tables t
                on t.table_schema = c.table_schema and t.table_name = c.table_name and t.table_type = 'BASE TABLE'
              where c.table_schema = 'public' and c.column_name = 'empresa_id'
                and c.table_name not in ('empresas', 'perfis') and c.table_name !~* '(owner|plataforma)' loop
      begin
        execute format('delete from public.%I where empresa_id = $1', r.table_name) using emp;
      exception when others then sobrou := true;
      end;
    end loop;
    exit when not sobrou;
  end loop;
  if to_regclass('public.sublocacoes') is not null then
    delete from public.sublocacoes where solicitante_empresa_id = emp or fornecedor_empresa_id = emp;
  end if;
end $$;

-- ---------- 3 · logins e perfis ----------
do $$
declare emp uuid := current_setting('demo.emp')::uuid; senha text := current_setting('demo.senha'); p jsonb; u uuid; cols text;
begin
  insert into pg_temp.demo_res(tabela) values ('logins (auth.users)'), ('perfis');
  for p in select * from jsonb_array_elements(${J(pessoas)}) loop
    u := (p->>'id')::uuid;
    begin
      if exists(select 1 from auth.users where lower(email) = lower(p->>'email') and id <> u) then
        raise exception 'o e-mail % já é usado por outro login', p->>'email';
      end if;
      insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                              raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                              confirmation_token, recovery_token, email_change_token_new, email_change)
      values ('00000000-0000-0000-0000-000000000000', u, 'authenticated', 'authenticated', p->>'email',
              crypt(senha, gen_salt('bf')), now(),
              jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'empresa_id', emp, 'papel', p->>'papel'),
              jsonb_build_object('nome', p->>'nome'), now(), now(), '', '', '', '')
      on conflict (id) do update set encrypted_password = excluded.encrypted_password,
             raw_app_meta_data = excluded.raw_app_meta_data, email_confirmed_at = coalesce(auth.users.email_confirmed_at, now()),
             banned_until = null, updated_at = now();
      insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (gen_random_uuid(), u, u::text, jsonb_build_object('sub', u::text, 'email', p->>'email', 'email_verified', true),
              'email', now(), now(), now())
      on conflict do nothing;
      update pg_temp.demo_res set ok = ok + 1 where tabela = 'logins (auth.users)';
    exception when others then
      update pg_temp.demo_res set falhas = falhas + 1, erro = coalesce(erro, sqlerrm) where tabela = 'logins (auth.users)';
      continue;
    end;
    /* o gatilho de novo usuário costuma criar o perfil; aqui ele é completado (ou criado) */
    begin
      if not exists(select 1 from public.perfis where id = u) then
        if not pg_temp.ins('perfis', jsonb_build_object('id', u, 'nome', p->>'nome', 'papel', p->>'papel', 'empresa_id', emp)) then
          raise exception '%', (select erro from pg_temp.demo_res where tabela = 'perfis');
        end if;
      end if;
      select string_agg(format('%I = (select %I from jsonb_populate_record(null::public.perfis, $1))', column_name, column_name), ', ') into cols
        from information_schema.columns where table_schema = 'public' and table_name = 'perfis'
         and column_name in ('nome', 'cargo', 'cor', 'papel', 'empresa_id', 'ativo', 'email');
      execute format('update public.perfis set %s where id = $2', cols)
        using jsonb_build_object('nome', p->>'nome', 'cargo', p->>'cargo', 'cor', p->>'cor', 'papel', p->>'papel', 'empresa_id', emp, 'ativo', true, 'email', p->>'email'), u;
      update pg_temp.demo_res set ok = ok + 1 where tabela = 'perfis';
    exception when others then
      update pg_temp.demo_res set falhas = falhas + 1, erro = coalesce(erro, sqlerrm) where tabela = 'perfis';
    end;
  end loop;
end $$;

-- ---------- 4 · ilustrações dos equipamentos ----------
insert into pg_temp.demo_img(tipo, url)
select key, value #>> '{}' from jsonb_each(${J(Object.fromEntries(usadosDes.map(t => [t, svgUrl(D.DESENHOS[t])])))});

-- ---------- 5 · conteúdo, gravado como a diretora (gerência) ----------
select pg_temp.como(${Q(G1)});
${T.map(([t, linhas]) => `select pg_temp.lote('${t}', ${J(linhas)});`).join("\n")}

/* cargas: agora que itens e movimentos existem, cada uma recebe o status real */
do $$
declare x jsonb;
begin
  insert into pg_temp.demo_res(tabela) values ('ordens_carga · status');
  for x in select * from jsonb_array_elements(${J(D.cargas.filter(c => c.status !== "Liberada").map(c => ({ id: c.id, status: c.status })))}) loop
    begin
      /* o status é um tipo próprio do banco: converte pelo tipo da coluna */
      update public.ordens_carga
         set status = (select r.status from jsonb_populate_record(null::public.ordens_carga, jsonb_build_object('status', x->>'status')) r)
       where id = (x->>'id')::uuid;
      update pg_temp.demo_res set ok = ok + 1 where tabela = 'ordens_carga · status';
    exception when others then
      update pg_temp.demo_res set falhas = falhas + 1, erro = coalesce(erro, sqlerrm) where tabela = 'ordens_carga · status';
    end;
  end loop;
end $$;

/* negócio ↔ OS: alguns bancos guardam o vínculo também no negócio */
do $$
declare o record;
begin
  if exists(select 1 from information_schema.columns where table_schema = 'public' and table_name = 'negocios' and column_name = 'os_id') then
    for o in select id, negocio_id from public.ordens_venda where negocio_id is not null and empresa_id = current_setting('demo.emp')::uuid loop
      update public.negocios set os_id = o.id where id = o.negocio_id;
    end loop;
  end if;
exception when others then
  insert into pg_temp.demo_res(tabela, falhas, erro) values ('negocios.os_id', 1, sqlerrm);
end $$;

select set_config('request.jwt.claim.sub', '', false), set_config('request.jwt.claims', '', false), set_config('request.jwt.claim.role', '', false);

-- ---------- resultado ----------
select tabela as "parte", ok as "gravados", falhas as "não gravados", coalesce(erro, '') as "primeiro motivo"
  from pg_temp.demo_res order by falhas > 0 desc, ordem;
`;
fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
fs.writeFileSync(SAIDA, fixa(sql));
console.log(`${path.relative(RAIZ, SAIDA)} · ${(sql.length / 1024).toFixed(0)} KB · ${T.reduce((s, [, l]) => s + l.length, 0)} registros em ${T.length} tabelas`);
