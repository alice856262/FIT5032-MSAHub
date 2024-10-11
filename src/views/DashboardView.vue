<template>
  <main class="container mt-5">
    <h1>Admin Dashboard</h1>
    
    <!-- Manual Trigger Button for Bulk Email -->
    <section aria-labelledby="bulk-email-section" class="mt-4">
      <h2 id="bulk-email-section">Send Bulk Email Notification</h2>
      <div class="row mt-4">
        <div class="text-center">
          <button class="btn btn-primary-custom mt-2 me-5" @click="triggerBulkEmail('symptomTracker')" aria-label="Notify users inactive in Symptom Tracker">Notify Users Inactive in Symptom Tracker</button>
          <button class="btn btn-primary-custom mt-2 me-5" @click="triggerBulkEmail('upcomingEvent')" aria-label="Notify users of upcoming events">Notify Users of Upcoming Events</button>
          <button class="btn btn-primary-custom mt-2" @click="triggerBulkEmail('medicationEndDate')" aria-label="Notify users of expired medications">Notify Users of Expired Medications</button>
        </div>
      </div>
    </section>

    <!-- User Overview Section -->
    <section aria-labelledby="user-overview" class="mt-4">
      <h2 id="user-overview">User Overview</h2>
      <div class="row mt-4">
        <!-- Total Users Card -->
        <div class="col-md-6">
          <div class="card bg-light mb-3">
            <div class="card-header text-center" style="background-color: #ffdb99; font-weight: bold;">Total Registered User</div>
            <div class="card-body text-center">
              <h5 class="card-title" aria-live="polite">{{ totalUsers }}</h5>
            </div>
          </div>
        </div>
        <!-- User Type Breakdown Card -->
        <div class="col-md-6">
          <div class="card bg-light mb-3">
            <div class="card-header text-center" style="background-color: #ffdb99; font-weight: bold;">User Type</div>
            <div class="card-body">
              <ul>
                <li v-for="(count, type) in userTypesCount" :key="type" aria-label="User type breakdown">
                  {{ type }}: <span class="badge badge-primary">{{ count }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Admin Users List Section -->
    <section aria-labelledby="admin-user" class="mt-4">
      <h2 id="admin-user">Admin User</h2>
      <div class="row mt-4">
        <div class="col-md-12">
          <div class="card bg-light mb-3">
            <div class="card-header text-center" style="background-color: #ffdb99; font-weight: bold;">Admin User</div>
            <div class="card-body">
              <table class="table table-striped" aria-describedby="admin-user-table">
                <thead>
                  <tr>
                    <th scope="col">Email</th>
                    <th scope="col">Full Name</th>
                    <th scope="col">Phone</th>
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
    </section>

    <!-- Reviews by Date Section -->
    <section aria-labelledby="reviews-by-date" class="mt-4">
      <h2 id="reviews-by-date">Review Activity by Date</h2>
      <div class="row mt-4">
        <div class="col-md-12">
          <div class="card bg-light mb-3">
            <div class="card-header text-center" style="background-color: #ffdb99; font-weight: bold;">Reviews by Date</div>
            <div class="card-body">
              <table class="table table-striped" aria-describedby="reviews-by-date-table">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Number of Reviews</th>
                    <th scope="col">Rating</th>
                    <th scope="col">Recommend</th>
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
    </section> 

    <!-- Forum and Messages Activity by Date -->
    <section aria-labelledby="community-activity" class="mt-4">
      <h2 id="community-activity">Community Activity by Date</h2>
      <div class="row mt-4">
        <div class="col-md-6">
          <div class="card bg-light mb-3">
            <div class="card-header text-center" style="background-color: #ffdb99; font-weight: bold;">Threads by Date</div>
            <div class="card-body">
              <table class="table table-striped" aria-describedby="threads-by-date-table">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Number of Threads</th>
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
            <div class="card-header text-center" style="background-color: #ffdb99; font-weight: bold;">Messages by Date</div>
            <div class="card-body">
              <table class="table table-striped" aria-describedby="messages-by-date-table">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Number of Messages</th>
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
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig.js';
import axios from 'axios';

const totalUsers = ref(0);
const userTypesCount = ref({});
const reviewsByDate = ref([]);
const threadsByDate = ref({});
const messagesByDate = ref({});
const adminUsers = ref([]);

const triggerBulkEmail = async (scenario) => {
  try {
    const response = await axios.post('https://sendbulkemails-t4aajf3gxq-uc.a.run.app', { scenario });
    alert(response.data); // Provide feedback to users after sending
  } catch (error) {
    console.error('Error triggering bulk email:', error);
    alert('Failed to send bulk email.');
  }
};

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
.btn-primary-custom {
  border-color: #e5533d;
  border-width: 3px;
  color: #555;
  font-size: 1.125rem;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}
  
.btn-primary-custom:hover {
  background-color: #e5533d;
  border-color: #e5533d;
  color: #f6f4f3;
  font-weight: bold;
}

.card {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.badge-primary {
  background-color: #ffdb99;
  color: #333;
}

.card:focus, .table:focus {
  outline: 2px solid #333;
  outline-offset: 2px;
}
</style>
