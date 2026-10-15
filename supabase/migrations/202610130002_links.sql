create function public.admin_link(p_kind text,p_org uuid,p_values jsonb) returns void language plpgsql security definer set search_path='' as $$
declare b uuid:=(p_values->>'block_id')::uuid; s uuid:=(p_values->>'swimmer_id')::uuid; k uuid:=(p_values->>'skill_id')::uuid; u uuid:=(p_values->>'user_id')::uuid;
begin
 if not public.is_admin(p_org) then raise exception 'Not authorised' using errcode='42501'; end if;
 if b is not null and not exists(select 1 from public.blocks where id=b and organisation_id=p_org) then raise exception 'Invalid block'; end if;
 if s is not null and not exists(select 1 from public.swimmers where id=s and organisation_id=p_org) then raise exception 'Invalid swimmer'; end if;
 if p_kind='enrolment' then insert into public.enrolments values(b,s) on conflict do nothing;
 elsif p_kind='instructor' then
  if not exists(select 1 from public.memberships where user_id=u and organisation_id=p_org) then raise exception 'Invalid instructor'; end if;
  insert into public.block_instructors values(b,u) on conflict do nothing;
 elsif p_kind='selected_skill' then
  if not exists(select 1 from public.skills where id=k and organisation_id=p_org and retired_at is null) then raise exception 'Invalid skill'; end if;
  insert into public.swimmer_skills(swimmer_id,skill_id) values(s,k) on conflict do nothing;
 else raise exception 'Invalid link'; end if;
end $$;
revoke all on function public.admin_link(text,uuid,jsonb) from public,anon;
grant execute on function public.admin_link(text,uuid,jsonb) to authenticated;
