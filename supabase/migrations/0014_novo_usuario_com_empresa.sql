-- =====================================================================
-- EventFlow · migração 0014
-- Corrige: "Não foi possível criar a conta" ao cadastrar pessoa pelo painel
-- da plataforma.
--
-- Causa: o gatilho fn_novo_usuario (em auth.users) criava o perfil só com
-- id, nome e papel. Como perfis.empresa_id é obrigatório, o banco recusava
-- o login inteiro: null value in column "empresa_id" violates not-null.
--
-- Agora o gatilho lê a empresa dos metadados do cadastro (app_metadata ou
-- user_metadata, chave empresa_id). Sem empresa válida, ele não cria o
-- perfil e não bloqueia o login: quem cadastra (a função owner-admin)
-- completa o perfil em seguida, como já faz.
-- =====================================================================
create or replace function public.fn_novo_usuario()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_txt text := coalesce(nullif(new.raw_app_meta_data->>'empresa_id',''), nullif(new.raw_user_meta_data->>'empresa_id',''));
  v_emp uuid;
begin
  if v_txt ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select e.id into v_emp from empresas e where e.id = v_txt::uuid;
  end if;
  if v_emp is null then
    return new;   -- sem empresa conhecida: o perfil é criado por quem fez o cadastro
  end if;
  insert into perfis(id, nome, papel, empresa_id) values (new.id,
    coalesce(nullif(new.raw_user_meta_data->>'nome',''), split_part(new.email,'@',1)),
    case when new.raw_app_meta_data->>'papel' in ('gerencia','producao','estoque')
      then (new.raw_app_meta_data->>'papel')::papel else 'producao'::papel end,
    v_emp)
  on conflict (id) do nothing;
  return new;
end $function$;
