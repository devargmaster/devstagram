<script>
import MainH1 from '../components/MainH1.vue';
import Modal from '../components/Modal.vue';
import CommentModal from '../components/CommentModal.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

export default {
  name: 'Home',
  components: { MainH1, Modal, CommentModal, SkeletonLoader },
  data() {
    return {
      user: null,
      userProfile: null,
      posts: [],
      showLoginModal: false,
      showCommentModal: false,
      modalTitle: 'Iniciar Sesión Requerido',
      modalMessage: 'Debes iniciar sesión para realizar esta acción.',
      commentModalTitle: 'Agregar Comentario',
      newComment: '',
      postIdToComment: null,
      currentPage: 1,
      postsPerPage: 8,
      loading: true,
    };
  },
  computed: {
    paginatedPosts() {
      const start = (this.currentPage - 1) * this.postsPerPage;
      const end = start + this.postsPerPage;
      return this.posts.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.posts.length / this.postsPerPage);
    }
  },
  created() {
    this.fetchPosts();
    this.checkAuthState();
  },
  methods: {
    async fetchPosts() {
      this.loading = true;
      const postsCollection = collection(db, "posts");
      const postsSnapshot = await getDocs(postsCollection);
      const posts = postsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

      for (let post of posts) {
        const userDoc = await getDoc(doc(db, "users", post.userId.replace('users/', '')));
        console.log('userdatahome:',userDoc.data());
        if (userDoc.exists()) {
          post.authorName = userDoc.data().name;
          post.authorAvatar = userDoc.data().photoUrl;
        } else {
          post.authorName = 'Anónimo';
          post.authorAvatar = '/images/perfil.jpg';
        }
      }

      this.posts = posts;
      this.loading = false;
    },
    checkAuthState() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.user = user;
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            this.userProfile = userDoc.data();
          }
        } else {
          this.user = null;
        }
      });
    },
    handleLike(postId) {
      if (this.user) {
        this.likePost(postId);
      } else {
        this.showLoginModal = true;
      }
    },
    handleComment(postId) {
      if (this.user) {
        this.$router.push({name: 'PostDetail', params: {id: postId}, query: {comment: true}});
      } else {
        this.showLoginModal = true;
      }
    },
    async likePost(postId) {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        likesCount: arrayUnion(this.user.uid)
      });
      this.fetchPosts();
    },
    async addComment(comment) {
      const postRef = doc(db, "posts", this.postIdToComment);
      await updateDoc(postRef, {
        comments: arrayUnion({
          userId: this.user.uid,
          comment: comment,
          createdAt: new Date()
        })
      });
      this.showCommentModal = false;
      this.postIdToComment = null;
      this.fetchPosts();
    },
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    redirectToLogin() {
      this.showLoginModal = false;
      this.$router.push('/login');
    },
    goToPage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    }
  }
}
</script>

<template>
  <div id="app" class="bg-gray-100 flex flex-col justify-center items-center p-4">
    <main-h1 class="text-4xl font-bold mb-4">Bienvenido a Devstagram</main-h1>
    <div v-if="!user" class="text-center mb-8">
      <p class="text-xl mb-4">Devstagram es una red entre developers. Conecta con otros developers de todo el mundo.</p>
      <router-link class="mb-8 inline-block bg-red-800 text-white px-6 py-2 rounded font-bold text-lg" to="/registro">
        Regístrate ahora
      </router-link>
    </div>
    <div v-else class="text-center mb-8">
      <p class="text-xl mb-4">¡Hola, {{ userProfile?.name }}! Disfruta conectando con otros developers.</p>
      <router-link
        class="mb-8 inline-block bg-green-500 hover:bg-green-700 text-white px-6 py-2 rounded font-bold text-lg"
        to="/create-post">Crear nueva publicación
      </router-link>
    </div>
    <div class="w-full max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Publicaciones recientes</h2>
      <ul v-if="!loading">
        <li v-for="post in paginatedPosts" :key="post.id" class="bg-white p-6 mb-6 rounded-lg shadow-md relative">
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300">
              <img :src="post.authorImage || '/images/perfil.jpg'" alt="Avatar"
                   class="h-10 w-10 rounded-full object-cover">
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-bold">
                <router-link :to="{ name: 'PostDetail', params: { id: post.id } }">{{ post.title }}</router-link>
              </h3>
              <p class="text-sm text-gray-500">Publicado por {{ post.authorName }} el {{
                  formatDate(post.createdAt)
                }}</p>
            </div>
          </div>
          <p class="text-gray-800 mb-4">{{ post.content }}</p>
          <div class="absolute top-2 right-2 flex gap-2">
            <button @click="handleLike(post.id)"
                    class="flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              <i class="fas fa-thumbs-up mr-2"></i> Like ({{ post.likesCount.length }})
            </button>
            <button @click="handleComment(post.id)"
                    class="flex items-center bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              <i class="fas fa-comment mr-2"></i> Comentar
            </button>
          </div>
        </li>
      </ul>
      <ul v-else>
        <li v-for="n in postsPerPage" :key="n" class="bg-white p-6 mb-6 rounded-lg shadow-md relative">
          <skeleton-loader/>
        </li>
      </ul>
      <div class="flex justify-between mt-4">
        <div v-if="totalPages > 1" class="flex justify-between mt-4">
          <button @click="prevPage" :disabled="currentPage === 1"
                  class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
            Anterior
          </button>
          <p class="ml-4 mr-4">Página {{ currentPage }} de {{ totalPages }}</p>
          <button @click="nextPage" :disabled="currentPage === totalPages"
                  class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
            Siguiente
          </button>
        </div>
      </div>
    </div>
    <modal v-if="showLoginModal"
           :title="modalTitle"
           :message="modalMessage"
           @confirm="redirectToLogin"
           @cancel="showLoginModal = false"></modal>
    <comment-modal v-if="showCommentModal"
                   :title="commentModalTitle"
                   @confirm="addComment"
                   @cancel="showCommentModal = false">
    </comment-modal>
  </div>
</template>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');
</style>
