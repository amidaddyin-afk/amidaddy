create or replace function public.reserve_inventory(product_uuid uuid, requested_quantity integer, note text default null)
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  if requested_quantity <= 0 then raise exception 'Quantity must be positive'; end if;
  update public.products set reserved = reserved + requested_quantity
  where id = product_uuid and deleted_at is null and active and stock - reserved >= requested_quantity;
  if not found then return false; end if;
  insert into public.inventory_movements(product_id, type, quantity, reason, actor_id)
  values (product_uuid, 'RESERVATION', requested_quantity, note, auth.uid());
  return true;
end;
$$;

create or replace function public.release_inventory(product_uuid uuid, quantity_to_release integer, note text default null)
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  update public.products set reserved = reserved - quantity_to_release where id = product_uuid and reserved >= quantity_to_release;
  if not found then return false; end if;
  insert into public.inventory_movements(product_id, type, quantity, reason, actor_id)
  values (product_uuid, 'RELEASE', -quantity_to_release, note, auth.uid());
  return true;
end;
$$;

create or replace function public.commit_inventory_sale(product_uuid uuid, sold_quantity integer, note text default null)
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  update public.products set stock = stock - sold_quantity, reserved = reserved - sold_quantity
  where id = product_uuid and stock >= sold_quantity and reserved >= sold_quantity;
  if not found then return false; end if;
  insert into public.inventory_movements(product_id, type, quantity, reason, actor_id)
  values (product_uuid, 'SALE', -sold_quantity, note, auth.uid());
  return true;
end;
$$;

create or replace function public.adjust_inventory(product_uuid uuid, adjustment integer, note text)
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() or adjustment = 0 or coalesce(length(trim(note)), 0) < 3 then return false; end if;
  update public.products set stock = stock + adjustment where id = product_uuid and stock + adjustment >= reserved and stock + adjustment >= 0;
  if not found then return false; end if;
  insert into public.inventory_movements(product_id, type, quantity, reason, actor_id)
  values (product_uuid, 'ADJUSTMENT', adjustment, note, auth.uid());
  return true;
end;
$$;

grant execute on function public.reserve_inventory(uuid, integer, text) to authenticated;
grant execute on function public.release_inventory(uuid, integer, text) to authenticated;
grant execute on function public.commit_inventory_sale(uuid, integer, text) to authenticated;
grant execute on function public.adjust_inventory(uuid, integer, text) to authenticated;
