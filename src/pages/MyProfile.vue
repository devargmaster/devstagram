<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <main-h1 class="text-center mb-6">Mi Perfil</main-h1>
    <div class="flex items-center justify-center w-screen mb-4 ml-4 pl-4">
      <div v-if="passwordChanged" class="text-white alert alert-success bg-green-600 rounded flex justify-center justify-items-center mx-auto my-auto p-4">
        Contraseña actualizada con éxito.
      </div>
    </div>
    <div v-if="userProfile" class="bg-white p-6 rounded-lg shadow-lg">
      <div class="flex flex-col items-center mb-6">
        <div class="w-1/4">
          <img src="https://via.placeholder.com/150" alt="Foto de perfil" class="rounded-full w-full">
        </div>
        <div class="w-3/4 pl-6 text-center">
          <h2 class="text-3xl font-bold mb-2">Perfil de: {{ userProfile.name}}</h2>
          <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4">
            Cambiar foto de perfil
          </button>
          <div class="mb-4">
            <router-link to="/cambiar-contrasena"
                         class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-block">
              Cambiar contraseña
            </router-link>
          </div>
          <div class="mt-4">
            <button @click="handleLogout"
                    class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Salir
            </button>
          </div>
        </div>
      </div>
      <div v-if="errorMessage" class="text-red-500 mt-2">{{ errorMessage }}</div>

      <div class="mb-6">
        <h2 class="text-2xl font-bold mb-4">Mis publicaciones</h2>
        <ul>
          <li v-for="post in myPosts" :key="post.id" class="bg-gray-50 p-4 mb-4 rounded shadow relative">
            <h3 class="text-xl font-bold mb-2">{{ post.title }}</h3>
            <p>{{ post.content }}</p>
            <button @click="confirmDelete(post.id)"
                    class="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline">
              Eliminar
            </button>
          </li>
        </ul>
      </div>
      <div class="mb-6">
        <h2 class="text-2xl font-bold mb-4">Publicaciones que me gustaron</h2>
        <ul>
          <li v-for="post in likedPosts" :key="post.id" class="bg-gray-50 p-4 mb-4 rounded shadow">
            <h3 class="text-xl font-bold mb-2">{{ post.title }}</h3>
            <p>{{ post.content }}</p>
          </li>
        </ul>
      </div>
      <div class="flex justify-center">
        <router-link to="/create-post"
                     class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Crear publicación
        </router-link>
      </div>
    </div>
    <div v-else class="text-center">
      <p class="text-gray-600">Cargando...</p>
    </div>

    <modal v-if="showModal"
           :title="modalTitle"
           :message="modalMessage"
           @confirm="deletePost"
           @cancel="showModal = false"></modal>
  </div>
</template>

<script>
import MainH1 from '../components/MainH1.vue';
import Modal from '../components/Modal.vue';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { logout } from "../services/auth";

export default {
  name: 'MyProfile',
  components: { MainH1, Modal },
  data() {
    return {
      user: null,
      userProfile: null,
      password: '',
      myPosts: [],
      likedPosts: [],
      errorMessage: '',
      showModal: false,
      passwordChanged:false,
      postIdToDelete: null,
      modalTitle: 'Confirmar Eliminación',
      modalMessage: '¿Estás seguro de que deseas eliminar esta publicación?'
    };
  },
  created() {
    this.fetchUser();
    this.passwordChanged = localStorage.getItem('passwordUpdated') === 'true';
    localStorage.removeItem('passwordUpdated');
  },
  methods: {
    async fetchUser() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.user = user;
          console.log('Usuario logueado:', user.uid);
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            console.log('Document data:', userDoc.data());
            this.userProfile = userDoc.data();
          } else {
            console.log('No hay datos de perfil del usuario!');
          }

          const postsQuery = query(collection(db, "posts"), where("userId", "==", `users/${user.uid}`));
          const querySnapshot = await getDocs(postsQuery);
          this.myPosts = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

          const likesQuery = query(collection(db, "likes"), where("userId", "==", `users/${user.uid}`));
          const likesSnapshot = await getDocs(likesQuery);
          const likedPostIds = likesSnapshot.docs.map(doc => doc.data().postId);
          if (likedPostIds.length > 0) {
            const likedPostsQuery = query(collection(db, "posts"), where("id", "in", likedPostIds));
            const likedPostsSnapshot = await getDocs(likedPostsQuery);
            this.likedPosts = likedPostsSnapshot.docs.map(doc => doc.data());
          }
        } else {
          this.user = null;
          this.userProfile = null;
          this.$router.push('/registro');
        }
      });
    },
    confirmDelete(postId) {
      this.postIdToDelete = postId;
      this.showModal = true;
    },
    async deletePost() {
      try {
        await deleteDoc(doc(db, "posts", this.postIdToDelete));
        this.myPosts = this.myPosts.filter(post => post.id !== this.postIdToDelete);
        this.showModal = false;
        this.postIdToDelete = null;
      } catch (error) {
        console.error("Error al eliminar la publicación: ", error);
      }
    },
    async handleLogout() {
      try {
        await logout();
        this.$router.push('/login');
      } catch (error) {
        console.error("Error al cerrar sesión: ", error);
      }
    }
  }
}
</script>

