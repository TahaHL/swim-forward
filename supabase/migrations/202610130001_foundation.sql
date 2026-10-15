-- Single-operation application, with explicit organisation scope for future growth.
-- Apply with the Supabase migration role. Never expose the service role to browsers.
create type public.assessment_status as enum ('needs_practice','fair','good','pass');
create table public.profiles (
 id uuid primary key references auth.users on delete cascade,
 display_name text not null default '', disabled_at timestamptz,
 created_at timestamptz not null default now()
);
create table public.organisations (
 id uuid primary key default gen_random_uuid(), name text not null,
 retention_months integer not null default 24 check(retention_months between 1 and 120),
 criteria_confirmed_at timestamptz
);
create table public.memberships (
 organisation_id uuid references public.organisations on delete cascade,
 user_id uuid references public.profiles on delete cascade,
 role text not null check(role in ('admin','instructor')),
 primary key(organisation_id,user_id)
);
create table public.venues (
 id uuid primary key default gen_random_uuid(), organisation_id uuid not null references public.organisations,
 name text not null, address text not null default '', timezone text not null default 'Europe/London',
 unique(id,organisation_id)
);
create table public.programmes (
 id uuid primary key default gen_random_uuid(), organisation_id uuid not null references public.organisations,
 name text not null, description text not null default '', active boolean not null default true,
 unique(id,organisation_id)
);
create table public.blocks (
 id uuid primary key default gen_random_uuid(), organisation_id uuid not null references public.organisations,
 programme_id uuid not null, venue_id uuid not null,
 name text not null, format text not null check(format in ('one_to_one','small_group')),
 capacity integer not null check(capacity between 1 and 50), price_pence integer not null check(price_pence>0),
 currency text not null default 'gbp' check(currency='gbp'), starts_on date not null, ends_on date not null,
 bookable boolean not null default false,
 check(ends_on>=starts_on), check(format<>'one_to_one' or capacity=1),
 foreign key(programme_id,organisation_id) references public.programmes(id,organisation_id),
 foreign key(venue_id,organisation_id) references public.venues(id,organisation_id), unique(id,organisation_id)
);
create table public.block_instructors (
 block_id uuid references public.blocks on delete cascade,
 instructor_id uuid references public.profiles, primary key(block_id,instructor_id)
);
create table public.sessions (
 id uuid primary key default gen_random_uuid(), block_id uuid not null references public.blocks,
 week integer not null check(week between 1 and 6), starts_at timestamptz not null,
 ends_at timestamptz not null, cancelled boolean not null default false,
 check(ends_at>starts_at), unique(block_id,week), unique(id,block_id)
);
create table public.swimmers (
 id uuid primary key default gen_random_uuid(), organisation_id uuid not null references public.organisations,
 first_name text not null check(length(first_name) between 1 and 80),
 last_name text not null check(length(last_name) between 1 and 80),
 birth_year integer not null check(birth_year between 2000 and 2100), lesson_stage text not null default '',
 retention_due_at timestamptz, created_at timestamptz not null default now(), unique(id,organisation_id)
);
create table public.parent_swimmers (
 swimmer_id uuid references public.swimmers on delete cascade, parent_id uuid references public.profiles,
 linked_at timestamptz not null default now(), primary key(swimmer_id,parent_id)
);
create table public.enrolments (
 block_id uuid references public.blocks, swimmer_id uuid references public.swimmers on delete cascade,
 primary key(block_id,swimmer_id)
);
create table public.skills (
 id uuid primary key default gen_random_uuid(), organisation_id uuid not null references public.organisations,
 legacy_id text, stroke text not null, category text not null, title text not null,
 explanation text not null default '', criteria jsonb not null default '[]'::jsonb,
 teacher_cues jsonb not null default '[]'::jsonb, common_mistakes jsonb not null default '[]'::jsonb,
 video_url text, retired_at timestamptz, approved_at timestamptz,
 unique(organisation_id,legacy_id), unique(id,organisation_id)
);
create table public.swimmer_skills (
 swimmer_id uuid references public.swimmers on delete cascade, skill_id uuid references public.skills,
 goal text not null default '', primary key(swimmer_id,skill_id)
);
create table public.updates (
 id uuid primary key default gen_random_uuid(), swimmer_id uuid not null references public.swimmers on delete cascade,
 session_id uuid not null references public.sessions, author_id uuid not null references public.profiles,
 note text not null check(length(note) between 1 and 1500), focus text not null check(length(focus) between 1 and 300),
 created_at timestamptz not null default now(), request_id uuid not null unique,
 unique(swimmer_id,session_id)
);
create table public.assessments (
 id uuid primary key default gen_random_uuid(), sequence bigint generated always as identity unique,
 update_id uuid not null references public.updates on delete cascade,
 swimmer_id uuid not null references public.swimmers on delete cascade, skill_id uuid not null references public.skills,
 status public.assessment_status, observation text not null default '' check(length(observation)<=1000),
 target text not null default '' check(length(target)<=500), author_id uuid not null references public.profiles,
 criteria_snapshot jsonb not null, created_at timestamptz not null default now(), unique(update_id,skill_id)
);
create table public.internal_notes (
 update_id uuid primary key references public.updates on delete cascade,
 swimmer_id uuid not null references public.swimmers on delete cascade,
 body text not null check(length(body)<=2000), author_id uuid not null references public.profiles
);
create table public.attendance (
 session_id uuid references public.sessions, swimmer_id uuid references public.swimmers on delete cascade,
 status text not null check(status in ('present','absent','excused')), primary key(session_id,swimmer_id)
);
create table public.audit_logs (
 id bigint generated always as identity primary key, organisation_id uuid not null references public.organisations,
 swimmer_id uuid references public.swimmers on delete cascade, actor_id uuid references public.profiles,
 action text not null, entity_id uuid, old_value jsonb, new_value jsonb, created_at timestamptz not null default now()
);
create table public.notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles on delete cascade,
 swimmer_id uuid references public.swimmers on delete cascade, kind text not null,
 read_at timestamptz, created_at timestamptz not null default now()
);
create table public.consents (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles on delete cascade,
 notice_version text not null, accepted_at timestamptz not null default now(), unique(user_id,notice_version)
);
create table public.deletion_requests (
 id uuid primary key default gen_random_uuid(), swimmer_id uuid not null references public.swimmers on delete cascade,
 requested_by uuid not null references public.profiles, created_at timestamptz not null default now(), resolved_at timestamptz
);
create table public.bookings (
 id uuid primary key default gen_random_uuid(), block_id uuid not null references public.blocks,
 swimmer_id uuid not null references public.swimmers on delete cascade, parent_id uuid not null references public.profiles,
 status text not null default 'reserved' check(status in ('reserved','paid','expired','cancelled','refunded')),
 amount_pence integer not null, currency text not null default 'gbp', expires_at timestamptz not null default now()+interval '30 minutes',
 checkout_id text unique, payment_intent_id text unique, created_at timestamptz not null default now()
);
create unique index one_active_booking on public.bookings(block_id,swimmer_id) where status in ('reserved','paid');
create table public.payment_events (
 id text primary key, booking_id uuid references public.bookings on delete set null,
 kind text not null, received_at timestamptz not null default now()
);
create table public.parent_invitations (
 id uuid primary key default gen_random_uuid(), swimmer_id uuid not null references public.swimmers on delete cascade,
 email text not null, token_hash text not null unique,
 expires_at timestamptz not null default now()+interval '7 days', accepted_at timestamptz, revoked_at timestamptz
);

-- Helpers use a locked search path and derive identity from verified Supabase JWTs.
create function public.is_active() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=auth.uid() and disabled_at is null)
$$;
create function public.is_admin(org uuid) returns boolean language sql stable security definer set search_path='' as $$
 select public.is_active() and exists(select 1 from public.memberships where organisation_id=org and user_id=auth.uid() and role='admin')
$$;
create function public.teaches_block(b uuid) returns boolean language sql stable security definer set search_path='' as $$
 select public.is_active() and exists(select 1 from public.blocks x where x.id=b and
 (public.is_admin(x.organisation_id) or exists(select 1 from public.block_instructors i join public.memberships m
 on m.organisation_id=x.organisation_id and m.user_id=i.instructor_id where i.block_id=b and i.instructor_id=auth.uid())))
$$;
create function public.can_teach(s uuid) returns boolean language sql stable security definer set search_path='' as $$
 select public.is_active() and exists(select 1 from public.swimmers w where w.id=s and
 (public.is_admin(w.organisation_id) or exists(select 1 from public.enrolments e where e.swimmer_id=s and public.teaches_block(e.block_id))))
$$;
create function public.is_parent(s uuid) returns boolean language sql stable security definer set search_path='' as $$
 select public.is_active() and exists(select 1 from public.parent_swimmers where swimmer_id=s and parent_id=auth.uid())
$$;
create function public.can_view(s uuid) returns boolean language sql stable security definer set search_path='' as $$
 select public.is_parent(s) or public.can_teach(s)
$$;
create function public.can_view_block(b uuid) returns boolean language sql stable security definer set search_path='' as $$
 select public.teaches_block(b) or (public.is_active() and exists(select 1 from public.enrolments e where e.block_id=b and public.is_parent(e.swimmer_id)))
$$;
create function public.new_profile() returns trigger language plpgsql security definer set search_path='' as $$
 begin insert into public.profiles(id) values(new.id); return new; end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.new_profile();

-- Default deny. Explicit grants do not bypass RLS.
do $$ declare t text; begin
 foreach t in array array['profiles','organisations','memberships','venues','programmes','blocks','block_instructors','sessions','swimmers','parent_swimmers','enrolments','skills','swimmer_skills','updates','assessments','internal_notes','attendance','audit_logs','notifications','consents','deletion_requests','bookings','payment_events','parent_invitations'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 end loop;
end $$;
create policy own_profile on public.profiles for select to authenticated using(id=auth.uid() and public.is_active());
create policy memberships_read on public.memberships for select to authenticated using(public.is_active() and (user_id=auth.uid() or public.is_admin(organisation_id)));
create policy org_read on public.organisations for select to authenticated using(public.is_active());
create policy venues_read on public.venues for select to authenticated using(public.is_active());
create policy programmes_read on public.programmes for select to authenticated using(public.is_active());
create policy blocks_read on public.blocks for select to authenticated using(public.is_active() and (bookable or public.can_view_block(id)));
create policy instructors_read on public.block_instructors for select to authenticated using(public.teaches_block(block_id));
create policy sessions_read on public.sessions for select to authenticated using(public.can_view_block(block_id));
create policy swimmers_read on public.swimmers for select to authenticated using(public.can_view(id));
create policy links_read on public.parent_swimmers for select to authenticated using(public.is_active() and (parent_id=auth.uid() or public.can_teach(swimmer_id)));
create policy enrolments_read on public.enrolments for select to authenticated using(public.can_view(swimmer_id));
create policy skills_read on public.skills for select to authenticated using(public.is_active() and (approved_at is not null or public.is_admin(organisation_id)));
create policy selected_skills_read on public.swimmer_skills for select to authenticated using(public.can_view(swimmer_id));
create policy updates_read on public.updates for select to authenticated using(public.can_view(swimmer_id));
create policy assessments_read on public.assessments for select to authenticated using(public.can_view(swimmer_id));
create policy internal_read on public.internal_notes for select to authenticated using(public.can_teach(swimmer_id));
create policy attendance_read on public.attendance for select to authenticated using(public.can_view(swimmer_id));
create policy audit_read on public.audit_logs for select to authenticated using(public.is_admin(organisation_id));
create policy notifications_read on public.notifications for select to authenticated using(user_id=auth.uid() and public.is_active() and (swimmer_id is null or public.can_view(swimmer_id)));
create policy consents_read on public.consents for select to authenticated using(user_id=auth.uid() and public.is_active());
create policy deletion_read on public.deletion_requests for select to authenticated using(public.can_view(swimmer_id));
create policy bookings_read on public.bookings for select to authenticated using(public.is_active() and (parent_id=auth.uid() or exists(select 1 from public.blocks b where b.id=block_id and public.is_admin(b.organisation_id))));
create policy invitations_read on public.parent_invitations for select to authenticated using(public.can_teach(swimmer_id));

-- Admin writes on configuration only. Assessments/history are function-only and append-only.
do $$ declare t text; begin
 foreach t in array array['venues','programmes','blocks','swimmers','skills'] loop
 execute format('grant insert,update on public.%I to authenticated',t);
 execute format('create policy admin_write on public.%I for all to authenticated using(public.is_admin(organisation_id)) with check(public.is_admin(organisation_id))',t);
 end loop;
end $$;
grant insert,update on public.sessions to authenticated;
create policy sessions_admin on public.sessions for all to authenticated using(exists(select 1 from public.blocks b where b.id=block_id and public.is_admin(b.organisation_id))) with check(exists(select 1 from public.blocks b where b.id=block_id and public.is_admin(b.organisation_id)));

create function public.publish_update(p_swimmer uuid,p_session uuid,p_note text,p_focus text,p_ratings jsonb,p_internal text,p_request uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid; r jsonb; previous jsonb; org uuid; skill public.skills; sess public.sessions;
begin
 select * into sess from public.sessions where id=p_session for update;
 if not public.can_teach(p_swimmer) or not public.teaches_block(sess.block_id) or sess.cancelled
 or not exists(select 1 from public.enrolments where swimmer_id=p_swimmer and block_id=sess.block_id)
 then raise exception 'Not authorised' using errcode='42501'; end if;
 select id into u from public.updates where request_id=p_request and swimmer_id=p_swimmer and author_id=auth.uid();
 if u is not null then return u; end if;
 if jsonb_typeof(p_ratings)<>'array' or jsonb_array_length(p_ratings)>100 then raise exception 'Invalid ratings'; end if;
 select organisation_id into org from public.swimmers where id=p_swimmer;
 insert into public.updates(swimmer_id,session_id,author_id,note,focus,request_id)
 values(p_swimmer,p_session,auth.uid(),p_note,p_focus,p_request) returning id into u;
 for r in select * from jsonb_array_elements(p_ratings) loop
 select * into skill from public.skills where id=(r->>'skill_id')::uuid and organisation_id=org and approved_at is not null and retired_at is null;
 if skill.id is null or not exists(select 1 from public.swimmer_skills where swimmer_id=p_swimmer and skill_id=skill.id) then raise exception 'Skill is not approved and selected'; end if;
 select jsonb_build_object('status',status,'observation',observation,'target',target) into previous from public.assessments where swimmer_id=p_swimmer and skill_id=skill.id order by sequence desc limit 1;
 insert into public.assessments(update_id,swimmer_id,skill_id,status,observation,target,author_id,criteria_snapshot)
 values(u,p_swimmer,skill.id,(r->>'status')::public.assessment_status,coalesce(r->>'observation',''),coalesce(r->>'target',''),auth.uid(),skill.criteria);
 insert into public.audit_logs(organisation_id,swimmer_id,actor_id,action,entity_id,old_value,new_value)
 values(org,p_swimmer,auth.uid(),'assessment.published',skill.id,previous,r);
 end loop;
 if length(coalesce(p_internal,''))>0 then insert into public.internal_notes values(u,p_swimmer,p_internal,auth.uid()); end if;
 insert into public.notifications(user_id,swimmer_id,kind) select parent_id,p_swimmer,'assessment_published' from public.parent_swimmers where swimmer_id=p_swimmer;
 return u;
end $$;

create function public.reserve_booking(p_block uuid,p_swimmer uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare b public.blocks; s public.swimmers; result uuid; used integer;
begin
 if not public.is_parent(p_swimmer) then raise exception 'Not authorised' using errcode='42501'; end if;
 select * into b from public.blocks where id=p_block for update;
 select * into s from public.swimmers where id=p_swimmer;
 if b.id is null or not b.bookable or b.organisation_id<>s.organisation_id or b.starts_on<current_date then raise exception 'Block unavailable'; end if;
 update public.bookings set status='expired' where block_id=p_block and status='reserved' and expires_at<now();
 select id into result from public.bookings where block_id=p_block and swimmer_id=p_swimmer and parent_id=auth.uid() and status='reserved';
 if result is not null then return result; end if;
 select count(*) into used from public.bookings where block_id=p_block and status in ('reserved','paid');
 if used>=b.capacity then raise exception 'No places available'; end if;
 insert into public.bookings(block_id,swimmer_id,parent_id,amount_pence,currency) values(p_block,p_swimmer,auth.uid(),b.price_pence,b.currency) returning id into result;
 return result;
end $$;

create function public.accept_notice(p_version text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_active() or p_version<>'template-2026-10' then raise exception 'Notice unavailable'; end if;
 insert into public.consents(user_id,notice_version) values(auth.uid(),p_version) on conflict do nothing;
end $$;
create function public.request_deletion(p_swimmer uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_parent(p_swimmer) then raise exception 'Not authorised' using errcode='42501'; end if;
 insert into public.deletion_requests(swimmer_id,requested_by) values(p_swimmer,auth.uid());
end $$;
-- Default PUBLIC EXECUTE is unsafe for definer functions; grant only explicit entrypoints.
revoke all on all functions in schema public from public,anon;
grant execute on function public.is_active(),public.is_admin(uuid),public.teaches_block(uuid),public.can_teach(uuid),public.is_parent(uuid),public.can_view(uuid),public.can_view_block(uuid) to authenticated;
grant execute on function public.publish_update(uuid,uuid,text,text,jsonb,text,uuid),public.reserve_booking(uuid,uuid),public.accept_notice(text),public.request_deletion(uuid) to authenticated;
create index assessments_latest on public.assessments(swimmer_id,skill_id,sequence desc);
create index parent_lookup on public.parent_swimmers(parent_id);
create index instructor_lookup on public.block_instructors(instructor_id);
create index updates_swimmer on public.updates(swimmer_id,created_at desc);
