import L from 'leaflet'

// Dibuja la ruta guardada (GeoJSON LineString, coordenadas en
// [lng,lat]) en un mapa Leaflet — la usan tanto el dashboard (mini
// mapa colapsado por tarjeta) como /pedido/[id] (mapa siempre
// visible), por eso vive en un solo lugar en vez de repetirse.
export function renderRouteMap(containerId, coordinates, { interactive = false, zoomControl = interactive } = {}) {
  const latlngs = coordinates.map(([lng, lat]) => [lat, lng])

  // El mini-mapa colapsable del dashboard no es "interactive" (sin
  // scroll-zoom, para no pelear con el scroll de la página al pasar el
  // cursor encima), pero sí tiene sus propios controles +/- (zoomControl)
  // y debe poder arrastrarse igual que el mapa grande — por eso dragging/
  // tap/doubleClickZoom/touchZoom siguen a `interactive || zoomControl`
  // en vez de solo a `interactive`.
  const hasOwnControls = interactive || zoomControl
  const map = L.map(containerId, {
    zoomControl,
    dragging: hasOwnControls,
    scrollWheelZoom: interactive,
    tap: hasOwnControls,
    doubleClickZoom: hasOwnControls,
    touchZoom: hasOwnControls,
    attributionControl: interactive
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap, © CARTO', maxZoom: 19
  }).addTo(map)

  const line = L.polyline(latlngs, { color: '#C7551F', weight: 4 }).addTo(map)

  L.circleMarker(latlngs[0], { radius: 6, color: '#fff', weight: 2, fillColor: '#2563eb', fillOpacity: 1 }).addTo(map)
  L.circleMarker(latlngs[latlngs.length - 1], { radius: 6, color: '#fff', weight: 2, fillColor: '#C7551F', fillOpacity: 1 }).addTo(map)

  map.fitBounds(line.getBounds(), { padding: [16, 16] })
  setTimeout(() => map.invalidateSize(), 50)
  return map
}
