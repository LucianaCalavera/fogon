-- Notas por producto (ej. "sin cebolla, extra salsa") capturadas en el
-- modal de detalle de producto de la tienda. Antes solo existía
-- orders.notes a nivel de todo el pedido.
alter table order_items add column if not exists notes text;
