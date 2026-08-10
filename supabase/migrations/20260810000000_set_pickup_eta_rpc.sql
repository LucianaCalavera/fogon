-- ETA real de "Recoger" (cliente → negocio) solo se puede calcular en
-- /pedido/[id], una vez que el navegador del cliente entrega su
-- geolocalización — a diferencia de "Domicilio", que se calcula y
-- guarda en el checkout (INSERT) porque ahí ya se conocen las
-- coordenadas fijas del negocio y la dirección geocodificada.
--
-- Esto es un UPDATE a un pedido ya existente, hecho por un cliente sin
-- sesión — en vez de abrir UPDATE anónimo sobre toda `orders`, se
-- expone una función acotada: solo toca eta_minutes/eta_km/
-- eta_route_geometry, solo en pedidos "pickup", y solo si todavía no
-- tienen un ETA guardado (evita que alguien con el order_id pise un
-- valor ya calculado).
create or replace function public.set_pickup_eta(
  p_order_id uuid,
  p_minutes integer,
  p_km numeric,
  p_geometry jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $function$
begin
  update orders
     set eta_minutes = p_minutes,
         eta_km = p_km,
         eta_route_geometry = p_geometry
   where id = p_order_id
     and order_type = 'pickup'
     and eta_minutes is null;
end;
$function$;

grant execute on function public.set_pickup_eta(uuid, integer, numeric, jsonb) to anon, authenticated;
