<script>
import MainH1 from '../components/MainH1.vue';
import MainLabel from '../components/MainLabel.vue';
import MainButton from '../components/MainButton.vue';
import { subscribeToAuth, updateUser } from '../services/auth';

export default {
  name: 'MyProfileEdit',
  components: { MainH1, MainLabel, MainButton },
  data() {
    return {
      authUser: {
        id: '',
        email: '',
        displayName: '',
        bio: '',
        career: '',
        photoURL: null,
      },
      unsubscribeFromAuth: () => {},

      profileData: {
        displayName: '',
        bio: '',
        career: '',
      },
      editingProfile: false,
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.profileData.displayName || !this.profileData.displayName.trim() ||
        !this.profileData.bio || !this.profileData.bio.trim() ||
        !this.profileData.career || !this.profileData.career.trim()) {
        alert('Por favor, rellena todos los campos del formulario.');
        return;
      }

      this.editingProfile = true;
      console.log('Actualizando perfil con los siguientes datos:', this.profileData);
      try {
        await updateUser({
          displayName: this.profileData.displayName,
          bio: this.profileData.bio,
          career: this.profileData.career,
        });
        this.$router.push('/perfil');
      } catch (error) {
        console.error('[MyProfileEdit handleSubmit] Error al editar el perfil: ', error);
      }
      this.editingProfile = false;
    }
  },
  mounted() {
    this.unsubscribeFromAuth = subscribeToAuth(newUserData => {
      if (newUserData) {
        this.authUser = newUserData;
        this.profileData.displayName = this.authUser.displayName || '';
        this.profileData.career = this.authUser.career || '';
        this.profileData.bio = this.authUser.bio || '';
      }
    });
  },
  unmounted() {
    this.unsubscribeFromAuth();
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md">
      <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div class="mb-4">
          <h2 class="text-2xl font-bold mb-2">Editar mi Perfil</h2>
        </div>
        <form
          action="#"
          @submit.prevent="handleSubmit"
        >
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="bio">
              Biografía
            </label>
            <textarea
              id="bio"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              :disabled="editingProfile"
              v-model="profileData.bio"
            ></textarea>
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="displayName">
              Nombre de Usuario
            </label>
            <input
              type="text"
              id="displayName"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              :disabled="editingProfile"
              v-model="profileData.displayName"
            >
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="career">
              Carrera
            </label>
            <input
              type="text"
              id="career"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              :disabled="editingProfile"
              v-model="profileData.career"
            >
          </div>
          <div class="flex items-center justify-between">
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit" :disabled="editingProfile">
              Actualizar mis datos
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
