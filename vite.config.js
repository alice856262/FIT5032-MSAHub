import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@fullcalendar/core/main.css': '@fullcalendar/core',
      '@fullcalendar/daygrid/main.css': '@fullcalendar/daygrid',
      '@fullcalendar/timegrid/main.css': '@fullcalendar/timegrid',
      '@fullcalendar/interaction/main.css': '@fullcalendar/interaction',
    }
  },
  envPrefix: 'VUE_APP_'
})
