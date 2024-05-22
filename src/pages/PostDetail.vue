<template>
  <div class="post-detail" v-if="post">
    <h1 class="text-3xl font-bold mb-4">{{ post.title }}</h1>
    <p class="text-sm text-gray-500 mb-4">Publicado por {{ post.authorName }} el {{ formatDate(post.createdAt) }}</p>
    <p class="mb-4">Likes: {{ post.likesCount.length }}</p>
    <p class="mb-4">Comentarios: {{ comments.length }}</p>
    <div v-html="post.content" class="prose mb-4"></div>
    <pre v-if="post.sourcecode" class="bg-gray-100 p-4 rounded mb-4"><code>{{ post.sourcecode }}</code></pre>

    <h2 class="text-2xl font-bold mb-4">Comentarios</h2>
    <ul class="mb-4">
      <li v-for="comment in sortedComments" :key="comment.id" class="bg-white p-4 mb-4 rounded shadow flex items-start">
        <img :src="comment.avatarUrl || 'https://via.placeholder.com/50'" alt="Avatar" class="w-12 h-12 rounded-full mr-4">
        <div>
          <p class="text-sm text-gray-500 mb-1">{{ comment.authorName }} el {{ formatDate(comment.createdAt) }}</p>
          <p>{{ comment.content }}</p>
        </div>
      </li>
    </ul>

    <div v-if="user && user.uid !== post.userId.split('/')[1]" class="mt-4">
      <h3 class="text-xl font-bold mb-2">Agregar Comentario</h3>
      <textarea v-model="newComment" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2" placeholder="Escribe tu comentario aquí..."></textarea>
      <button @click="addComment" :disabled="loading" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Comentar
      </button>
      <p v-if="errorMessage" class="text-red-500 text-xs italic mt-2">{{ errorMessage }}</p>
    </div>
    <div v-else-if="user && user.uid === post.userId.split('/')[1]" class="text-center mt-4">
      <p class="text-gray-600">No puedes comentar en tu propia publicación.</p>
    </div>
    <div v-else class="text-center mt-4">
      <p class="text-gray-600">Debes iniciar sesión para agregar un comentario.</p>
      <router-link class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" to="/login">Iniciar Sesión</router-link>
    </div>
  </div>
  <div v-else>
    <p>Cargando publicación...</p>
  </div>
</template>

<script>
import {onMounted, ref, computed} from 'vue';
import {doc, getDoc, collection, addDoc, query, where, getDocs, Timestamp} from 'firebase/firestore';
import {db, auth} from '../services/firebase';
import {createComment} from '../services/comments'; // Importar la función createComment

export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const post = ref(null);
    const comments = ref([]);
    const newComment = ref('');
    const user = ref(null);
    const errorMessage = ref('');
    const loading = ref(false);

    onMounted(async () => {
      const docRef = doc(db, "posts", props.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        post.value = {...docSnap.data(), id: docSnap.id};
        await fetchComments();
      } else {
        console.log("No such document!");
      }

      auth.onAuthStateChanged(currentUser => {
        user.value = currentUser;
      });
    });

    const fetchComments = async () => {
      const commentsQuery = query(collection(db, "comments"), where("postId", "==", doc(db, "posts", props.id)));
      const querySnapshot = await getDocs(commentsQuery);
      comments.value = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    };

    const addComment = async () => {
      if (newComment.value.trim() === '') {
        errorMessage.value = 'El comentario no puede estar vacío.';
        return;
      }

      if (user.value.uid === post.value.userId.split('/')[1]) {
        errorMessage.value = 'No puedes comentar en tu propia publicación.';
        return;
      }

      loading.value = true;

      try {
        await createComment(user.value.uid, props.id, newComment.value);
        newComment.value = '';
        errorMessage.value = '';
        await fetchComments();
      } catch (error) {
        errorMessage.value = 'Error al agregar el comentario: ' + error.message;
      } finally {
        loading.value = false;
      }
    };

    const sortedComments = computed(() => {
      return comments.value.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    });

    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    return {post, comments, sortedComments, newComment, user, errorMessage, loading, addComment, formatDate};
  }
};
</script>

<style scoped>
.prose {
  max-width: 100%;
}
</style>
