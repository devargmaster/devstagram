<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <form @submit.prevent="handleChangePassword" class="w-full max-w-sm bg-white p-6 m-4 rounded shadow-md">
      <main-h1 class="text-center mb-4">Actualizar Contraseña</main-h1>
      <div class="mb-4">
        <label for="currentPassword" class="block text-gray-700 text-sm font-bold mb-2">Contraseña actual</label>
        <input v-model="currentPassword" type="password" id="currentPassword" placeholder="Contraseña actual"
               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"/>
        <div v-if="v$.currentPassword.$error" class="text-red-500 text-sm">La contraseña actual es requerida</div>
      </div>
      <div class="mb-4">
        <label for="newPassword" class="block text-gray-700 text-sm font-bold mb-2">Nueva contraseña</label>
        <input v-model="newPassword" type="password" id="newPassword" placeholder="Nueva contraseña"
               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"/>
        <div v-if="v$.newPassword.$error" class="text-red-500 text-sm">La nueva contraseña debe tener al menos 8 caracteres</div>
      </div>
      <div v-if="errorMessage" class="mb-4 text-red-500 text-sm">
        {{ errorMessage }}
      </div>
      <div class="flex items-center justify-between">
        <button type="submit"
                class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" :disabled="loading">
          Actualizar contraseña
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength } from '@vuelidate/validators';
import MainH1 from "../components/MainH1.vue";
import { updateUserPassword } from "../services/auth.js";
import router from "../router/router.js";

export default {
  name: 'UpdatePassword',
  components: { MainH1 },
  props: {
    user: Object,
  },
  setup() {
    const currentPassword = ref('');
    const newPassword = ref('');
    const loading = ref(false);
    const errorMessage = ref('');

    const rules = {
      currentPassword: { required },
      newPassword: { required, minLength: minLength(8) }
    };

    const v$ = useVuelidate(rules, { currentPassword, newPassword });

    const handleChangePassword = async () => {
      v$.value.$touch();
      if (v$.value.$error) {
        errorMessage.value = 'Por favor, corrija los errores antes de continuar.';
        return;
      }
      if (currentPassword.value && newPassword.value) {
        loading.value = true;
        try {
          await updateUserPassword(currentPassword.value, newPassword.value);
          localStorage.setItem('passwordUpdated', 'true');
          await router.push('/perfil');
        } catch (error) {
          if (error.message === 'La contraseña actual es incorrecta') {
            errorMessage.value = 'La contraseña actual es incorrecta. Por favor, inténtalo de nuevo.';
          } else {
            errorMessage.value = error.message;
          }
        }
        loading.value = false;
      } else {
        errorMessage.value = 'Por favor, ingrese la contraseña actual y la nueva contraseña';
      }
    };

    return {
      currentPassword,
      newPassword,
      loading,
      errorMessage,
      handleChangePassword,
      v$
    };
  }
}
</script>
