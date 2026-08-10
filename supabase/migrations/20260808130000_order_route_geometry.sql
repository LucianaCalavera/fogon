-- Geometría de la ruta real (restaurante → dirección del cliente),
-- calculada en el checkout junto con eta_minutes/eta_km (Fase 3) — se
-- guarda como GeoJSON LineString para poder dibujar la ruta en un
-- mapa Leaflet, tanto en el dashboard como en /pedido/[id]. Mismo
-- criterio de exposición que eta_minutes/eta_km: se sincroniza a
-- order_status_public porque esa pantalla del cliente no tiene
-- acceso a la tabla orders (solo lectura pública por diseño).
alter table orders add column if not exists eta_route_geometry jsonb;

alter table order_status_public add column if not exists eta_route_geometry jsonb;

create or replace function public.sync_order_status_public()
returns trigger
language plpgsql
security definer
as $function$
begin
  insert into order_status_public (order_id, status, order_type, eta_minutes, eta_km, eta_route_geometry, updated_at)
  values (new.id, new.status, new.order_type, new.eta_minutes, new.eta_km, new.eta_route_geometry, now())
  on conflict (order_id) do update
    set status = excluded.status,
        order_type = excluded.order_type,
        eta_minutes = excluded.eta_minutes,
        eta_km = excluded.eta_km,
        eta_route_geometry = excluded.eta_route_geometry,
        updated_at = now();
  return new;
end;
$function$;
