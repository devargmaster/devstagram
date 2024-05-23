<script>
import { onMounted, ref, computed, nextTick } from 'vue';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { createComment } from '../services/comments';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';

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
    const codeBlock = ref(null);

    onMounted(async () => {
      const docRef = doc(db, "posts", props.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        post.value = {...docSnap.data(), id: docSnap.id};
        await fetchComments();
        nextTick(() => {
          if (codeBlock.value) {
            Prism.highlightElement(codeBlock.value);
          }
        });
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

    const handleLike = async (postId) => {
      if (user.value) {
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, {
          likesCount: arrayUnion(user.value.uid)
        });

        const updatedPost = await getDoc(postRef);
        post.value = {...updatedPost.data(), id: updatedPost.id};
      } else {
        alert("Debes iniciar sesión para dar like");
      }
    };

    const copyCode = () => {
      const code = codeBlock.value.innerText;
      navigator.clipboard.writeText(code).then(() => {
        alert('Código copiado al portapapeles');
      });
    };

    const sortedComments = computed(() => {
      return comments.value.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    });

    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    return {post, comments, sortedComments, newComment, user, errorMessage, loading, addComment, formatDate, codeBlock, copyCode, handleLike};
  }
};
</script>

<template>
  <div class="post-detail p-6 bg-gray-100 min-h-screen flex flex-col items-center">
    <div v-if="post" class="w-full max-w-4xl">
      <h1 class="text-3xl font-bold mb-4 text-center">{{ post.title }}</h1>
      <p class="text-sm text-gray-500 mb-4 text-center">Publicado por {{ post.authorName }} el {{ formatDate(post.createdAt) }}</p>
      <div class="mb-4 flex justify-center">
        <div class="flex items-center mr-4">
          <button @click="handleLike(post.id)"
                  class="flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            <i class="fas fa-thumbs-up mr-2"></i> Like ({{ post.likesCount.length }})
          </button>
        </div>
        <div class="flex items-center">
          <i class="fas fa-comments mr-2"></i> Comentarios: {{ comments.length }}
        </div>
      </div>
      <div v-html="post.content" class="prose mb-4 mx-auto"></div>

      <div v-if="post.sourcecode" class="relative mb-4 mx-auto">
        <div class="code-container bg-gray-100 p-4 rounded overflow-x-auto relative">
          <pre><code ref="codeBlock" class="language-javascript">{{ post.sourcecode }}</code></pre>
          <button @click="copyCode" class="absolute top-2 right-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline">
            Copiar código
          </button>
        </div>
      </div>

      <h2 class="text-2xl font-bold mb-4 text-center">Comentarios</h2>
      <ul class="mb-4 mx-auto">
        <li v-for="comment in sortedComments" :key="comment.id" class="bg-white p-4 mb-4 rounded shadow flex items-start">
          <img :src="'/images/perfil.jpg'" alt="Avatar" class="w-12 h-12 rounded-full mr-4">
          <div>
            <p class="text-sm text-gray-500 mb-1">{{ comment.authorName }} el {{ formatDate(comment.createdAt) }}</p>
            <p>{{ comment.content }}</p>
          </div>
        </li>
      </ul>

      <div v-if="user && user.uid !== post.userId.split('/')[1]" class="mt-4 mx-auto">
        <h3 class="text-xl font-bold mb-2 text-center">Agregar Comentario</h3>
        <textarea v-model="newComment" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2" placeholder="Escribe tu comentario aquí..."></textarea>
        <button @click="addComment" :disabled="loading" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-auto block">
          Comentar
        </button>
        <p v-if="errorMessage" class="text-red-500 text-xs italic mt-2 text-center">{{ errorMessage }}</p>
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
  </div>
</template>


<style scoped>
.prose {
  max-width: 100%;
}

pre {
  max-width: 100%;
  overflow-x: auto;
}

.code-container {
  max-width: 800px;
  max-height: 400px;
  overflow: auto;
  position: relative;
  margin: 0 auto;
}

pre code {
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
