<script>
import { onMounted, ref } from 'vue';
import { getPostById, updatePost } from '../services/posts.js';
import {auth, db, storage} from '../services/firebase';
import { useRouter } from 'vue-router';
import {doc, getDoc} from "firebase/firestore";
async function getPost(postId) {
  const postDoc = await getDoc(doc(db, "posts", postId));
  if (postDoc.exists()) {
    return postDoc.data();
  } else {
    console.log('No se encontró el post!');
    return null;
  }
}
export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  methods: {

  },
  async beforeRouteEnter(to, from, next) {
    const postId = to.params.id;
    const post = await getPost(postId);
    const user = auth.currentUser;

    if (user && post.authorId === user.uid) {
      next();
    } else {
      next('/404');
    }
  },

  async beforeRouteUpdate(to, from, next) {
    const postId = to.params.id;
    const post = await getPost(postId);
    const user = auth.currentUser;

    if (user && post.authorId === user.uid) {
      next();
    } else {
      next('/404');
    }
  },
  setup(props) {
    const post = ref(null);
    const postTitle = ref('');
    const postContent = ref('');
    const postSourceCode = ref('');
    const postImage = ref(null);
    const user = ref(null);
    const errorMessage = ref('');
    const loading = ref(false);
    const router = useRouter(); // Obtiene el router

    onMounted(async () => {
      try {
        loading.value = true;
        const postData = await getPostById(props.id);
        if (postData) {
          post.value = postData;
          postTitle.value = postData.title;
          postContent.value = postData.content;
          postSourceCode.value = postData.sourcecode;
          postImage.value = postData.image;
        }

        auth.onAuthStateChanged(currentUser => {
          user.value = currentUser;
        });
      } catch (error) {
        errorMessage.value = "Error al cargar la publicación.";
      } finally {
        loading.value = false;
      }
    });

    const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      const storageRef = storage.ref();
      const fileRef = storageRef.child(file.name);
      await fileRef.put(file);
      postImage.value = await fileRef.getDownloadURL();
    };

    const handlePostUpdate = async () => {
      if (user.value && user.value.uid === post.value.userId) {
        if (postTitle.value === undefined || postContent.value === undefined || postSourceCode.value === undefined) {
          errorMessage.value = "Los campos 'title', 'content' y 'sourcecode' no pueden ser undefined";
          return;
        }

        const postData = {
          title: postTitle.value,
          content: postContent.value,
          sourcecode: postSourceCode.value,
          image: postImage.value
        };

        try {
          loading.value = true;
          await updatePost(props.id, postData);
          localStorage.setItem('postUpdated', 'true');
          setTimeout(() => {
            router.push('/perfil');
          }, 1000);
        } catch (error) {
          errorMessage.value = "Error al actualizar la publicación.";
        } finally {
          loading.value = false;
        }
      } else {
        errorMessage.value = 'No tienes permiso para editar esta publicación';
      }
    };

    return {
      post,
      postTitle,
      postContent,
      postImage,
      postSourceCode,
      handlePostUpdate,
      handleImageUpload,
      errorMessage,
      loading
    };
  }
};
</script>

<template>
  <div class="edit-post p-6 bg-gray-100 min-h-screen flex flex-col items-center">
    <div v-if="post && !loading" class="w-full max-w-4xl bg-white p-6 rounded shadow">
      <h1 class="text-3xl font-bold mb-4 text-center mt-4">Editar Publicación</h1>
      <form @submit.prevent="handlePostUpdate" class="flex flex-col space-y-4">
        <label for="postTitle" class="block text-sm font-medium text-gray-700">Título</label>
        <input v-model="postTitle" id="postTitle" type="text" placeholder="Título" class="p-2 rounded border">

        <label for="postContent" class="block text-sm font-medium text-gray-700">Contenido</label>
        <textarea v-model="postContent" id="postContent" placeholder="Contenido" class="p-2 rounded border"></textarea>

        <label for="postSourceCode" class="block text-sm font-medium text-gray-700">Código fuente</label>
        <textarea v-model="postSourceCode" id="postSourceCode" placeholder="Código fuente" class="p-2 rounded border"></textarea>

        <label for="postImage" class="block text-sm font-medium text-gray-700">Imagen del post</label>
        <input id="postImage" name="postImage" type="file" @change="handleImageUpload" class="mt-1 block w-full">
        <div v-if="postImage">
          <img :src="postImage" alt="Imagen del post" class="mt-2 max-h-48">
        </div>

        <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Actualizar Publicación</button>

        <div v-if="errorMessage" class="text-red-500 mt-2">{{ errorMessage }}</div>
      </form>
    </div>
    <div v-else-if="loading" class="w-full max-w-4xl bg-white p-6 rounded shadow">
      <div class="animate-pulse flex space-x-4">
        <div class="flex-1 space-y-4 py-1">
          <div class="h-4 bg-gray-400 rounded w-3/4"></div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-400 rounded"></div>
            <div class="h-4 bg-gray-400 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Cargando publicación...</p>
    </div>
  </div>
</template>


