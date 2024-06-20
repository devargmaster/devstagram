<script>
import MainH1 from '../components/MainH1.vue';
import Modal from '../components/Modal.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc, collection, where, getDocs, deleteDoc, query } from "firebase/firestore";
import { logout } from "../services/auth";

export default {
  name: 'MyProfile',
  components: { MainH1, Modal, SkeletonLoader },
  data() {
    return {
      user: null,
      userProfile: null,
      password: '',
      myPosts: [],
      likedPosts: [],
      errorMessage: '',
      showModal: false,
      passwordChanged: false,
      postCreated: false,
      deletedRecord: false,
      postIdToDelete: null,
      modalTitle: 'Confirmar Eliminación',
      modalMessage: '¿Estás seguro de que deseas eliminar esta publicación?',
      currentPage: 1,
      postsPerPage: 4,
      loading: true,
    };
  },
  computed: {
    paginatedPosts() {
      const start = (this.currentPage - 1) * this.postsPerPage;
      const end = start + this.postsPerPage;
      return this.myPosts.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.myPosts.length / this.postsPerPage);
    }
  },
  created() {
    this.fetchUser();
    this.clearMessages();
  },
  methods: {
    async fetchUser() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.user = user;
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            this.userProfile = userDoc.data();
          } else {
            console.log('No hay datos de perfil del usuario!');
          }
          const postsQuery = query(collection(db, "posts"), where("userId", "==", `users/${user.uid}`));
          const querySnapshot = await getDocs(postsQuery);
          this.myPosts = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
          this.loading = false;
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
        this.deletedRecord = true;
        localStorage.setItem('deletedRecord', 'true');
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
        this.clearMessages();
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
    },

    nextPage() {
      this.clearMessages();
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      this.clearMessages();
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    clearMessages() {
      this.passwordChanged = localStorage.getItem('passwordUpdated') === 'true';
      this.postCreated = localStorage.getItem('postCreated') === 'true';
      this.deletedRecord = localStorage.getItem('deletedRecord') === 'true';
      localStorage.removeItem('passwordUpdated');
      localStorage.removeItem('postCreated');
      localStorage.removeItem('deletedRecord');
    }
  }
}
</script>

<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <main-h1 class="text-center mb-6">Mi Perfil</main-h1>
    <div class="flex items-center justify-center w-screen mb-4 ml-4 pl-4">
      <div v-if="passwordChanged"
           class="text-white alert alert-success bg-green-600 rounded flex justify-center justify-items-center mx-auto my-auto p-4">
        Contraseña actualizada con éxito.
      </div>
    </div>
    <div class="flex items-center justify-center w-screen mb-4 ml-4 pl-4">
      <div v-if="postCreated"
           class="text-white alert alert-success bg-green-600 rounded flex justify-center justify-items-center mx-auto my-auto p-4">
        Publicación creada con éxito.
      </div>
    </div>
    <div class="flex items-center justify-center w-screen mb-4 ml-4 pl-4">
      <div v-if="deletedRecord"
           class="text-white alert alert-success bg-red-700 rounded flex justify-center justify-items-center mx-auto my-auto p-4">
        Publicación borrada con éxito.
      </div>
    </div>
    <div v-if="loading">
      <skeleton-loader />
      <skeleton-loader />
      <skeleton-loader />
      <skeleton-loader />
    </div>
    <div v-else-if="userProfile" class="bg-white p-6 rounded-lg shadow-lg">
      <div class="flex flex-col items-center mb-6">
        <div class="w-1/4">
          <img src="/images/perfil.jpg" alt="Foto de perfil" class="rounded-full w-full">
        </div>
        <div class="w-3/4 pl-6 text-center">
          <h2 class="text-3xl font-bold mb-2">Perfil de: {{ userProfile.name }}</h2>
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
          <li v-for="post in paginatedPosts" :key="post.id" class="bg-gray-50 p-4 mb-4 rounded shadow relative">
            <h3 class="text-xl font-bold mb-2">{{ post.title }}</h3>
            <p>{{ post.content }}</p>
            <button @click="confirmDelete(post.id)"
                    class="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline">
              Eliminar
            </button>
          </li>
        </ul>
      </div>

      <div v-if="totalPages > 1" class="flex justify-between mt-4">
        <button @click="prevPage" :disabled="currentPage === 1" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
          Anterior
        </button>
        <p class="ml-4 mr-4">Página {{ currentPage }} de {{ totalPages }}</p>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
          Siguiente
        </button>
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
