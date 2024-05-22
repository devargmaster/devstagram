<template>
  <div class="change-profile-picture">
    <input type="file" @change="onFileChange" class="mb-4" />
    <button @click="uploadImage" :disabled="!selectedFile" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
      Subir Imagen
    </button>
    <p v-if="errorMessage" class="text-red-500 text-xs italic mt-2">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { uploadImageAndGetUrl } from '../services/storage';
import { auth, db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default {
  setup() {
    const selectedFile = ref(null);
    const errorMessage = ref('');

    const onFileChange = (e) => {
      selectedFile.value = e.target.files[0];
    };

    const uploadImage = async () => {
      if (!selectedFile.value) {
        errorMessage.value = 'Por favor, selecciona una imagen.';
        return;
      }

      try {
        const user = auth.currentUser;
        if (!user) {
          errorMessage.value = 'Debes iniciar sesión para cambiar tu foto de perfil.';
          return;
        }

        const imageUrl = await uploadImageAndGetUrl(user.uid, selectedFile.value);
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          profilePicture: imageUrl,
        });

        alert('Imagen subida con éxito');
      } catch (error) {
        errorMessage.value = 'Error al subir la imagen: ' + error.message;
      }
    };

    return { selectedFile, onFileChange, uploadImage, errorMessage };
  }
};
</script>

