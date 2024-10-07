<template>
    <div class="container mt-5" v-if="user">
      <div class="row">
        <!-- Left Side: Profile Picture and Upload Icon -->
        <div class="col-md-4 text-center">
          <!-- Upper Row: Profile Picture -->
          <div class="row mb-3">
            <div class="col-12 d-flex">
              <div class="profile-picture">
                <img :src="user.profilePicture || '/src/assets/profile_pic.png'" alt="Profile Picture" class="img-fluid rounded-circle" />
              </div>
            </div>
          </div>
          <!-- Lower Row: Upload Icon -->
          <div class="row mb-3">
            <div class="col-12 d-flex justify-content-end">
              <p class="upload-icon" @click="triggerFileUpload">+</p>
              <input type="file" ref="fileInput" @change="uploadProfilePicture" class="d-none" />
            </div>
          </div>
        </div>
        
        <!-- Right Side: Personal Info -->
        <div class="col-md-8 col-sd-12">
          <h2 class="mb-4">Personal Info</h2>
          <div class="row mb-3">
            <div class="col-5 d-flex align-items-center justify-content-between">
              <strong>First Name:</strong>
              <span class="ms-3" v-if="!editing.firstName">{{ user.firstName }}</span>
              <input v-if="editing.firstName" v-model="user.firstName" class="form-control" />
              <span class="ms-auto" style="cursor: pointer;" @click="toggleEditMode('firstName')">
                {{ editing.firstName ? '✔️' : '🖊️' }}
              </span>
            </div>
            <div class="col-7 d-flex align-items-center justify-content-between">
              <strong>Phone Number:</strong>
              <span class="ms-3" v-if="!editing.phone">{{ user.phone }}</span>
              <input v-if="editing.phone" v-model="user.phone" class="form-control" />
              <span class="ms-auto" style="cursor: pointer;" @click="toggleEditMode('phone')">
                {{ editing.phone ? '✔️' : '🖊️' }}
              </span>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-5 d-flex align-items-center justify-content-between">
              <strong>Last Name:</strong>
              <span class="ms-3" v-if="!editing.lastName">{{ user.lastName }}</span>
              <input v-if="editing.lastName" v-model="user.lastName" class="form-control" />
              <span class="ms-auto" style="cursor: pointer;" @click="toggleEditMode('lastName')">
                {{ editing.lastName ? '✔️' : '🖊️' }}
              </span>
            </div>
            <div class="col-7 d-flex align-items-center justify-content-between">
              <strong>Date of Birth:</strong>
              <span class="ms-3" v-if="!editing.dob">{{ user.dob.toLocaleDateString() }}</span>
              <input v-if="editing.dob" type="date" v-model="user.dob" class="form-control" />
              <span class="ms-auto" style="cursor: pointer;" @click="toggleEditMode('dob')">
                {{ editing.dob ? '✔️' : '🖊️' }}
              </span>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-5 d-flex align-items-center justify-content-between">
              <strong>Gender:</strong>
              <span class="ms-3" v-if="!editing.gender">{{ user.gender }}</span>
              <select v-if="editing.gender" v-model="user.gender" class="form-select">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <span class="ms-auto" style="cursor: pointer;" @click="toggleEditMode('gender')">
                {{ editing.gender ? '✔️' : '🖊️' }}
              </span>
            </div>
            <div class="col-7 d-flex align-items-center justify-content-between">
              <strong>Address:</strong>
              <span class="ms-3" v-if="!editing.address">{{ user.address }}</span>
              <input v-if="editing.address" v-model="user.address" class="form-control" />
              <span class="ms-auto" style="cursor: pointer;" @click="toggleEditMode('address')">
                {{ editing.address ? '✔️' : '🖊️' }}
              </span>
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
      <!-- <button @click="logout" class="btn btn-secondary">Logout</button> -->
    </div>
    <!-- Display loading if user data is not available -->
    <div v-else>  <!-- Fallback content: if the user object is not yet loaded, a loading message is displayed -->
      <p>Loading...</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '../router/useAuth.js';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../config/firebaseConfig.js';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const { logout, currentUser } = useAuth();
const user = ref(null);
const userReviews = ref([]);

// State to manage which field is being edited
const editing = ref({
  firstName: false,
  lastName: false,
  phone: false,
  dob: false,
  gender: false,
  address: false
});

const toggleEditMode = (field) => {
  editing.value[field] = !editing.value[field];

  if (!editing.value[field]) {
    // Convert dob to Date object when exiting edit mode if field is 'dob'
    if (field === 'dob' && typeof user.value.dob === 'string') {
      user.value.dob = new Date(user.value.dob);
    }
    // Save changes when exiting edit mode
    saveUserChanges();
  }
};

const saveUserChanges = async () => {
  if (currentUser.value) {
    try {
      const userId = currentUser.value.uid;  // for Firestore
      const userDocRef = doc(db, 'users', userId);
      
      // Update the Firestore document with the new user data
      await updateDoc(userDocRef, user.value);
      console.log('User data updated successfully');
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }
};

// Trigger the hidden file input when upload icon is clicked
const triggerFileUpload = () => {
  document.querySelector("input[type='file']").click();
};

// Handle profile picture upload
const uploadProfilePicture = async (event) => {
  const file = event.target.files[0];
  if (file && currentUser.value) {
    try {
      const userId = currentUser.value.uid;
      const fileRef = storageRef(storage, `profilePictures/${userId}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      user.value.profilePicture = downloadURL; // Update user profile picture URL locally
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { profilePicture: downloadURL }); // Save to Firestore
      console.log('Profile picture uploaded and updated successfully');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  }
};

onMounted(async () => {
  // // ------- Only for Basic Auth -------
  // // Retrieve stored user data from sessionStorage and set it as user
  // const storedUser = JSON.parse(sessionStorage.getItem('currentUser'));
  // if (storedUser) {
  //   user.value = storedUser;
  // // ------- Only for Basic Auth -------

  if (currentUser.value) {
    try {
      // const userId = storedUser.email; // --> Only for Basic Auth

      const userId = currentUser.value.uid;  // for Firestore
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
    cursor: pointer;
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