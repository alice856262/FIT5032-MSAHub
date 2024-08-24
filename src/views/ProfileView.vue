<template>
    <div class="container mt-5" v-if="user">
      <div class="row">
        <!-- Left Side: Profile Picture and Upload Icon -->
        <div class="col-md-4 text-center">
          <!-- Upper Row: Profile Picture -->
          <div class="row mb-3">
            <div class="col-12 d-flex">
              <div class="profile-picture">
                <img src="/src/assets/profile_pic.png" alt="Profile Picture" class="img-fluid rounded-circle" />
              </div>
            </div>
          </div>
          <!-- Lower Row: Upload Icon -->
          <div class="row mb-3">
            <div class="col-12 d-flex justify-content-end">
              <p class="upload-icon">+</p>
            </div>
          </div>
        </div>
        
        <!-- Right Side: Personal Info -->
        <div class="col-md-8">
          <h2 class="mb-4">Personal Info</h2>
          <div class="row mb-3">
            <div class="col-md-5">
              <strong>First Name:</strong> {{ user.firstName }}
              <i class="fas fa-edit ms-2"></i>
            </div>
            <div class="col-md-7">
              <strong>Phone Number:</strong> {{ user.phone }}
              <i class="fas fa-edit ms-2"></i>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-5">
              <strong>Last Name:</strong> {{ user.lastName }}
              <i class="fas fa-edit ms-2"></i>
            </div>
            <div class="col-md-7">
              <strong>Date of Birth:</strong> {{ user.dob.toLocaleDateString() }}
              <i class="fas fa-edit ms-2"></i>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-5">
              <strong>Gender:</strong> {{ user.gender }}
              <i class="fas fa-edit ms-2"></i>
            </div>
            <div class="col-md-7">
              <strong>Address:</strong> {{ user.address }}
              <i class="fas fa-edit ms-2"></i>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Ratings and Reviews -->
      <div class="row">
        <div class="col-md-12">
          <h2 class="mb-4">My Ratings & Reviews</h2>
          <div v-for="(review, index) in userReviews" :key="index" class="review-item mb-4">
            <strong>{{ review.title }}</strong>
            <p>I recommend this article: {{ review.recommend ? 'Yes' : 'No' }}</p>
            <p>Date: {{ review.date.toLocaleDateString() }}</p>
            <p>Rate: 
              <span class="review-stars">
                <span v-for="n in review.rating" :key="n">★</span>
                <span v-for="n in 5 - review.rating" :key="n + review.rating">☆</span>
              </span>
            </p>
            <p>Review: "{{ review.comment }}"</p>
          </div>
        </div>
      </div>
      <button @click="logout" class="btn btn-secondary">Logout</button>
    </div>
    <!-- Display loading or fallback content if user data is not available -->
    <div v-else>
      <p>Loading...</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '../router/useAuth.js';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig.js';

const { logout, currentUser } = useAuth();
const user = ref(null);
const userReviews = ref([]);

onMounted(async () => {
  if (currentUser.value) {
    try {
      const userId = currentUser.value.uid;
      console.log('Fetching data for User ID:', userId);

      // Fetch user data
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        user.value = {
          ...userData,
          dob: userData.dob.toDate(), // Convert Firestore timestamp to JS Date
        };
        console.log('User data:', user.value);
      } else {
        console.error('No user data found for ID:', userId);
      }

      // Fetch user-specific reviews
      const reviewsQuery = query(collection(db, 'reviews'), where('userId', '==', userId));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = reviewsSnapshot.docs.map(doc => {
        const reviewData = doc.data();
        return {
          id: doc.id,
          ...reviewData,
          date: reviewData.date.toDate() // Convert Firestore timestamp to JS Date
        };
      });

      console.log('Fetched reviews:', reviewsData);

      // Fetch article titles to append to reviews
      const articlesSnapshot = await getDocs(collection(db, 'articles'));
      const articlesData = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log('Fetched articles:', articlesData);

      // Append article titles to each review for display
      userReviews.value = reviewsData.map(review => {
        const article = articlesData.find(article => article.id === review.articleId);
        return { ...review, title: article ? article.title : 'Unknown Article' };
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else {
    console.log('User is not logged in.');
  }
});
</script>

<style scoped>
.container {
    max-width: 1000px;
}

.profile-picture {
    position: relative;
    width: 200px;
    height: 200px;
    margin: 0 auto;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: -30px;
}

.upload-icon {
    background-color: #333;
    color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    border: 3px solid #fff;
    margin-right: 15px;
}

.review-item {
    background-color: #f6f4f3;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.review-stars {
    color: #f7a346;
}

.review-text {
    font-size: 16px;
}

</style>
  