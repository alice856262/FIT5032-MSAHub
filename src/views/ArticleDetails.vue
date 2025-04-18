<template>
  <div class="offset-sd-1 offset-md-1">
    <button class="btn btn-secondary mb-3" @click="goBack" aria-label="Go back to the resource page">← Back</button>
  </div>
  <div class="container mb-5">
    <div class="row">
      <h1 class="article-title">{{ article.title }}</h1>
      <div class="col-md-8 col-sd-8">
        <!-- Use v-html to render the truncated or full content based on showFullContent state -->
        <div class="article-text" v-html="sanitizedContent" aria-live="polite"></div>
      </div>
      <div class="col-md-4 col-sd-4">
        <img :src="article.picture" class="picture" alt="Article Image related to {{ article.title }}">
      </div>
      <div class="d-flex justify-content-start">
        <!-- Toggle the 'showFullContent' state on button click -->
        <button class="btn btn-primary" @click="toggleContent" :aria-expanded="showFullContent" :aria-controls="article-content">
          {{ showFullContent ? "Show Less" : "Read More" }}
        </button>
      </div>
      <div class="d-flex justify-content-end">
        <button class="btn btn-outline-secondary me-2" @click="downloadCSV" aria-label="Download article as CSV">Download as CSV</button>
        <button class="btn btn-outline-secondary" @click="downloadPDF" aria-label="Download article as PDF">Download as PDF</button>
      </div>

      <div class="col-md-12">
        <!-- Rating Section -->
        <div class="rating-section d-flex align-items-center" role="region" aria-labelledby="rating-section">
          <h2 id="rating-section" class="visually-hidden">Rating Section</h2>
          <!-- Progress Ring -->
          <div class="progress-ring">
            <svg class="progress-ring__svg" width="300" height="300" role="img" aria-label="Progress ring showing recommendation percentage">
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
          <div class="rating-details ms-4 col-md-3 col-sd-3" aria-live="polite">
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
              <button class="btn btn-primary-custom add-review" @click="handleAddReview" aria-label="Add your review">Add Your Review</button>
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="reviews mt-4" aria-labelledby="review-section">
          <h2 id="review-section" class="visually-hidden">Reviews</h2>
          <div v-for="(review, index) in reviews" :key="index" class="review-item">
            <div class="row">
              <!-- Left Section: Recommendation and User Info (6 columns) -->
              <div class="col-md-4 d-flex align-items-center">
                <div>
                  <span v-if="review.recommend" class="recommend-icon" aria-hidden="true">✔️</span>
                  <span v-else class="not-recommend-icon" aria-hidden="true">✖︎</span>
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
                  <span v-for="n in review.rating" :key="n" aria-hidden="true">★</span>
                  <span v-for="n in 5 - review.rating" :key="n + review.rating" aria-hidden="true">☆</span>
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
    <div v-if="showModal" class="modal" @click.self="closeModal" role="dialog" aria-modal="true" aria-labelledby="add-review-title">
      <div class="modal-content">
        <h3 id="add-review-title">Add Your Review</h3>
        <div class="form-group">
          <label for="rating">Rate this article</label>
          <div class="star-rating" role="radiogroup" aria-labelledby="rating">
            <!-- If star is less than or equal to newReview.rating, the active class is applied (change the star's appearance by highlighting it) -->
            <span 
              v-for="star in 5" 
              :key="star" 
              class="star" 
              :class="{ active: star <= newReview.rating }" 
              @click="newReview.rating = star"
              role="radio"
              :aria-checked="star === newReview.rating"
              :tabindex="star === 1 ? 0 : -1">★</span>
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
          <label for="review-comment">Please write your review:</label>
          <textarea id="review-comment" class="form-control" v-model="newReview.comment" aria-describedby="review-comment-desc"></textarea>
          <p id="review-comment-desc" class="visually-hidden">Write a detailed review for others to read.</p>
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
import jsPDF from 'jspdf';  // for creating and downloading PDF documents

function sanitizeInput(input) {
  return DOMPurify.sanitize(input);
}

export default {
  props: ['id'],  // id is passed from the parent component
  data() {
    return {
      article: {
        title: '',
        content: '',
        picture: '',
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
      showFullContent: false, // Track whether to show full content or not
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
    // Set the stroke offset for the progress ring based on recommendationPercentage
    strokeDashoffset() {
      return this.circumference - (this.recommendationPercentage / 100) * this.circumference;
    },
    // Provide a truncated version of the article content for preview
    truncatedContent() {
      const maxLength = 200; // Define the max length for summary
      const rawContent = this.article.content.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags for accurate truncation
      return rawContent.length > maxLength ? rawContent.substring(0, maxLength) + '...' : rawContent;
    },
    sanitizedContent() {
      return this.sanitize(this.showFullContent ? this.article.content : this.truncatedContent);
    }
  },
  mounted() {
    this.fetchArticleData();  // fetch data when the component is mounted
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
          const articleData = articleSnapshot.data();

          // Add points to the content as a formatted list
          const pointsList = articleData.points
            ? '<ul>' + articleData.points.map((point) => `<li>${point}</li>`).join('') + '</ul>'
            : '';

          // Combine content with points list
          this.article = {
            ...articleData,
            content: `${articleData.content} ${pointsList}`,
            picture: articleData.picture || '/src/assets/article_default.png'
          };
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
    // Toggle between displaying the full content or a truncated version
    toggleContent() {
      this.showFullContent = !this.showFullContent;
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
      if (currentUser && currentUser.value) {
        try {
          const sanitizedComment = sanitizeInput(this.newReview.comment);

          // Add the new review to Firestore
          await addDoc(collection(db, 'reviews'), {
            userId: currentUser.value.uid,
            articleId: this.id,
            date: new Date(),
            recommend: this.newReview.recommend === 'true',
            rating: this.newReview.rating,
            comment: sanitizedComment,
          });

          // Fetch the user details immediately and update "users" object
          const userDoc = doc(db, 'users', currentUser.value.uid);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            this.users[currentUser.value.uid] = userData; // update the "users" object with the new user data
          } else {
            console.error('No user data found for ID:', currentUser.value.uid);
          }

          // Add new review locally to the list
          this.reviews.push({
            userId: currentUser.value.uid,
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
    // Calculate the percentage of each rating level (e.g., 5 stars) for the rating bar
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
    },
    downloadCSV() {
      const { isAuthenticated } = useAuth();
      if (!isAuthenticated.value) {
        alert('Please log in first!');
        this.$router.push('/login');
      } else {
        // Create CSV content
        const headers = ['Title', 'Content'];
        const row = [this.article.title, this.article.content.replace(/<\/?[^>]+(>|$)/g, "")];  // remove any HTML tags from the article content

        // Combine headers and row into a CSV string
        let csvContent = "data:text/csv;charset=utf-8," 
                          + headers.join(",") + "\n" 
                          + row.join(",");

        // Encode the CSV content to ensure it's in a proper format for downloading
        const encodedUri = encodeURI(csvContent);
        // Create an anchor (<a>) element to act as a download link
        const link = document.createElement('a');
        // Set the href attribute of the link to the encoded URI
        link.setAttribute('href', encodedUri);
        // Set the download attribute to suggest a filename for the CSV
        link.setAttribute('download', `${this.article.title}.csv`);
        // Add the link element to the DOM, making it available for the click event
        document.body.appendChild(link);
        // Simulate a click on the link, triggering the download
        link.click();
        // Remove the link from the DOM after the download to clean up
        document.body.removeChild(link);
      }
    },
    downloadPDF() {
      const { isAuthenticated } = useAuth();
      if (!isAuthenticated.value) {
        alert('Please log in first!');
        this.$router.push('/login');
      } else {
        const doc = new jsPDF();
        // Retrieve the height of the page in the PDF document
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        let yOffset = 10;
        const lineHeight = 10;
        
        // Set the document title
        doc.setFontSize(16);
        doc.text("Article Title: " + this.article.title, 10, yOffset);
        
        // Add article content
        yOffset += lineHeight + 5;  // add space for the next section
        doc.setFontSize(12);
        
        // Use splitTextToSize to wrap the content to fit width, and remove HTML tags
        const splitContent = doc.splitTextToSize("Content: " + this.article.content.replace(/<\/?[^>]+(>|$)/g, ""), 190);
        splitContent.forEach((line) => {
          if (yOffset + lineHeight > pageHeight - 10) {  // check if content exceeds page height
            doc.addPage();
            yOffset = 10;  // reset yOffset for the new page
          }
          doc.text(line, 10, yOffset);
          yOffset += lineHeight;  // increase yOffset by lineHeight for the next line
        });

        // Save the document
        doc.save(`${this.article.title}.pdf`);
      }  
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
  font-size: 1.125rem;
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
  font-size: 1.125rem;
  line-height: 1.8;
  margin-bottom: 15px;
}

.article-points {
  list-style-type: disc;
  padding-left: 20px;
  margin-bottom: 20px;
}

.picture {
  width: 100%;
  height: 250px;
  background-color: #ffcf56;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #555;
  border-radius: 15px;
  margin-top: 10px;
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
  font-size: 1.125rem;
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

.btn-outline-secondary {
  border-width: 3px;
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
  background-color: #ffdb99;
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