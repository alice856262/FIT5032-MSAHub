<template>
  <div class="container mt-5">
    <h1>Admin Dashboard</h1>

    <!-- User Overview Section -->
    <h3>User Overview</h3>
    <div class="row mt-4">
      <!-- Total Users Card -->
      <div class="col-md-6">
        <div class="card bg-light mb-3">
          <div class="card-header text-center" style="background-color: #ffcf78; font-weight: bold;">Total Registered User</div>
          <div class="card-body text-center">
            <h5 class="card-title">{{ totalUsers }}</h5>
          </div>
        </div>
      </div>

      <!-- User Type Breakdown Card -->
      <div class="col-md-6">
        <div class="card bg-light mb-3">
          <div class="card-header text-center" style="background-color: #ffcf78; font-weight: bold;">User Type</div>
          <div class="card-body">
            <ul>
              <li v-for="(count, type) in userTypesCount" :key="type">
                {{ type }}: <span class="badge badge-primary">{{ count }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Users List Section -->
    <h3>Admin User</h3>
    <div class="row mt-4">
      <div class="col-md-12">
        <div class="card bg-light mb-3">
          <div class="card-header text-center" style="background-color: #ffcf78; font-weight: bold;">Admin User</div>
          <div class="card-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Full Name</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="admin in adminUsers" :key="admin.email">
                  <td>{{ admin.email }}</td>
                  <td>{{ admin.fullName }}</td>
                  <td>{{ admin.phone }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Reviews by Date Section -->
    <h3>Review Activity by Date</h3>
    <div class="row mt-4">
      <div class="col-md-12">
        <div class="card bg-light mb-3">
          <div class="card-header text-center" style="background-color: #ffcf78; font-weight: bold;">Reviews by Date</div>
          <div class="card-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Number of Reviews</th>
                  <th>Rating</th>
                  <th>Recommend</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="review in reviewsByDate" :key="review.id">
                  <td>{{ review.date }}</td>
                  <td><span class="badge badge-primary">{{ review.count }}</span></td>
                  <td>{{ review.rating }}</td>
                  <td>{{ review.recommend }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Forum and Messages Activity by Date -->
    <h3>Community Activity by Date</h3>
    <div class="row mt-4">
      <div class="col-md-6">
        <div class="card bg-light mb-3">
          <div class="card-header text-center" style="background-color: #ffcf78; font-weight: bold;">Threads by Date</div>
          <div class="card-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Number of Threads</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(count, date) in threadsByDate" :key="date">
                  <td>{{ date }}</td>
                  <td><span class="badge badge-primary">{{ count }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card bg-light mb-3">
          <div class="card-header text-center" style="background-color: #ffcf78; font-weight: bold;">Messages by Date</div>
          <div class="card-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Number of Messages</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(count, date) in messagesByDate" :key="date">
                  <td>{{ date }}</td>
                  <td><span class="badge badge-primary">{{ count }}</span></td>
                </tr>
              </tbody>
            </table>
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
const reviewsByDate = ref([]);
const threadsByDate = ref({});
const messagesByDate = ref({});
const adminUsers = ref([]);

const fetchUserStatistics = async () => {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  totalUsers.value = usersSnapshot.size;

  const typesCount = {};
  const admins = [];

  usersSnapshot.forEach(doc => {
    const userData = doc.data();
    const userType = userData.userType || 'Unknown';

    // Count user types
    if (!typesCount[userType]) typesCount[userType] = 0;
    typesCount[userType]++;

    // If user is an admin, add to the adminUsers list
    if (userType === 'admin') {
      admins.push({
        email: userData.email,
        fullName: `${userData.firstName} ${userData.lastName}`,
        phone: userData.phone
      });
    }
  });
  
  userTypesCount.value = typesCount;
  adminUsers.value = admins;
};

const fetchReviewActivity = async () => {
  const reviewsSnapshot = await getDocs(collection(db, 'reviews'));

  const reviewsMap = {};

  reviewsSnapshot.forEach(doc => {
    const reviewData = doc.data();
    const date = new Date(reviewData.date.seconds * 1000).toLocaleDateString('en-GB'); // Format to dd/mm/yyyy
    const rating = reviewData.rating;
    const recommend = reviewData.recommend ? 'Yes' : 'No';
    
    const key = `${date}-${rating}-${recommend}`;

    if (!reviewsMap[key]) {
      reviewsMap[key] = { date, rating, recommend, count: 0 };
    }
    reviewsMap[key].count++;
  });

  // Convert reviewsMap to a sorted array
  reviewsByDate.value = Object.values(reviewsMap).sort((a, b) => new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-')));
};

const fetchCommunityActivity = async () => {
  const threadsSnapshot = await getDocs(collection(db, 'threads'));

  const threadsCountByDate = {};
  const messagesCountByDate = {};

  threadsSnapshot.forEach(doc => {
    const threadData = doc.data();
    const date = new Date(threadData.createdAt.seconds * 1000).toLocaleDateString();
    const messageCount = threadData.messages.length || 0;

    if (!threadsCountByDate[date]) threadsCountByDate[date] = 0;
    threadsCountByDate[date]++;

    if (!messagesCountByDate[date]) messagesCountByDate[date] = 0;
    messagesCountByDate[date] += messageCount;
  });

  threadsByDate.value = threadsCountByDate;
  messagesByDate.value = messagesCountByDate;
};

onMounted(() => {
  fetchUserStatistics();
  fetchReviewActivity();
  fetchCommunityActivity();
});
</script>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.badge-primary {
  background-color: #ffcf78;
  color: #333;
}
</style>
