-- ETA de domicilio calculado en el checkout (restaurante → dirección
-- del cliente, geocodificada, vía OSRM) — se guarda en el momento en
-- que sí tenemos la dirección (Fase 3), para que /pedido/[id] pueda
-- mostrar un tiempo real sin que order_status_public tenga que
-- exponer la dirección (esa tabla es de solo lectura pública por
-- diseño y nunca debe llevar datos del cliente).
alter table orders add column if not exists eta_minutes integer;
alter table orders add column if not exists eta_km numeric(5,1);

alter table order_status_public add column if not exists eta_minutes integer;
alter table order_status_public add column if not exists eta_km numeric(5,1);

create or replace function public.sync_order_status_public()
returns trigger
language plpgsql
security definer
as $function$
begin
  insert into order_status_public (order_id, status, order_type, eta_minutes, eta_km, updated_at)
  values (new.id, new.status, new.order_type, new.eta_minutes, new.eta_km, now())
  on conflict (order_id) do update
    set status = excluded.status,
        order_type = excluded.order_type,
        eta_minutes = excluded.eta_minutes,
        eta_km = excluded.eta_km,
        updated_at = now();
  return new;
end;
$function$;
