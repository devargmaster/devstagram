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
import {getAuth} from "firebase/auth";
import UsersProfiles from "../pages/UsersProfiles.vue";
import MyProfileEdit from "../pages/MyProfileEdit.vue";
import MyProfileEditPhoto from "../pages/MyProfileEditPhoto.vue";
import EditPost from "../pages/EditPost.vue";

const routes = [
  { path: '/',               component: Home, },
  { path: '/registro',       component: Register, },
  { path: '/about',          component: About, },
  { path: '/login',          component: Login, },
  { path: '/perfil',         component: MyProfile, },
  { path: '/user/:userId',
    name:'UsersProfiles',
    component: UsersProfiles,
    props: true,
  },
  { path: '/post/:id/edit', component: EditPost, props: true },
  { path: '/editar-perfil', component: MyProfileEdit },
  { path: '/perfil/editar/foto',      component: MyProfileEditPhoto,  meta: { requiresAuth: true } },
  {
    path: '/create-post',
    name: 'CreatePost',
    component: CreatePost,
    beforeEnter: (to, from, next) => {
      const auth = getAuth();
      if (auth.currentUser) {
        next();
      } else {
        next('/login');
      }
    },
  },
  {
    path: '/post-detail/:id',
    name: 'PostDetail',
    component: PostDetail,
    props: true,
    beforeEnter: (to, from, next) => {
      const auth = getAuth();
      if (auth.currentUser) {
        next();
      } else {
        next('/login');
      }
    },
  },
  {
    path: '/cambiar-contrasena',
    component: UpdatePassword,
    beforeEnter: (to, from, next) => {
      const auth = getAuth();
      if (auth.currentUser) {
        next();
      } else {
        next('/login');
      }
    },
  },
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
