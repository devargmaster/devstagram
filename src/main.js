import '../style.css'

import App from './App.vue'
import { createApp } from 'vue'
import router from './router/router'
import '@fortawesome/fontawesome-free/css/all.css'
const app =createApp(App);
app.use(router);
app.mount('#app');
