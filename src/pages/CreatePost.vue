<script setup>
import { ref } from 'vue';
import { createPost } from '../services/posts';
import { auth, storage } from '../services/firebase';
import MainH1 from "../components/MainH1.vue";
import router from "../router/router.js";
import {ref as storageRef,getDownloadURL, uploadBytes} from "firebase/storage";

const title = ref('');
const content = ref('');
const sourcecode = ref('');
const loading = ref(false);
const errorMessage = ref('');
const postImage = ref(null);
const previewImage = ref('');
const uploadingImage = ref(false);

const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  previewImage.value = URL.createObjectURL(file);
  const fileRef = storageRef(storage, file.name);
  console.log('Subiendo imagen a Firebase Storage...');
  uploadingImage.value = true;
  await uploadBytes(fileRef, file);
  console.log('Imagen subida a Firebase Storage. Obteniendo URL de descarga...');
  postImage.value = await getDownloadURL(fileRef);
  console.log('URL de descarga obtenida:', postImage.value);
  uploadingImage.value = false;
};
const handleSubmit = async () => {
  if (auth.currentUser) {
    loading.value = true;
    errorMessage.value = '';
    try {
      if (!postImage.value) {
        errorMessage.value = 'Por favor, sube una imagen antes de publicar';
        loading.value = false;
        return;
      }
      const user = auth.currentUser;
      await createPost(auth.currentUser.uid, content.value, title.value, sourcecode.value, user.displayName || user.email, postImage.value);
      console.log(sourcecode.value);
      title.value = '';
      content.value = '';
      sourcecode.value = '';
      postImage.value = null;
      localStorage.setItem('postCreated', 'true');
      await router.push('/perfil');
    } catch (error) {
      errorMessage.value = error.message;
    }
    loading.value = false;
  } else {
    errorMessage.value = 'Debes iniciar sesión para crear una publicación';
  }
};

const handleEdit = async () => {
  if (auth.currentUser) {
    loading.value = true;
    errorMessage.value = '';
    try {
      const user = auth.currentUser;
      await updatePost(postId, auth.currentUser.uid, content.value, title.value, sourcecode.value, user.displayName || user.email);
      console.log(sourcecode.value);
      title.value = '';
      content.value = '';
      sourcecode.value = '';
      localStorage.setItem('postUpdated', 'true');
      await router.push('/perfil');
    } catch (error) {
      errorMessage.value = error.message;
    }
    loading.value = false;
  } else {
    errorMessage.value = 'Debes iniciar sesión para editar una publicación';
  }
};
</script>

<template>
  <main-h1 class="text-center mb-6">Crear Publicación</main-h1>
  <div class="create-post max-w-xl mx-auto mt-10">
    <form @submit.prevent="handleSubmit" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="title">
          Título
        </label>
        <input v-model="title" id="title"
               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
               type="text" required>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="content">
          Escribir el contenido
        </label>
        <textarea v-model="content" id="content"
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required></textarea>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="sourcecode">
          Si tu contenido requiere mostrar código pégalo aquí
        </label>
        <textarea v-model="sourcecode" id="sourcecode"
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required></textarea>
      </div>

      <div>
        <label for="postImage" class="block text-sm font-medium text-gray-700">Imagen del post</label>
        <input id="postImage" name="postImage" type="file" @change="handleImageUpload" class="mt-1 block w-full">
      </div>

      <div v-if="previewImage">
        <img :src="previewImage" alt="Previsualización de la imagen del post"/>
      </div>

      <div class="flex items-center justify-between">
        <button type="submit" :disabled="loading || uploadingImage"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Publicar
        </button>
        <p v-if="errorMessage" class="text-red-500 text-xs italic">{{ errorMessage }}</p>
      </div>
    </form>
  </div>
</template>
