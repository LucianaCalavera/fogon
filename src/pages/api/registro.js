export const prerender = false

// Este endpoint requiere la Service Role Key de Supabase (Project
// Settings → API → service_role), no la anon key. Se guarda como
// variable de entorno sin el prefijo PUBLIC_, para que nunca se
// incluya en el bundle del navegador:
//
//   SUPABASE_SERVICE_ROLE_KEY=eyJ...
//
// En Netlify se define en Site settings → Environment variables; en
// local, en el archivo .env (excluido de git vía .gitignore).

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
)

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function getUniqueSlug(businessName) {
  const baseSlug = slugify(businessName) || 'negocio'
  let slug = baseSlug
  let i = 2
  // Con pocos negocios esto es rapidísimo; si algún día Fogón tiene
  // miles de negocios, esto se puede mover a una función de Postgres.
  while (true) {
    const { data } = await supabaseAdmin.from('businesses').select('id').eq('slug', slug).maybeSingle()
    if (!data) return slug
    slug = `${baseSlug}-${i}`
    i++
  }
}

export async function POST({ request }) {
  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Datos inválidos' }), { status: 400 })
  }

  try {
    const businessName = (body.businessName || '').trim()
    const email = (body.email || '').trim().toLowerCase()
    const password = body.password || ''
    const whatsappNumber = (body.whatsappNumber || '').trim() || null

    if (!businessName || !email || !password) {
      return new Response(JSON.stringify({ error: 'Faltan datos obligatorios' }), { status: 400 })
    }
    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'La contraseña debe tener al menos 8 caracteres' }), { status: 400 })
    }

    // 1. Creación del usuario. email_confirm:true lo activa de inmediato,
    //    sin esperar correo de verificación — clave para que el alta
    //    de un founder no se trabe en su bandeja de spam.
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true
    })

    if (userError) {
      console.error('registro: createUser error →', userError)
      // No se revela si la causa fue "correo ya existe" u otra cosa —
      // decirlo abiertamente permite enumerar qué correos están
      // registrados en Fogón. El mensaje sirve igual para ambos casos.
      return new Response(JSON.stringify({
        error: 'No se pudo completar el registro. Si ya tienes una cuenta con ese correo, inicia sesión en /login; si no, revisa tus datos e intenta de nuevo.'
      }), { status: 400 })
    }

    // 2. Slug único a partir del nombre del negocio
    const slug = await getUniqueSlug(businessName)

    // 3. Creación del negocio, ligado al nuevo usuario
    const { data: business, error: bizError } = await supabaseAdmin
      .from('businesses')
      .insert({
        owner_id: userData.user.id,
        name: businessName,
        slug,
        whatsapp_number: whatsappNumber,
        is_open: true,
        is_active: true,
        subscription_status: 'trial'
      })
      .select()
      .single()

    if (bizError) {
      console.error('registro: businesses insert error →', bizError)
      // No se deja un usuario huérfano sin negocio si algo falla aquí.
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
      return new Response(JSON.stringify({ error: `No se pudo crear el negocio: ${bizError.message}` }), { status: 500 })
    }

    return new Response(JSON.stringify({ slug: business.slug }), { status: 200 })
  } catch (err) {
    // Cualquier excepción inesperada (ej. la Service Role Key mal
    // puesta, o no configurada) cae aquí — antes esto se le escapaba
    // al try/catch y el navegador recibía una página de error en HTML
    // en vez de JSON, lo que se traducía en "no se pudo conectar".
    console.error('registro: error inesperado →', err)
    return new Response(JSON.stringify({ error: `Error inesperado: ${err.message}` }), { status: 500 })
  }
}