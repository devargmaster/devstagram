<script>
import MainH1 from '../components/MainH1.vue';
import MainLabel from '../components/MainLabel.vue';
import MainButton from '../components/MainButton.vue';
import { updateUserPhoto } from '../services/auth';

export default {
  name: 'MyProfileEditPhoto',
  components: {MainH1, MainLabel, MainButton},
  data() {
    return {
      photo: null,
      photoPreview: null,
      uploadingPhoto: false,
    }
  },
  methods: {
    handleFileSelection(event) {
      this.photo = event.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        this.photoPreview = reader.result;
      });
      reader.readAsDataURL(this.photo);
    },
    async handleFileUpload() {
      this.uploadingPhoto = true;
      try {
        await updateUserPhoto(this.photo);
        this.$router.push('/perfil'); // Redirige al usuario a la página de perfil
      } catch (error) {
      }
      this.uploadingPhoto = false;
    }
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
    <div class="w-full max-w-md mx-auto">
      <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <MainH1>Editar mi Foto de Perfil</MainH1>
        <form
          action="#"
          class="flex flex-col gap-4"
          @submit.prevent="handleFileUpload"
        >
          <div class="mb-3">
            <MainLabel for="photo">Foto</MainLabel>
            <input
              type="file"
              id="photo"
              class="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
              :read-only="uploadingPhoto"
              @change="handleFileSelection"
            >
          </div>
          <MainButton>Actualizar</MainButton>
          <div>
            <h2 class="mb-3">Previsualización de la Foto Seleccionada</h2>
            <img
              v-if="photoPreview != null"
              :src="photoPreview"
              alt=""
              class="preview-image"
            >
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-image {
  max-width: 100%;
  height: auto;
}
</style>
