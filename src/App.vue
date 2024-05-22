<template>
  <header class="p-5 border-b bg-white shadow">
    <div class="container mx-auto flex justify-between items-center">
      <div class="flex flex-col items-center">
        <router-link class="font-bold  text-red-800 text-sm" to="/">
          <img src="/images/logosm.png" alt="DevStagram" class="h-auto w-auto object-cover mb-2"/>
        </router-link>
      </div>
      <nav class="flex gap-2 items-center">
        <router-link class="font-bold uppercase text-red-800 text-sm" to="/">Home</router-link>
        <router-link class="font-bold uppercase text-red-800 text-sm" to="/about">About</router-link>
        <router-link v-if="!user" class="font-bold uppercase text-red-800 text-sm" to="/login">Login</router-link>
        <router-link v-if="!user" class="font-bold uppercase text-red-800 text-sm" to="/registro">Registro</router-link>
        <router-link v-if="user" class="font-bold uppercase text-red-800 text-sm" to="/perfil">Perfil</router-link>
        <button v-if="user" @click="handleLogout" class="font-bold uppercase text-red-800 text-sm">Salir</button>
      </nav>
    </div>
  </header>
  <main>
    <router-view />
  </main>
  <footer class="flex justify-center items-center h-[100px]">
    <p>Copyright &copy; Davinci 2024</p>
  </footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { subscribeToAuth, logout } from './services/auth';

const user = ref(null);
const router = useRouter();

const handleLogout = async () => {
  try {
    await logout();
    router.push('/');
  } catch (error) {
    console.error("Error al cerrar sesión: ", error);
  }
};

onMounted(() => {
  const unsubscribe = subscribeToAuth((userData) => {
    user.value = userData.id ? userData : null;
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
});
</script>


