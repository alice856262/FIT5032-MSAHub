<template>
  <div class="container mt-5">
    <h1>Admin Dashboard</h1>
    <h3>User Overview</h3>
    <div class="row mt-4">
      <!-- Total Users Card -->
      <div class="col-md-6">
        <div class="card bg-light mb-3">
          <div class="card-header text-center" style="background-color: #ffcf78; font-weight: bold;">Total Users</div>
          <div class="card-body text-center">
            <h5 class="card-title">{{ totalUsers }}</h5>
          </div>
        </div>
      </div>

      <!-- User Type Breakdown Card -->
      <div class="col-md-6">
        <div class="card bg-light mb-3">
          <div class="card-header text-center" style="background-color: #ffcf78; font-weight: bold;">User Types</div>
          <div class="card-body">
            <ul>
              <li v-for="(count, type) in userTypesCount" :key="type">
                {{ type }}: {{ count }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <h3>Resource Overview</h3>
    <div class="row mt-4">
      <div class="col-md-6">
        <div class="card bg-light mb-3">
          <div class="card-header text-center" style="background-color: #ffcf78; font-weight: bold;">Article Type</div>
          <div class="card-body text-center">
            <p class="card-title">TBD</p>
          </div>
        </div>
      </div>
    </div>
    <h3>Community Overview</h3>
    <div class="row mt-4">
      <div class="col-md-6">
        <div class="card bg-light mb-3">
          <div class="card-header text-center" style="background-color: #ffcf78; font-weight: bold;">Forum Number</div>
          <div class="card-body text-center">
            <p class="card-title">TBD</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig.js';

const totalUsers = ref(0);
const userTypesCount = ref({});

const fetchUserStatistics = async () => {
  try {
    // Fetch all users from Firestore
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    // Calculate total users
    totalUsers.value = usersSnapshot.size;

    // Calculate user types
    const typesCount = {};

    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const userType = userData.userType || 'Unknown';
      
      if (!typesCount[userType]) {
        typesCount[userType] = 0;
      }
      typesCount[userType]++;
    });

    userTypesCount.value = typesCount;
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

onMounted(() => {
  fetchUserStatistics();
});
</script>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
