// Cálculo real de ruta (Fase 3) — reemplaza al mock determinístico.
// Ambas funciones se llaman siempre desde el navegador (nunca en SSR):
// geocodeAddress depende del Referer que solo un navegador real manda
// (política de uso de Nominatim), y routeEta para "Recoger" depende de
// navigator.geolocation, que tampoco existe en el servidor.

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving'
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search'

// Fogón solo opera en Chihuahua, Chih. por ahora — la geocodificación
// se ancla ahí (viewbox+bounded=1) para que direcciones cortas
// como "Emilia Miller #306" (sin ciudad/estado) sí resuelvan, en vez
// de que Nominatim las busque en cualquier parte del mundo y falle.
// west,north,east,south — cubre la mancha urbana con margen.
const CHIHUAHUA_VIEWBOX = '-106.20,28.80,-105.95,28.50'

// Tiempo de preparación con el que cae el EtaChip cuando no hay una
// ruta real que mostrar (geolocalización denegada/no disponible en
// Recoger, o domicilio sin ETA guardado en el pedido).
export const DEFAULT_PREP_MINUTES = 15

export async function routeEta(origin, destination) {
  try {
    const url = `${OSRM_BASE}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const route = data.routes?.[0]
    if (!route) return null
    return {
      minutes: Math.max(1, Math.round(route.duration / 60)),
      km: Math.round((route.distance / 1000) * 10) / 10,
      // GeoJSON LineString ({coordinates: [[lng,lat], ...]}) — se
      // guarda tal cual en orders.eta_route_geometry para poder
      // dibujar la ruta en un mapa (dashboard y /pedido/[id]) sin
      // tener que recalcularla.
      geometry: route.geometry ?? null
    }
  } catch (e) {
    return null
  }
}

export async function geocodeAddress(address) {
  try {
    const url = `${NOMINATIM_BASE}?format=json&limit=1&viewbox=${CHIHUAHUA_VIEWBOX}&bounded=1&q=${encodeURIComponent(address)}`
    const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
    if (!res.ok) return null
    const results = await res.json()
    if (!results?.length) return null
    return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) }
  } catch (e) {
    return null
  }
}
