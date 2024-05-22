import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import Register from "../pages/Register.vue";
import { subscribeToAuth } from "../services/auth";
import About from "../pages/About.vue";
import MyProfile from "../pages/MyProfile.vue";
import Login from "../pages/Login.vue";
import UpdatePassword from "../pages/UpdatePassword.vue";
import CreatePost from "../pages/CreatePost.vue";
import PostDetail from "../pages/PostDetail.vue";


const routes = [
  { path: '/',                component: Home, },
  { path: '/registro',        component: Register, },
  { path: '/about',          component: About, },
  { path: '/login',          component: Login, },
  { path: '/perfil',          component: MyProfile, },
  { path: '/create-post',          component: CreatePost, },
  { path: '/post-detail/:id', name: 'PostDetail', component: PostDetail, props: true },
  { path: '/cambiar-contrasena', component:UpdatePassword,}
];
const router = createRouter({
  routes,
  history: createWebHashHistory(),
});


let authUser = {
  id: null,
  email: null,
}

subscribeToAuth(newUserData => authUser = newUserData);

router.beforeEach((to, from) => {
  console.log('[router] Navegando a la ruta... ', to.path);

  if(authUser.id === null && to.path == '/chat') {
    return {
      path: '/iniciar-sesion',
    };
  }
});

export default router;
