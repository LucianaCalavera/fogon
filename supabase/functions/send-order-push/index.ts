// supabase/functions/send-order-push/index.ts
//
// Se dispara vía Database Webhook cuando la tabla `orders` recibe un UPDATE.
// Manda una notificación push a todos los endpoints suscritos a esa orden,
// solo cuando el status entra a 'listo' o 'en_camino'.

import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:hola@inannadevweb.com'

// Valores reales de la columna `status` en `orders` (ver dashboard/index.astro):
// pending → confirmed → ready → delivered, con cancelled disponible antes de ready.
// Solo notificamos en 'ready' — es el momento en que el cliente debe actuar
// (ir a recoger, o esperar a que llegue si es domicilio).
const NOTIFY_ON_STATUS = new Set(['ready'])

const NOTIFICATION_COPY: Record<string, { title: string; body: string }> = {
  ready: { title: 'Tu pedido está listo 🔥', body: 'Ya lo puedes recoger, o va en camino si pediste a domicilio.' },
}

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  try {
    const payload = await req.json()

    // Estructura estándar de un Database Webhook de Supabase:
    // { type: 'UPDATE', table: 'orders', record: {...}, old_record: {...} }
    const { record, old_record } = payload

    if (!record || !old_record) {
      return new Response(JSON.stringify({ skipped: 'payload incompleto' }), { status: 200 })
    }

    const statusChanged = record.status !== old_record.status
    const shouldNotify = statusChanged && NOTIFY_ON_STATUS.has(record.status)

    if (!shouldNotify) {
      return new Response(JSON.stringify({ skipped: 'sin cambio relevante de status' }), { status: 200 })
    }

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, keys')
      .eq('order_id', record.id)

    if (error) throw error
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ skipped: 'sin suscripciones para esta orden' }), { status: 200 })
    }

    const copy = NOTIFICATION_COPY[record.status]
    const payloadStr = JSON.stringify({
      title: copy.title,
      body: copy.body,
      url: `/pedido/${record.id}`,
    })

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payloadStr
        ).catch(async (err) => {
          // 404/410 = la suscripción ya no existe (navegador desinstalado,
          // permiso revocado, etc.) — la limpiamos para no reintentar en vano.
          if (err.statusCode === 404 || err.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id)
          }
          throw err
        })
      )
    )

    const sent = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.length - sent

    return new Response(JSON.stringify({ sent, failed }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Error en send-order-push:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})