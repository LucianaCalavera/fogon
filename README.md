# 🔥 Fogón

**Vende directo. Gana completo.**

Sistema de pedidos para restaurantes y negocios de comida en Chihuahua. Sin comisión por venta, sin intermediarios de reparto — solo un pago fijo mensual y control total del negocio.

🔗 **Sitio en vivo:** [fogon.inannadevweb.com](https://fogon.inannadevweb.com)

<img width="1866" height="939" alt="FogónNuevaImagen" src="https://github.com/user-attachments/assets/c93ed4a8-f588-4f68-a0a0-423a9036f4a7" />

---

## El problema que resuelve

Las apps de delivery cobran hasta 25-30% de comisión por venta. Fogón cobra **$299 MXN/mes fijo, $0 de alta, sin comisiones** — el restaurante se queda con todo lo que vende.

| | Apps de delivery | Fogón |
|---|---|---|
| Sobre $10,000 en ventas | -$2,500 (25% comisión) | -$299 (renta fija) |
| Te quedas con | $7,500 | $9,701 |

---

## Features

**Para el cliente final**
- Tienda pública por negocio, sin necesidad de descargar app
- Menú por categorías con fotos, notas especiales por producto
- Carrito con opción de recoger en tienda o domicilio
- Pago en efectivo o transferencia
- Tracking del pedido en tiempo real con ETA y mapa de ruta


<img width="1858" height="904" alt="MenúNV" src="https://github.com/user-attachments/assets/6bd8049e-8d49-4286-9815-63aed127d2bf" />

<img width="1152" height="883" alt="CarritoNV2" src="https://github.com/user-attachments/assets/0ee64a4d-8c4e-4f76-b888-2eaffbbfff95" />

<img width="1832" height="948" alt="PedidoNV" src="https://github.com/user-attachments/assets/00ba3206-22e3-4d72-b325-d3d6f5dd81f4" />


**Para el negocio**
- Dashboard de pedidos en vivo con alertas de sonido
- Gestión de pedidos por estado (nuevos / preparando / listos)
- Ruteo real y ETA calculado con OSRM + Nominatim, visualizado en mapa Leaflet
- Reportes de ventas (hoy / semana / mes / año) y productos más vendidos
- Configuración de identidad del negocio, horarios, redes sociales
- Multi-sucursal con selector de negocio activo

<img width="1866" height="939" alt="DashboardNV" src="https://github.com/user-attachments/assets/ebbecddb-002f-49c9-b44d-3675eff459d7" />

<img width="1875" height="934" alt="ReportesNV" src="https://github.com/user-attachments/assets/be2c3735-d697-4a38-87a7-bb0a0438f24b" />

<img width="1857" height="941" alt="FogonTiendaNV" src="https://github.com/user-attachments/assets/828bc93c-c0a1-4910-ab27-fdfc3395fb44" />

<img width="1774" height="891" alt="CarritoNV" src="https://github.com/user-attachments/assets/4fbd725d-d5c8-4480-9c56-62edde76b363" />




---

## Stack técnico

- **Frontend/SSR:** Astro
- **Backend:** Supabase (PostgreSQL, Realtime, Auth, Storage)
- **Mapas y ruteo:** Leaflet + OSRM + Nominatim
- **Seguridad:** Row Level Security (RLS) con funciones SECURITY DEFINER para aislamiento multi-tenant
- **Deploy:** Netlify

## Arquitectura destacada

- Order tracking público vía tabla `order_status_public` con trigger SECURITY DEFINER, sin exponer datos sensibles del negocio al cliente final
- Multi-sucursal manejado con cookie `fogon_active_business` para negocios con más de una ubicación
- Cálculo de ETA y rutas reales (no estimaciones lineales) integrando OSRM para ruteo y Nominatim para geocoding

---

**Desarrollado por [InannaDevWeb](https://inannadevweb.com)**
