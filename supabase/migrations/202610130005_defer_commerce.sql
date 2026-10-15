-- Owner deferred pricing and checkout. NULL means not configured, never free.
alter table public.blocks alter column price_pence drop not null;
update public.blocks set bookable=false;
revoke execute on function public.reserve_booking(uuid,uuid) from authenticated;
-- Re-enable only through a reviewed future migration, after prices and booking rules are approved.
