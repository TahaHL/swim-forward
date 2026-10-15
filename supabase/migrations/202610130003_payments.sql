create function public.record_payment(p_event text,p_booking uuid,p_checkout text,p_amount integer,p_currency text,p_intent text)
returns void language plpgsql security definer set search_path='' as $$
declare b public.bookings; block public.blocks; used integer;
begin
 select * into b from public.bookings where id=p_booking;
 if b.id is null then raise exception 'Unknown booking'; end if;
 -- Same lock ordering as reservation avoids capacity races and deadlocks.
 select * into block from public.blocks where id=b.block_id for update;
 select * into b from public.bookings where id=p_booking for update;
 if exists(select 1 from public.payment_events where id=p_event) then return; end if;
 if b.checkout_id is distinct from p_checkout or b.amount_pence<>p_amount or b.currency<>p_currency then raise exception 'Payment mismatch'; end if;
 if b.status='paid' and b.payment_intent_id=p_intent then insert into public.payment_events values(p_event,p_booking,'duplicate_payment',now());return;end if;
 if b.status not in ('reserved','expired') then raise exception 'Booking requires reconciliation'; end if;
 select count(*) into used from public.bookings where block_id=b.block_id and id<>b.id and (status='paid' or (status='reserved' and expires_at>now()));
 if used>=block.capacity then raise exception 'Capacity requires reconciliation'; end if;
 update public.bookings set status='paid',payment_intent_id=p_intent where id=p_booking;
 insert into public.enrolments values(b.block_id,b.swimmer_id) on conflict do nothing;
 insert into public.payment_events values(p_event,p_booking,'checkout.session.completed',now());
 insert into public.notifications(user_id,swimmer_id,kind) values(b.parent_id,b.swimmer_id,'booking_confirmed');
end $$;
revoke all on function public.record_payment(text,uuid,text,integer,text,text) from public,anon,authenticated;
grant execute on function public.record_payment(text,uuid,text,integer,text,text) to service_role;
