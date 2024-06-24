<script>
import { onMounted, ref } from 'vue';
import { getAllUsers } from '../services/user-profile';
import { getPostsByUser } from '../services/posts';

export default {
  setup() {
    const usersWithPosts = ref([]);

    onMounted(async () => {
      const allUsers = await getAllUsers();
      for (const user of allUsers) {
        console.log('user', user);
        const posts = await getPostsByUser(user.id);
        if (posts.length > 0) {
          usersWithPosts.value.push(user);
        }
      }
    });

    return {
      usersWithPosts,
    };
  },
};
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div v-for="user in usersWithPosts" :key="user.id" class="rounded overflow-hidden shadow-lg p-6 bg-white">
      <img class="w-full h-64 object-cover" :src="user.photoURL" alt="Profile photo">
      <div class="px-6 py-4">
        <div class="font-bold text-xl mb-2">{{ user.displayName }}</div>
        <p class="text-gray-700 text-base">
          {{ user.bio }}
        </p>
      </div>
    </div>
  </div>
</template>
