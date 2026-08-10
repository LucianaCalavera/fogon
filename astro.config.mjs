import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'server',
  adapter: netlify(),
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['leaflet', 'qrcode', '@supabase/supabase-js', '@supabase/ssr'],
    },
    ssr: {
      noExternal: ['leaflet', 'qrcode'],
    },
  },
});