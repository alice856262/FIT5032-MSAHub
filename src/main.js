import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';
import '@fullcalendar/interaction/main.css'; 

// import PrimeVue from 'primevue/config'
// import Aura from '@primevue/themes/aura'

const app = createApp(App)
// app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)

app.mount('#app')