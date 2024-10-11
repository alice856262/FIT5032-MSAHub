<template>
  <div class="container mt-3 mb-5" v-if="isAuthorized" aria-live="polite">
    <h1>{{ forumTitle }}</h1>
    <p>Welcome to the {{ forumType }} forum!</p>
    <ForumThreads :forumTitle="forumTitle" />
  </div>
  <div v-else>
    <p>You are not authorised to access this forum.</p>
    <router-link to="/community" aria-label="Go back to Community page">Go back to Community</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '/src/router/useAuth.js';
import ForumThreads from '../components/ForumThreads.vue';

const { currentUser, userType } = useAuth();
const route = useRoute();

const forumType = ref(route.params.forumType);
const forumTitle = ref('');
const isAuthorized = ref(false);

onMounted(() => {
  // Set forum title based on forum type
  switch (forumType.value) {
    case 'patient':
      forumTitle.value = 'Patient Forum';
      break;
    case 'caregiver':
      forumTitle.value = 'Caregiver Forum';
      break;
    case 'professional':
      forumTitle.value = 'Professional Forum';
      break;
    default:
      forumTitle.value = 'Community Forum';
      break;
  }

  // Check if the user is authorized to access this forum
  if (userType.value === 'admin') {
    isAuthorized.value = true; // Admins can access any forum
  } else if (userType.value === 'general') {
    if (currentUser.value.reason === forumType.value) {
      isAuthorized.value = true;
    } else {
      isAuthorized.value = false;
    }
  }
});
</script>

<style scoped>
.container {
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

p {
  color: #666;
  font-size: 1.125rem;
  line-height: 1.6;
}
</style>
