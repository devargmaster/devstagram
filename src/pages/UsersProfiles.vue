<script>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getPostsByUser } from '../services/posts';
import { getUserById } from '../services/user-profile';

export default {
  setup() {
    const route = useRoute();
    const user = ref(null);
    const posts = ref([]);

    onMounted(async () => {
      const userId = route.params.userId;
      user.value = await getUserById(userId);
      posts.value = await getPostsByUser(userId);
    });

    return {
      user,
      posts,
    };
  },
};
</script>
<template>
  <div>
    <h1 v-if="user">{{ user.name }}'s Profile</h1>
    <div v-for="post in posts" :key="post.id">
      <h2>{{ post.title }}</h2>
      <p>{{ post.content }}</p>
    </div>
  </div>
</template>
