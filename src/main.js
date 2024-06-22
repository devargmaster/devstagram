import '../style.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'
import '@fortawesome/fontawesome-free/css/all.css'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

let app
const auth = getAuth()

onAuthStateChanged(auth, () => {
  if (!app) {
    app = createApp(App)
    app.use(router)
    app.mount('#app')
  }
})
