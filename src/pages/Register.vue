<script>
import { ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength } from '@vuelidate/validators';
import MainH1 from "../components/MainH1.vue";
import { register } from '../services/auth';

export default {
  name: 'Register',
  components: { MainH1 },
  setup() {
    const user = ref({
      name: '',
      email: '',
      password: '',
    });
    const loading = ref(false);
    const errorMessage = ref('');

    const rules = {
      name: { required },
      email: { required, email },
      password: { required, minLength: minLength(8) }
    };

    const v$ = useVuelidate(rules, user);

    const handleSubmit = async () => {
      v$.value.$touch();
      if (v$.value.$error) {
        errorMessage.value = 'Por favor, corrija los errores antes de continuar.';
        return;
      }
      loading.value = true;
      errorMessage.value = '';
      try {
        await register(user.value.email, user.value.password, user.value.name);
        this.$router.push({
          path: '/perfil',
        });
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          errorMessage.value = 'El correo electrónico ya está en uso.';
        } else {
          errorMessage.value = error.message;
        }
      }
      loading.value = false;
    };

    return {
      user,
      loading,
      errorMessage,
      handleSubmit,
      v$
    };
  }
}
</script>

<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <form @submit.prevent="handleSubmit" class="w-full max-w-sm bg-white p-6 m-4 rounded shadow-md">
      <main-h1 class="text-center mb-4">Crear una cuenta</main-h1>
      <div class="mb-4">
        <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Nombre</label>
        <input v-model="user.name" type="text" id="name" placeholder="Tu nombre"
               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
        <div v-if="v$.name.$error" class="text-red-500 text-sm">El nombre es requerido</div>
      </div>
      <div class="mb-4">
        <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email</label>
        <input v-model="user.email" type="email" id="email" placeholder="Tu email"
               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
        <div v-if="v$.email.$error" class="text-red-500 text-sm">Por favor, introduce un correo electrónico válido</div>
      </div>
      <div class="mb-6">
        <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Password</label>
        <input v-model="user.password" type="password" id="password" placeholder="Tu password"
               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"/>
        <div v-if="v$.password.$error" class="text-red-500 text-sm">La contraseña debe tener al menos 8 caracteres</div>
      </div>
      <div v-if="errorMessage" class="mb-4 text-red-500 text-sm">
        {{ errorMessage }}
      </div>
      <div class="flex items-center justify-between">
        <button type="submit" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" :disabled="loading">
          Registrarse
        </button>
      </div>
    </form>
  </div>
</template>
