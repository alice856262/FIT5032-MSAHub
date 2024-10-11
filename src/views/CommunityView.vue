<template>
  <div class="container mt-3 mb-5">
    <h1>Community Forums</h1>
    <p>The MSA community offers a platform to share experiences and support individuals navigate the challenges of MSA.</p>
    <p>Join a forum to connect with others in your community:</p>

    <div class="row mt-4">
      <!-- Patient Forum -->
      <div class="col-md-4">
        <div class="card forum-card">
          <div class="card-body">
            <h5 class="card-title">💬 Patient Forum</h5>
            <p class="card-text">
              Connect with other MSA patients to share experiences, support, and resources.
            </p>
            <button class="btn btn-primary" @click="joinForum('patient')" aria-label="Join the Patient Forum">Join Patient Forum</button>
          </div>
        </div>
      </div>

      <!-- Caregiver Forum -->
      <div class="col-md-4">
        <div class="card forum-card">
          <div class="card-body">
            <h5 class="card-title">💬 Caregiver Forum</h5>
            <p class="card-text">
              Join the caregiver community to share advice, resources, and support.
            </p>
            <button class="btn btn-primary" @click="joinForum('caregiver')" aria-label="Join the Caregiver Forum">Join Caregiver Forum</button>
          </div>
        </div>
      </div>

      <!-- Professional Forum -->
      <div class="col-md-4">
        <div class="card forum-card">
          <div class="card-body">
            <h5 class="card-title">💬 Professional Forum</h5>
            <p class="card-text">
              Engage with other professionals and share your expertise and insights.
            </p>
            <button class="btn btn-primary" @click="joinForum('professional')" aria-label="Join the Professional Forum">Join Professional Forum</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuth } from '../router/useAuth.js';

const router = useRouter();
const { isAuthenticated, userType, currentUser } = useAuth();

// Function to handle joining a forum
const joinForum = (forumType) => {
  if (isAuthenticated.value) {
    if (userType.value === 'admin') {
        // Admins can join any forum
        router.push({ path: `/community/${forumType}` });
    } else if (userType.value === 'general') {
        // Check if the general user has the reason to join the specific forum
        const userReason = currentUser.value.reason;
        if (userReason === forumType) {
            router.push({ path: `/community/${forumType}` });
        } else {
            alert(`You are not authorised to join the ${forumType} forum.`);
        }
    }
  } else {
    alert('You must be logged in to join a forum.');
    router.push('/login');
  }
};
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

.card {
  margin-top: 20px;
  margin-bottom: 20px;
}

.card-title {
  font-weight: bold;
  font-size: 1.25rem;
  margin-bottom: 10px;
}

.card-text {
  color: #666;
  font-size: 1.125rem;
}

.btn-primary {
  background-color: #e5533d;
  border-color: #e5533d;
  font-weight: bold;
}

.btn-primary:hover {
  background-color: #c94431;
  border-color: #c94431;
}
</style>
  