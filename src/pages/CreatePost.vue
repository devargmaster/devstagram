<template>
  <div class="create-post max-w-xl mx-auto mt-10">
    <form @submit.prevent="handleSubmit" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="title">
          Título
        </label>
        <input v-model="title" id="title" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" required>
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="content">
         escribir el contenido
        </label>
        <textarea v-model="content" id="content" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required></textarea>
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="sourcecode">
         Si tu contenido requiere mostrar codigo pegalo aqui
        </label>
        <textarea v-model="sourcecode" id="sourcecode" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required></textarea>
      </div>
      <div class="flex items-center justify-between">
        <button type="submit" :disabled="loading" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Publicar
        </button>
        <p v-if="errorMessage" class="text-red-500 text-xs italic">{{ errorMessage }}</p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { createPost } from '../services/posts';
import { auth } from '../services/firebase';
const title = ref('');
const content = ref('');
const sourcecode = ref('');
const loading = ref(false);
const errorMessage = ref('');

const handleSubmit = async () => {
  if (auth.currentUser) {
    loading.value = true;
    errorMessage.value = '';
    try {
      const user = auth.currentUser;
      await createPost(auth.currentUser.uid, content.value, title.value, sourcecode.value, user.displayName || user.email);
      console.log(sourcecode.value)
      title.value = '';
      content.value = '';
      sourcecode.value = '';
      alert('Publicación creada exitosamente');
    } catch (error) {
      errorMessage.value = error.message;
    }
    loading.value = false;
  } else {
    errorMessage.value = 'Debes iniciar sesión para crear una publicación';
  }
};
</script>
