<template>
  <form @submit.prevent="handleChangePassword" class="mb-4">
    <label for="currentPassword" class="block text-gray-700 text-sm font-bold mb-2">Contraseña actual</label>
    <input v-model="currentPassword" type="password" id="currentPassword" placeholder="Contraseña actual"
           class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"/>
    <label for="newPassword" class="block text-gray-700 text-sm font-bold mb-2">Nueva contraseña</label>
    <input v-model="newPassword" type="password" id="newPassword" placeholder="Nueva contraseña"
           class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"/>
    <button type="submit"
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
      Actualizar contraseña
    </button>
  </form>
</template>

<script>
import { updateUserPassword } from "../services/auth.js";
import router from "../router/router.js";

export default {
  name: 'UpdatePassword',
  props: {
    user: Object,
  },
  data() {
    return {
      currentPassword: '',
      newPassword: '',
      errorMessage: '',
    };
  },
  methods : {
    async handleChangePassword() {
      if (this.currentPassword && this.newPassword) {
        try {
          await updateUserPassword(this.currentPassword, this.newPassword);
          localStorage.setItem('passwordUpdated', 'true');
          await router.push('/perfil');
        } catch (error) {
          if (error.message === 'La contraseña actual es incorrecta') {
            this.errorMessage = 'La contraseña actual es incorrecta. Por favor, inténtalo de nuevo.';
          } else {
            this.errorMessage = error.message;
          }
        }
      } else {
        this.errorMessage = 'Por favor, ingrese la contraseña actual y la nueva contraseña';
      }
    }
  }
}
</script>
