<script>
import { onMounted, ref } from 'vue';
import { getAllUsers } from '../services/user-profile';
import { getPostsByUser } from '../services/posts';
import MainH1 from "../components/MainH1.vue";

export default {
  props: ['userId'],
  components: {MainH1},
  setup() {
    const allUsers = ref([]);
    const isLoading = ref(true);

    onMounted(async () => {
      const users = await getAllUsers();
      for (let user of users) {
        user.posts = await getPostsByUser(user.id);
        user.currentPage = 1;
      }
      allUsers.value = users;
      isLoading.value = false;
    });

    return {
      allUsers,
      isLoading,
    };
  },
};
</script>

<template>
  <main-h1 class="text-center mb-6">Perfiles de usuarios</main-h1>

  <div class="flex justify-center items-center mt-4 mb-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-if="isLoading" class="rounded overflow-hidden shadow-lg p-6 bg-gray-200 animate-pulse"></div>
      <div v-for="user in allUsers" :key="user.id" class="rounded overflow-hidden shadow-lg p-6 bg-white flex items-center">
        <img class="w-20 h-20 object-cover object-center rounded-full mr-4" :src="user.photoURL" alt="Profile photo">
        <div>
          <div class="font-bold text-xl mb-2">{{ user.displayName ? user.displayName : (user.name ? user.name : 'Usuario sin apodo') }}</div>
          <p class="text-gray-700 text-base">
            {{ user.bio ? user.bio : 'Perfil sin descripción' }}
          </p>
          <div v-if="user.posts && user.posts.length">
            <h3 class="font-bold text-lg mb-2">Publicaciones:</h3>
            <ul>
              <li v-for="post in user.posts.slice((user.currentPage - 1) * 3, user.currentPage * 3)" :key="post.id">
                <router-link :to="`/post-detail/${post.id}`" class="block">
                  <h3 class=" font-bold mb-2">{{ post.title }}</h3>
                  <p>{{ post.content }}</p>
                </router-link>
              </li>
            </ul>
            <div class="pagination-container flex justify-between mt-2">
              <div v-if="user.posts.length > 3">
                <button @click="user.currentPage--" :disabled="user.currentPage === 1" class="p-2">
                  <i class="fas fa-arrow-left"></i>
                </button>
                <button @click="user.currentPage++" :disabled="user.currentPage === Math.ceil(user.posts.length / 3)" class="p-2">
                  <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pagination-container {
  min-height: 40px;
}
</style>
