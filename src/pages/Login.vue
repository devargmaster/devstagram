<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <form @submit.prevent="handleSubmit" class="w-full max-w-sm bg-white p-6 m-4 rounded shadow-md">
      <h1 class="text-center mb-4 text-4xl">Iniciar Sesión</h1>
      <div class="mb-4">
        <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email</label>
        <input v-model="email" type="email" id="email" placeholder="Tu email"
               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
      </div>
      <div class="mb-6">
        <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
        <input v-model="password" type="password" id="password" placeholder="Tu contraseña"
               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"/>
      </div>
      <div v-if="errorMessage" class="mb-4 text-red-500 text-sm">
        {{ errorMessage }}
      </div>
      <div class="flex items-center justify-between">
        <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" :disabled="loading">
          Iniciar Sesión
        </button>
        <router-link to="/registro" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Registrarse
        </router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../services/auth';

export default {
  name: 'Login',
  setup() {
    const email = ref('');
    const password = ref('');
    const loading = ref(false);
    const errorMessage = ref('');
    const router = useRouter();

    const handleSubmit = async () => {
      loading.value = true;
      errorMessage.value = '';
      try {
        await login(email.value, password.value);
        router.push('/perfil');
      } catch (error) {
        if (error.code === 'auth/wrong-password') {
          errorMessage.value = 'Contraseña incorrecta. Por favor, inténtalo de nuevo.';
        } else if (error.code === 'auth/user-not-found') {
          errorMessage.value = 'No se encontró una cuenta con este correo electrónico.';
        } else {
          errorMessage.value = error.message;
        }
      }
      loading.value = false;
    };

    return {
      email,
      password,
      loading,
      errorMessage,
      handleSubmit
    };
  }
}
</script>
