-- =====================================================================
-- EventFlow · reparo depois do limpar_base.sql
--
-- A primeira versão do limpar_base.sql reiniciava em 1 TODAS as numerações
-- automáticas do banco, inclusive as de tabelas que ela manteve (empresas,
-- perfis, controle da plataforma…). Um cadastro novo podia então receber um
-- número que já existe e ser recusado.
--
-- Este bloco só AVANÇA cada numeração para depois do maior valor já gravado
-- na coluna que a usa. Não apaga nem altera nenhum registro. Pode rodar mais
-- de uma vez sem problema.
-- =====================================================================
do $$
declare r record; mx bigint; n int := 0;
begin
  for r in
    -- colunas cujo valor padrão puxa de uma sequência (serial, nextval, identity)
    select distinct t.relname as tabela, a.attname as coluna, s.oid::regclass as seq
      from pg_class s
      join pg_namespace ns on ns.oid = s.relnamespace and ns.nspname = 'public'
      join pg_depend d on d.objid = s.oid and d.deptype in ('a','i')
      join pg_class t on t.oid = d.refobjid
      join pg_attribute a on a.attrelid = t.oid and a.attnum = d.refobjsubid
     where s.relkind = 'S'
    union
    select t.relname, a.attname, (regexp_match(pg_get_expr(ad.adbin, ad.adrelid), 'nextval\(''([^'']+)''::regclass\)'))[1]::regclass
      from pg_attrdef ad
      join pg_class t on t.oid = ad.adrelid
      join pg_namespace nt on nt.oid = t.relnamespace and nt.nspname = 'public'
      join pg_attribute a on a.attrelid = t.oid and a.attnum = ad.adnum
     where pg_get_expr(ad.adbin, ad.adrelid) like 'nextval(%'
  loop
    execute format('select max(%I)::bigint from public.%I', r.coluna, r.tabela) into mx;
    if mx is not null then
      perform setval(r.seq, greatest(mx, 1), true);
      n := n + 1;
      raise notice '% · %.% → próximo valor %', r.seq, r.tabela, r.coluna, mx + 1;
    end if;
  end loop;
  raise notice 'Numerações ajustadas: %', n;
end $$;
