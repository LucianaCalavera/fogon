// Única fuente de verdad para etiqueta/color/agrupación de estados de
// pedido — la usan tanto el frontmatter (SSR) como el <script>
// client-side de dashboard/index.astro, para que no se desincronicen
// entre sí (como pasó con DEFAULT_PREP_MINUTES).
export const statusLabel = { pending: 'Pendiente', confirmed: 'Confirmado', ready: 'Listo', delivered: 'Entregado', cancelled: 'Cancelado' }
export const statusColor = { pending: '#B04030', confirmed: '#2563eb', ready: '#2d7a4a', delivered: '#6B7280', cancelled: '#c0392b' }
export const statusBg = { pending: 'rgba(176,64,48,0.12)', confirmed: 'rgba(96,165,250,0.1)', ready: 'rgba(74,222,128,0.1)', delivered: 'rgba(107,114,128,0.1)', cancelled: 'rgba(248,113,113,0.1)' }

// El dashboard ya no separa pedidos activos por estado en pestañas —
// solo dos vistas: "activos" (pending/confirmed/ready juntos) y
// "entregados" (delivered/cancelled, historial).
export const bucketOf = (status) => (status === 'delivered' || status === 'cancelled') ? 'delivered' : 'active'
