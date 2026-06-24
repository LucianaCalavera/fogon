
//
// Única fuente de verdad para saber si un negocio está abierto AHORA.
// La usan tanto la tienda pública ([slug].astro) como el dashboard
// (dashboard/index.astro) para que nunca se desincronicen.
//
// IMPORTANTE: siempre calcula con la hora de America/Chihuahua, sin
// importar en qué zona horaria corra el servidor. Netlify ejecuta sus
// funciones en UTC — sin esto, una vez deployado, el horario que ve
// el cliente quedaría desfasado varias horas del que de verdad aplica
// el trigger de la base de datos (que sí usa Chihuahua correctamente).

function getCurrentMinutes(timeZone = 'America/Chihuahua') {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(now)
  const hour = Number(parts.find(p => p.type === 'hour').value)
  const minute = Number(parts.find(p => p.type === 'minute').value)
  return hour * 60 + minute
}

/**
 * @param {string|null} openTime  - 'HH:MM' o 'HH:MM:SS' (columna businesses.open_time)
 * @param {string|null} closeTime - 'HH:MM' o 'HH:MM:SS' (columna businesses.close_time)
 * @param {boolean|null} isOpen   - columna businesses.is_open (interruptor manual / Modo Pausa)
 * @returns {boolean}
 */
export function isBusinessOpen(openTime, closeTime, isOpen) {
  if (isOpen === false) return false // Modo pausa manual: siempre gana, cierra sin importar horario

  if (!openTime || !closeTime) return true // Sin horario configurado = siempre abierto

  const currentMinutes = getCurrentMinutes()

  const [openH, openM] = openTime.split(':').map(Number)
  const [closeH, closeM] = closeTime.split(':').map(Number)
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM

  if (closeMinutes > openMinutes) {
    // Horario normal dentro del mismo día (ej. 08:00 - 23:00)
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes
  } else {
    // Horario que cruza medianoche (ej. 20:00 - 02:00)
    return currentMinutes >= openMinutes || currentMinutes <= closeMinutes
  }
}

/**
 * Devuelve el "estado" detallado para mostrar en UI, distinguiendo
 * por qué está cerrado (eso es lo que el dashboard necesita y la
 * tienda pública no).
 * @returns {'open' | 'closed-schedule' | 'closed-manual' | 'open-no-schedule'}
 */
export function getBusinessStatus(openTime, closeTime, isOpen) {
  if (isOpen === false) return 'closed-manual'
  if (!openTime || !closeTime) return 'open-no-schedule'
  return isBusinessOpen(openTime, closeTime, isOpen) ? 'open' : 'closed-schedule'
}

export function nextOpenLabel(openTime) {
  return openTime ? `Abre ${openTime.slice(0, 5)}` : ''
}