<template>
  <div id="app" class="bg-gray-100 flex flex-col justify-center items-center p-4">
    <main-h1 class="text-4xl font-bold mb-4">Bienvenido a Devstagram</main-h1>
    <div v-if="!user" class="text-center mb-8">
      <p class="text-xl mb-4">Devstagram es una red entre developers. Conecta con otros developers de todo el mundo.</p>
      <router-link class="mb-8 inline-block bg-red-800 text-white px-6 py-2 rounded font-bold text-lg" to="/registro">Regístrate ahora</router-link>
    </div>
    <div v-else class="text-center mb-8">
      <p class="text-xl mb-4">¡Hola, {{ userProfile?.username || user.email }}! Disfruta conectando con otros developers.</p>
      <router-link class="mb-8 inline-block bg-green-500 hover:bg-green-700 text-white px-6 py-2 rounded font-bold text-lg" to="/create-post">Crear nueva publicación</router-link>
    </div>
    <div class="w-full">
      <h2 class="text-2xl font-bold mb-4">Publicaciones recientes</h2>
      <ul>
        <li v-for="post in posts" :key="post.id" class="bg-white p-4 mb-4 rounded shadow relative">
          <router-link :to="{ name: 'PostDetail', params: { id: post.id } }">
            {{ post.title }}
          </router-link>
          <p>{{ post.content }}</p>
          <div class="absolute top-2 right-2 flex gap-2">
            <button @click="handleLike(post.id)"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline">
              Like ({{ post.likesCount.length }})
            </button>
            <button @click="handleComment(post.id)"
                    class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline">
              Comentar
            </button>
          </div>
        </li>
      </ul>
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

<script>
import MainH1 from '../components/MainH1.vue';
import Modal from '../components/Modal.vue';
import CommentModal from '../components/CommentModal.vue';
import {onAuthStateChanged} from "firebase/auth";
import {auth, db} from "../services/firebase";
import {collection, getDocs, doc, getDoc, updateDoc, arrayUnion} from "firebase/firestore";

export default {
  name: 'Home',
  components: {MainH1, Modal, CommentModal},
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
    };
  },
  created() {
    this.fetchPosts();
    this.checkAuthState();
  },
  methods: {
    async fetchPosts() {
      const postsCollection = collection(db, "posts");
      const postsSnapshot = await getDocs(postsCollection);
      this.posts = postsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
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
        this.openCommentModal(postId);
      } else {
        this.showLoginModal = true;
      }
    },
    async likePost(postId) {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        likesCount: arrayUnion(this.user.uid)
      });
      this.fetchPosts(); // Refresh posts to show the updated like count
    },
    openCommentModal(postId) {
      this.postIdToComment = postId;
      this.showCommentModal = true;
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
    redirectToLogin() {
      this.showLoginModal = false;
      this.$router.push('/login');
    }
  }
}
</script>


