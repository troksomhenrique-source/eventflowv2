-- =====================================================================
-- EventFlow · migração 0013
-- Corrige: relation "os_viagens" does not exist ao gerar a Ordem de Carga.
--
-- gerar_ordem_carga ainda montava "veículo" e "equipe" da ordem a partir de
-- os_viagens / viagem_equipe, do modelo antigo de logística. O app grava
-- hoje em os_veiculo_dias (veículo por dia) e os_escala (pessoa por dia).
-- Só esse trecho muda; validações, itens e status continuam iguais.
-- =====================================================================
create or replace function public.gerar_ordem_carga(p_os uuid)
 returns ordens_carga
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v_os ordens_venda; v_oc ordens_carga; v_veic text; v_eq text;
        v_falta text; v_pend integer; v_emp uuid;
begin
  if not (e_producao() or e_gerencia()) then
    raise exception 'Apenas produção ou gerência podem emitir a ordem de carga.';
  end if;
  select * into v_os from ordens_venda where id = p_os for update;
  if not found then raise exception 'OS não encontrada.'; end if;
  if not pode_editar_os(p_os) then raise exception 'Você não está escalado para esta OS.' using errcode='42501'; end if;
  perform 1 from itens where cod in (select item_cod from os_itens where os_id=p_os) order by cod for update;
  if exists (select 1 from ordens_carga where os_id = p_os) then
    raise exception 'Esta OS já possui ordem de carga.';
  end if;

  select string_agg(a.nome, ', ' order by a.ordem) into v_falta
    from os_ambientes a
    left join os_memorial m on m.ambiente_id = a.id
   where a.os_id = p_os
     and (m.ambiente_id is null or not m.solo_concluido or not m.aereo_concluido);
  if v_falta is not null then
    raise exception 'Faltam memoriais concluídos em: %.', v_falta;
  end if;

  -- e nenhuma estrutura ou zona pode estar reprovada
  select string_agg(x.rotulo, ', ') into v_falta from (
    select ambiente || ' · ' || estrutura as rotulo
      from v_memorial_aereo where os_id = p_os and not aprovado
    union all
    select ambiente || ' · ' || zona
      from v_memorial_solo  where os_id = p_os and not aprovado) x;
  if v_falta is not null then
    raise exception 'Verificação reprovada em: %.', v_falta;
  end if;

  if coalesce(length(trim(v_os.descritivo)),0) < 40 then
    raise exception 'O descritivo técnico ainda não está escrito.';
  end if;

  select count(*) into v_pend from os_itens
   where os_id = p_os and item_cod is not null and quantidade_aerea is null;
  if v_pend > 0 then
    raise exception '% linha(s) do escopo ainda sem aplicação definida.', v_pend;
  end if;

  -- veículos escalados na OS (os_veiculo_dias), na ordem do primeiro dia de uso.
  -- A função é security definer: o código do veículo só vale dentro da empresa
  -- de quem emite, para não juntar a frota de outra locadora com o mesmo código.
  select p.empresa_id into v_emp from perfis p where p.id = auth.uid();
  select string_agg(x.nome || ' · ' || coalesce(nullif(x.placa,''),'sem placa'), ' + ' order by x.primeiro, x.nome)
    into v_veic
    from (select f.nome, f.placa, min(d.data) as primeiro
            from os_veiculo_dias d
            join frota f on f.cod = d.veiculo_cod and f.empresa_id = v_emp
           where d.os_id = p_os
           group by f.nome, f.placa) x;

  -- pessoas escaladas (os_escala), contadas uma vez cada, e veículos distintos
  select case when count(*) = 0 then null else
           count(distinct coalesce(e.freelancer_id::text, e.perfil_id::text, lower(trim(e.nome))))::text
           || ' pessoa(s) em '
           || (select count(distinct d.veiculo_cod) from os_veiculo_dias d where d.os_id = p_os)::text
           || ' veículo(s)' end
    into v_eq
    from os_escala e where e.os_id = p_os;

  insert into ordens_carga (codigo, os_id, status, data_carga, hora_carga, data_descarga,
                            veiculo, equipe, observacao)
  values (proximo_codigo('OSC','seq_ordem_carga'), p_os, 'Liberada',
          v_os.montagem, '07:00', v_os.desmontagem,
          coalesce(v_veic,'A definir na roteirização'), coalesce(v_eq,'A escalar'),
          'Gerada a partir de ' || v_os.codigo)
  returning * into v_oc;

  -- o galpão separa por item, não por sala nem por vara: soma tudo e anota
  -- a divisão na linha, para quem carrega saber o que vai para onde
  insert into osc_itens (ordem_carga_id, item_cod, quantidade, observacao)
  select v_oc.id, oi.item_cod, sum(oi.quantidade)::int,
         case when count(*) > 1
              then string_agg(coalesce(a.nome,'—') ||
                     case when e.nome is not null then ' / ' || e.nome else '' end ||
                     ' ' || oi.quantidade, ' · ' order by a.ordem, e.ordem) end
    from os_itens oi
    left join os_ambientes  a on a.id = oi.ambiente_id
    left join os_estruturas e on e.id = oi.estrutura_id and coalesce(oi.quantidade_aerea,0) > 0
   where oi.os_id = p_os and oi.item_cod is not null
   group by oi.item_cod;

  insert into osc_itens (ordem_carga_id, item_cod, descricao, quantidade, observacao)
  select v_oc.id, null, oi.descricao, oi.quantidade,
         nullif(concat_ws(' · ', a.nome, nullif(oi.observacao,'')), '')
    from os_itens oi
    left join os_ambientes a on a.id = oi.ambiente_id
   where oi.os_id = p_os and oi.item_cod is null;

  update ordens_venda set status = 'Liberada' where id = p_os;
  return v_oc;
end $function$;
