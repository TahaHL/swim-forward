alter table public.parent_invitations add column created_at timestamptz not null default now();
alter table public.parent_invitations add column created_by uuid references public.profiles;
create function public.invite_parent(p_swimmer uuid,p_email text,p_hash text) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if not public.can_teach(p_swimmer) then raise exception 'Not authorised' using errcode='42501'; end if;
 perform 1 from public.swimmers where id=p_swimmer for update;
 if (select count(*) from public.parent_invitations where created_by=auth.uid() and created_at>now()-interval '1 hour')>=10 then raise exception 'Invitation limit reached'; end if;
 if length(p_email)>254 or p_email!~'^[^@ ]+@[^@ ]+\.[^@ ]+$' or p_hash!~'^[a-f0-9]{64}$' then raise exception 'Invalid invitation'; end if;
 if (select count(*) from public.parent_swimmers where swimmer_id=p_swimmer)>=2 then raise exception 'Two parents already linked'; end if;
 update public.parent_invitations set revoked_at=now() where swimmer_id=p_swimmer and email=lower(p_email) and accepted_at is null;
 insert into public.parent_invitations(swimmer_id,email,token_hash,created_by) values(p_swimmer,lower(p_email),p_hash,auth.uid()) returning id into result;
 return result;
end $$;
create function public.accept_invitation(p_hash text) returns void language plpgsql security definer set search_path='' as $$
declare invitation public.parent_invitations; account_email text;
begin
 if not public.is_active() then raise exception 'Not authorised' using errcode='42501'; end if;
 select lower(email) into account_email from auth.users where id=auth.uid();
 select * into invitation from public.parent_invitations where token_hash=p_hash and email=account_email and accepted_at is null and revoked_at is null and expires_at>now() for update;
 if invitation.id is null then raise exception 'Invitation unavailable'; end if;
 perform 1 from public.swimmers where id=invitation.swimmer_id for update;
 if (select count(*) from public.parent_swimmers where swimmer_id=invitation.swimmer_id)>=2 then raise exception 'Two parents already linked'; end if;
 insert into public.parent_swimmers(swimmer_id,parent_id) values(invitation.swimmer_id,auth.uid()) on conflict do nothing;
 update public.parent_invitations set accepted_at=now() where id=invitation.id;
end $$;
create function public.manage_record(p_action text,p_id uuid,p_values jsonb) returns void language plpgsql security definer set search_path='' as $$
declare org uuid;
begin
 if p_action in ('approve_skill','retire_skill','edit_skill') then
  select organisation_id into org from public.skills where id=p_id;
  if not public.is_admin(org) then raise exception 'Not authorised' using errcode='42501'; end if;
  if p_action='approve_skill' then
   if not exists(select 1 from public.skills where id=p_id and jsonb_array_length(criteria)>0) then raise exception 'Criteria required'; end if;
   update public.skills set approved_at=now() where id=p_id;
  elsif p_action='retire_skill' then update public.skills set retired_at=now() where id=p_id;
  else
   if length(p_values->>'title') not between 1 and 100 or jsonb_typeof(p_values->'criteria')<>'array' then raise exception 'Invalid skill'; end if;
   update public.skills set title=p_values->>'title',explanation=p_values->>'explanation',criteria=p_values->'criteria',approved_at=null where id=p_id;
  end if;
 elsif p_action='open_block' then
  select organisation_id into org from public.blocks where id=p_id;
  if not public.is_admin(org) or (select count(*) from public.sessions where block_id=p_id and not cancelled)<>6 then raise exception 'Six scheduled sessions and admin access required'; end if;
  update public.blocks set bookable=true where id=p_id;
 elsif p_action='revoke_parent' then
  if not public.can_teach(p_id) then raise exception 'Not authorised' using errcode='42501'; end if;
  delete from public.parent_swimmers where swimmer_id=p_id and parent_id=(p_values->>'parent_id')::uuid;
 elsif p_action='attendance' then
  if not public.can_teach(p_id) or not exists(select 1 from public.sessions s join public.enrolments e on e.block_id=s.block_id where s.id=(p_values->>'session_id')::uuid and e.swimmer_id=p_id and public.teaches_block(s.block_id)) then raise exception 'Not authorised' using errcode='42501'; end if;
  insert into public.attendance values((p_values->>'session_id')::uuid,p_id,p_values->>'status') on conflict(session_id,swimmer_id) do update set status=excluded.status;
 else raise exception 'Unsupported action'; end if;
end $$;
revoke all on function public.invite_parent(uuid,text,text),public.accept_invitation(text),public.manage_record(text,uuid,jsonb) from public,anon;
grant execute on function public.invite_parent(uuid,text,text),public.accept_invitation(text),public.manage_record(text,uuid,jsonb) to authenticated;
