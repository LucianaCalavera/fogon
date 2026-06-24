import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/* ─── Tipos ────────────────────────────────────────────────── */

export interface Business {
  id: string
  slug: string
  name: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  phone: string | null
  address: string | null
  open_time: string | null
  close_time: string | null
  is_open: boolean
  is_active: boolean
}

export interface Category {
  id: string
  business_id: string
  name: string
  position: number
  is_active: boolean
  products?: Product[]
}

export interface Product {
  id: string
  business_id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  position: number
}

export interface OrderItem {
  product_id: string
  name_snap: string
  price_snap: number
  quantity: number
  subtotal: number
}