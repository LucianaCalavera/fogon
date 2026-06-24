import { defineMiddleware } from 'astro:middleware'
import { createServerClient, parseCookieHeader } from '@supabase/ssr'

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(context.request.headers.get('Cookie') ?? '')
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Proteger rutas del dashboard
  if (context.url.pathname.startsWith('/dashboard') && !user) {
    return context.redirect('/login')
  }

  // Si ya está logueado y va al login, redirigir al dashboard
  if (context.url.pathname === '/login' && user) {
    return context.redirect('/dashboard')
  }

  context.locals.user = user
  context.locals.supabase = supabase

  return next()
})