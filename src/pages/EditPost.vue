<script>
import { onMounted, ref } from 'vue';
import { getPostById, updatePost } from '../services/posts.js';
import { auth } from '../services/firebase';

export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const post = ref(null);
    const postTitle = ref('');
    const postContent = ref('');
    const postSourceCode = ref(''); // Nuevo campo para sourcecode
    const user = ref(null);

    onMounted(async () => {
      const postData = await getPostById(props.id);
      if (postData) {
        post.value = postData;
        postTitle.value = postData.title;
        postContent.value = postData.content;
        postSourceCode.value = postData.sourcecode; // Inicializa sourcecode
      }

      auth.onAuthStateChanged(currentUser => {
        user.value = currentUser;
      });
    });

    const handlePostUpdate = async () => {
      if (user.value && user.value.uid === post.value.userId) {
        // Verifica si los campos son undefined
        if (postTitle.value === undefined || postContent.value === undefined || postSourceCode.value === undefined) {
          throw new Error("Los campos 'title', 'content' y 'sourcecode' no pueden ser undefined");
        }

        // Crea un objeto postData con los valores de los campos
        const postData = {
          title: postTitle.value,
          content: postContent.value,
          sourcecode: postSourceCode.value // Añade sourcecode al objeto
        };

        await updatePost(props.id, postData);
        alert('Publicación actualizada exitosamente');
      } else {
        alert('No tienes permiso para editar esta publicación');
      }
    };

    return {
      post,
      postTitle,
      postContent,
      postSourceCode, // Retorna sourcecode
      handlePostUpdate
    };
  }
};
</script>

<template>
  <div class="edit-post p-6 bg-gray-100 min-h-screen flex flex-col items-center">
    <div v-if="post" class="w-full max-w-4xl bg-white p-6 rounded shadow">
      <h1 class="text-3xl font-bold mb-4 text-center mt-4">Editar Publicación</h1>
      <form @submit.prevent="handlePostUpdate" class="flex flex-col space-y-4">
        <input v-model="postTitle" type="text" placeholder="Título" class="p-2 rounded border">
        <textarea v-model="postContent" placeholder="Contenido" class="p-2 rounded border"></textarea>
        <textarea v-model="postSourceCode" placeholder="Código fuente" class="p-2 rounded border"></textarea> <!-- Nuevo campo para sourcecode -->
        <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Actualizar Publicación</button>
      </form>
    </div>
    <div v-else>
      <p>Cargando publicación...</p>
    </div>
  </div>
</template>

<style scoped>

</style>
