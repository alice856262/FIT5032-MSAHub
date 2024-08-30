import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

console.log('Vite ENV:', import.meta.env);

// import PrimeVue from 'primevue/config'
// import Aura from '@primevue/themes/aura'

const app = createApp(App)
// app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)

app.mount('#app')