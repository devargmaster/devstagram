<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { subscribeToAuth, logout } from './services/auth';

export default {
  setup() {
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

    return {
      user,
      handleLogout
    };
  }
};
</script>
<template>
  <header class="p-5 border-b bg-white shadow">
    <div class="container mx-auto flex justify-between items-center">
      <div class="flex flex-col items-center">
        <router-link class="font-bold  text-red-800 text-sm" to="/">
          <img src="/images/logosm.png" alt="DevStagram" class="h-auto w-auto object-cover mb-2"/>
        </router-link>
        <h2 class="text-red-800 font-bold">DEVSTAGRAM</h2>
        <p class="text-xs text-gray-500">La red social para desarrolladores</p>
      </div>
      <nav class="flex gap-2 items-center">
        <router-link class="font-bold uppercase text-red-800 text-sm" to="/">Home</router-link>
        <router-link class="font-bold uppercase text-red-800 text-sm" to="/about">Nosotros</router-link>
        <router-link v-if="!user" class="font-bold uppercase text-red-800 text-sm" title="Ingresar" to="/login">
          <i class="fas fa-sign-in-alt"></i>
        </router-link>
        <router-link v-if="!user" class="font-bold uppercase text-red-800 text-sm" title="Registrarse" to="/registro">
          <i class="fas fa-user-plus"></i>
        </router-link>
        <router-link class="font-bold uppercase text-red-800 text-sm" v-if="user" :to="{ name: 'UsersProfiles', params: { userId: user.id } }">
          Ver perfiles
        </router-link>
        <router-link v-if="user" class="font-bold uppercase text-red-800 text-sm" to="/perfil">
          <i class="fas fa-user"></i>
        </router-link>
        <button v-if="user" @click="handleLogout" class="font-bold uppercase text-red-800 text-sm">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </nav>
    </div>
  </header>
  <main>
    <router-view />
  </main>
  <footer class="flex justify-center items-center h-[100px] bg-green-400 text-white font-bold w-full max-w-4xl mx-auto">
    <div>
      <p>Copyright &copy; Devstagram 2024</p>
    </div>
  </footer>
</template>




