<template>
    <div class="container mt-3">
      <h1 class="mb-4">Community Forums</h1>
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
              <button class="btn btn-primary" @click="joinForum('patient')">Join Patient Forum</button>
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
              <button class="btn btn-primary" @click="joinForum('caregiver')">Join Caregiver Forum</button>
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
              <button class="btn btn-primary" @click="joinForum('professional')">Join Professional Forum</button>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Function to handle joining a forum
const joinForum = (forumType) => {
    console.log(`Joining ${forumType} forum...`);
    // You can navigate to a forum-specific route or handle joining logic here
    router.push({ path: `community/${forumType}` });
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

.card {
    margin-bottom: 20px;
}

.card-title {
    font-weight: bold;
    font-size: 1.25rem;
    margin-bottom: 10px;
}

.card-text {
    color: #666;
    font-size: 1rem;
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
  