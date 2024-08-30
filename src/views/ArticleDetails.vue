<template>
  <div class="offset-sd-2 offset-md-2">
    <button class="btn btn-secondary mb-3" @click="goBack">← Back</button>
  </div>
  <div class="container article-details">
    <div class="row">
      <div class="col-md-8 col-sd-8">
        <h1 class="article-title">{{ article.title }}</h1>
        <p class="article-text">{{ article.content }}</p>
        <ul class="article-points">
          <li v-for="point in article.points" :key="point">{{ point }}</li>
        </ul>
        <button class="btn btn-primary">Read More</button>
      </div>
      <div class="col-md-4 col-sd-4">
        <div class="photo-placeholder">Photo</div>
      </div>

      <div class="col-md-12">
        <!-- Rating Section -->
        <div class="rating-section d-flex align-items-center">
          <!-- Progress Ring -->
          <div class="progress-ring">
            <svg class="progress-ring__svg" width="300" height="300">
              <circle
                class="progress-ring__circle"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="strokeDashoffset"
                stroke="#f7a346"
                stroke-width="13"
                fill="transparent"
                r="90"
                cx="150"
                cy="145"
              />
            </svg>
            <div class="progress-ring__text">
              {{ recommendationPercentage }}%<br />Recommend this article
            </div>
          </div>

          <!-- Rating Details -->
          <div class="rating-details ms-4 col-md-3 col-sd-3">
            <div v-for="n in [5, 4, 3, 2, 1]" :key="n" class="rating-bar">
              <span>{{ n }}</span>
              <div class="rating-bar__container">
                <div class="rating-bar__fill" :style="{ width: getRatingPercentage(n) + '%' }"></div>
              </div>
            </div>
          </div>
          <div class="rating-details ms-4 col-md-5 col-sd-5">
            <div class="rating-overview">
              <span class="rating-stars">{{ averageRating.toFixed(1) }} {{ generateStars(averageRating) }}</span>
              <span>{{ reviews.length }} Reviews</span>
            </div>
            <div class="mt-3">
              <button class="btn btn-primary-custom add-review" @click="handleAddReview">Add Your Review</button>
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="reviews mt-4">
          <div v-for="(review, index) in reviews" :key="index" class="review-item">
            <div class="row">
              <!-- Left Section: Recommendation and User Info (6 columns) -->
              <div class="col-md-4 d-flex align-items-center">
                <div>
                  <span v-if="review.recommend" class="recommend-icon">✔️</span>
                  <span v-else class="not-recommend-icon">✖︎</span>
                </div>
                <div class="ms-3">
                  <p class="review-recommend mb-1">
                    {{ review.recommend ? "Yes, I recommend this article" : "No, I do not recommend this article" }}
                  </p>
                  <p class="review-author">
                    {{ users[review.userId]?.firstName || 'Unknown User' }} {{ users[review.userId]?.lastName || '' }} ({{ formatDate(review.date) }})
                  </p>
                </div>
              </div>

              <!-- Right Section: Rating & Review Comment (6 columns) -->
              <div class="col-md-2 d-flex align-items-center justify-content-between">
                <div class="review-stars">
                  <span v-for="n in review.rating" :key="n">★</span>
                  <span v-for="n in 5 - review.rating" :key="n + review.rating">☆</span>
                </div>
              </div>
              <div class="col-md-6 d-flex align-items-center justify-content-between">   
                <p class="review-text">"{{ review.comment }}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Adding Review -->
    <div v-if="showModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <h3>Add Your Review</h3>
        <div class="form-group">
          <label>Rate this article</label>
          <div class="star-rating">
            <span v-for="star in 5" :key="star" class="star" :class="{ active: star <= newReview.rating }" @click="newReview.rating = star">★</span>
          </div>
        </div>
        <div class="form-group">
          <label>Would you recommend this article to others?</label>
          <div>
            <input type="radio" id="yes" value="true" v-model="newReview.recommend">
            <label for="yes" class="me-3">Yes</label>
            <input type="radio" id="no" value="false" v-model="newReview.recommend">
            <label for="no">No</label>
          </div>
        </div>
        <div class="form-group mt-3 mb-4">
          <label>Please write your review:</label>
          <textarea class="form-control" v-model="newReview.comment"></textarea>
        </div>
        <div class="d-flex justify-content-between">
          <button class="btn btn-primary" @click="submitReview">Submit</button>
          <button class="btn btn-secondary" @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { collection, getDocs, query, where, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig.js';
import { useAuth } from '../router/useAuth.js';
import DOMPurify from 'dompurify';

function sanitizeInput(input) {
  return DOMPurify.sanitize(input);
}

export default {
  props: ['id'],
  data() {
    return {
      article: {
        title: '',
        content: '',
        points: []
      },
      reviews: [],
      users: {},
      showModal: false,
      newReview: {
        rating: 0,
        recommend: null,
        comment: ''
      },
      radius: 90,
      circumference: 2 * Math.PI * 90,
    };
  },
  computed: {
    recommendationPercentage() {
      if (this.reviews.length === 0) return 0;
      const recommendedCount = this.reviews.filter(review => review.recommend).length;
      return Math.round((recommendedCount / this.reviews.length) * 100);
    },
    averageRating() {
      if (this.reviews.length === 0) return 0;
      const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
      return totalRating / this.reviews.length;
    },
    strokeDashoffset() {
      return this.circumference - (this.recommendationPercentage / 100) * this.circumference;
    }
  },
  mounted() {
    this.fetchArticleData();
  },
  methods: {
    sanitize(content) {
      return DOMPurify.sanitize(content);
    },
    async fetchArticleData() {
      try {
        // Fetch article details
        const articleDoc = doc(db, 'articles', this.id);
        const articleSnapshot = await getDoc(articleDoc);
        if (articleSnapshot.exists()) {
          this.article = articleSnapshot.data();
        }

        // Fetch reviews for this article
        const reviewsQuery = query(collection(db, 'reviews'), where('articleId', '==', this.id));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsData = reviewsSnapshot.docs.map(doc => {
          const review = doc.data();
          review.date = review.date.toDate(); // Convert Firestore Timestamp to JS Date
          return { id: doc.id, ...review };
        });

        // Fetch user details for each review
        for (const review of reviewsData) {
          const userDoc = doc(db, 'users', review.userId);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            this.users[review.userId] = userData; // Directly assign to users object
          }
        }

        this.reviews = reviewsData;
      } catch (error) {
        console.error('Error fetching article or review data:', error);
      }
    },
    handleAddReview() {
      const { isAuthenticated } = useAuth();
      if (!isAuthenticated.value) {
        this.$router.push('/login');
      } else {
        this.showModal = true;
      }
    },
    closeModal() {
      this.showModal = false;
    },
    async submitReview() {
      const { currentUser } = useAuth();
      console.log("UserId", currentUser.value.userId);
      if (currentUser && currentUser.value) {
        try {
          const userEmail = currentUser.value.email; // --> Only for Basic Auth

          // Sanitize user input
          const sanitizedComment = sanitizeInput(this.newReview.comment);

          // Add the new review to Firestore
          await addDoc(collection(db, 'reviews'), {
            userId: userEmail, // --> Only for Basic Auth
            // userId: currentUser.value.uid,
            articleId: this.id,
            date: new Date(),
            recommend: this.newReview.recommend === 'true',
            rating: this.newReview.rating,
            comment: sanitizedComment,
          });

          // ------- Only for Basic Auth -------
          // Fetch the user details immediately and update `users` object
          const userDoc = doc(db, 'users', userEmail);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            this.users[userEmail] = userData; // Update the `users` object with the new user data
          } else {
            console.error('No user data found for email:', userEmail);
          }
          // ------- Only for Basic Auth -------

          // Add new review locally to the list
          this.reviews.push({
            userId: userEmail, // --> Only for Basic Auth
            // userId: currentUser.value.uid,
            date: new Date(),
            recommend: this.newReview.recommend === 'true',
            rating: this.newReview.rating,
            comment: sanitizedComment
          });

          this.closeModal();
          this.resetForm();
        } catch (error) {
          console.error('Error submitting review:', error);
        }
      } else {
        this.$router.push('/login');
      }
    },
    resetForm() {
      this.newReview = {
        rating: 0,
        recommend: null,
        comment: ''
      };
    },
    generateStars(averageRating) {
      const fullStars = Math.floor(averageRating);
      const halfStar = averageRating % 1 >= 0.5 ? 1 : 0;
      const emptyStars = 5 - fullStars - halfStar;

      return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
    },
    getRatingPercentage(rating) {
      if (this.reviews.length === 0) return 0;
      const ratingCount = this.reviews.filter(review => review.rating === rating).length;
      return (ratingCount / this.reviews.length) * 100;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString(); // Ensure it's a JS Date object
    },
    goBack() {
      this.$router.push('/resource');
    }
  }
};
</script>

<style scoped>
.container {
  background-color: #f6f4f3;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
}

.progress-ring {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto;
}

.progress-ring__text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-size: 18px;
  color: #333;
  font-weight: bold;
}

.rating-bar {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.rating-bar__container {
  width: 100%;
  height: 10px;
  background-color: #e9ecef;
  margin-left: 10px;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}

.rating-bar__fill {
  height: 100%;
  background-color: #f7a346;
  border-radius: 5px;
}

.rating-stars {
  font-size: 24px;
  color: #f7a346;
}

.rating-overview {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.rating-overview span {
  margin-right: 10px;
}

.article-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 20px;
}

.article-text {
  font-size: 18px;
  line-height: 1.8;
  margin-bottom: 15px;
}

.article-points {
  list-style-type: disc;
  padding-left: 20px;
  margin-bottom: 20px;
}

.photo-placeholder {
  width: 100%;
  height: 200px;
  background-color: #ffcf56;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #555;
  border-radius: 15px;
  margin-top: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.review-item {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.review-author {
  font-weight: bold;
  margin-bottom: 5px;
}

.review-stars {
  color: #ffa500;
  font-size: 18px;
  margin-bottom: 5px;
}

.review-text {
  font-size: 16px;
}

.add-review {
  font-size: 16px;
  margin-top: 10px;
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

button.btn-primary-custom {
    border-color: #e5533d;
    border-width: 3px;
    color: #555;
}
  
button.btn-primary-custom:hover {
    background-color: #e5533d;
    border-color: #e5533d;
    color: #f6f4f3;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffcf78;
  padding: 30px;
  border-radius: 15px;
  width: 50%;
}

.star-rating {
  display: flex;
  margin-bottom: 10px;
}

.star {
  cursor: pointer;
  font-size: 24px;
  color: #e9ecef;
}

.star.active {
  color: #ffa500;
}
</style>