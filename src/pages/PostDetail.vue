<script>
import { onMounted, ref, computed, nextTick } from 'vue';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import { getUserProfileById } from "../services/user-profile.js";
import {createComment, getCommentsByPostId} from "../services/comments.js";

export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const post = ref(null);
    const user = ref(null);
    const userProfile = ref(null); // Añade esta línea
    const comments = ref([]);
    const errorMessage = ref('');
    const loading = ref(false);
    const codeBlock = ref(null);
    const newCommentContent = ref('');

    const formatDate = (timestamp) => {
      const date = timestamp.toDate();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${day}/${month}/${year}`;
    };
    const handleCommentSubmit = async () => {
      if (newCommentContent.value.trim() !== '') {
        const newComment = await createComment(user.value.uid, user.value.displayName, props.id, newCommentContent.value);
        comments.value.push(newComment);
        newCommentContent.value = '';
      }
    };
    onMounted(async () => {
      const docRef = doc(db, "posts", props.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        post.value = {...docSnap.data(), id: docSnap.id};
        nextTick(() => {
          if (codeBlock.value) {
            Prism.highlightElement(codeBlock.value);
          }
        });
        const loadComments = async () => {
          if (props.id) {
            const postRef = doc(db, "posts", props.id);
            const commentsData = await getCommentsByPostId(postRef);
            comments.value = commentsData;
            console.log(comments.value);
          }
        };
        loadComments();
      } else {
        console.log("No se encuentra el documento!");
      }

      auth.onAuthStateChanged(async currentUser => {
        user.value = currentUser;
        if (currentUser) {
          userProfile.value = await getUserProfileById(currentUser.uid);
        }
      });
    });

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

    return {
      post,
      user,
      userProfile, // Añade esta línea
      comments,
      errorMessage,
      loading,
      codeBlock,
      copyCode,
      handleLike,
      newCommentContent,
      handleCommentSubmit,
      formatDate
    };
  }
};
</script>

<template>
  <div class="post-detail p-6 bg-gray-100 min-h-screen flex flex-col items-center">
    <div v-if="post" class="w-full max-w-4xl bg-white p-6 rounded shadow">
      <h1 class="text-3xl font-bold mb-4 text-center mt-4">{{ post.title }}</h1>
      <p class="text-sm text-gray-500 text-center">Publicado por {{ post.authorName }} el {{ formatDate(post.createdAt) }}</p>
      <div class="mb-4 flex flex-col items-center">
        <div>
          <img :src="post.postImage" alt="Imagen del post" class="w-48 h-48 object-cover" />
        </div>
        <div class="flex items-center mt-4">
          <button @click="handleLike(post.id)"
                  class="flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            <i class="fas fa-thumbs-up mr-2"></i> Like ({{ post.likesCount.length }})
          </button>
        </div>
      </div>

      <div v-html="post.content" class="prose mb-4 mx-auto bg-white p-6 rounded shadow mb-6"></div>

      <div v-if="post.sourcecode" class="relative mb-4 mx-auto">
        <div class="code-container bg-gray-100 p-4 rounded overflow-x-auto relative ">
          <pre><code ref="codeBlock" class="language-javascript">{{ post.sourcecode }}</code></pre>
          <button @click="copyCode"
                  class="absolute top-2 right-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline">
            Copiar código
          </button>
        </div>
      </div>

      <h2 class="text-2xl font-bold mb-4">Comentarios</h2>
      <div v-for="comment in comments" :key="comment.id" class="mb-4 bg-gray-100 p-4 rounded shadow">
        <p class="mb-2">{{ comment.content }}</p>
        <p class="text-sm text-gray-500">Publicado por <img :src="comment.authorImage ? comment.authorImage : '/images/perfil.jpg'" alt="Imagen del autor" class="inline-block rounded-full h-8 w-8"> {{ comment.authorName }} - {{ new Date(comment.createdAt.seconds * 1000).toLocaleDateString() }}</p>
      </div>
      <div v-if="user">
        <h2 class="text-2xl font-bold mb-4">Agregar un comentario</h2>
        <form @submit.prevent="handleCommentSubmit" class="flex flex-col space-y-4">
          en
          <textarea v-model="newCommentContent" placeholder="Escribe tu comentario aquí..." class="p-2 rounded border"></textarea>
          <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Enviar comentario</button>
        </form>
      </div>
      <div v-else>
        <p class="mb-2">Debes iniciar sesión para agregar un comentario.</p>
        <router-link to="/login" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Iniciar sesión</router-link>
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
