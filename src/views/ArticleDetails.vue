<template>
    <div class="container article-details">
      <div class="row">
        <div class="col-md-8 col-sd-8">
          <h1 class="article-title">{{ article.title }}</h1>
          <p class="article-text">{{ article.content }}</p>
          <ul>
            <li v-for="point in article.points" :key="point">{{ point }}</li>
          </ul>
          <button class="btn btn-danger mb-4">Read More</button>
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
                    r="85"
                    cx="155"
                    cy="100"
                    />
              </svg>
              <div class="progress-ring__text">{{ recommendationPercentage }}%<br />Recommend this article</div>
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
              <div class="col-md-5 row-mb-3">
                <button class="btn btn-outline-primary add-review">Add Your Review</button>
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
                    <p class="review-author">{{ review.username }} ({{ review.date }})</p>
                    </div>
                </div>

                <!-- Right Section: Rating & Review Comment (6 columns) -->
                <div class="col-md-8 d-flex align-items-center justify-content-between">
                    <div class="review-stars">
                    <span v-for="n in review.rating" :key="n">★</span>
                    <span v-for="n in 5 - review.rating" :key="n + review.rating">☆</span>
                    </div>
                    <p class="review-text">"{{ review.comment }}"</p>
                </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
  
<script>
export default {
  data() {
    return {
      article: {
        title: '',
        content: '',
        points: []
      },
      reviews: [],
      radius: 85,
      circumference: 2 * Math.PI * 85, // 2πr where r = 85 (the radius of the circle)
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
    fetchArticleData() {
      fetch('/src/assets/json/articleData.json')
        .then(response => response.json())
        .then(data => {
          this.article = data.article;
          this.reviews = data.reviews;
        });
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
    }
  }
};
</script>

<style scoped>
/* Styling for the progress ring */
.progress-ring {
  position: relative;
  width: 450px;
  height: 200px;
}

.progress-ring__text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-size: 16px;
  color: #333;
  font-weight: bold;
}

/* Styling for the rating bars */
.rating-bar {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.rating-bar__container {
  width: 250px;
  height: 10px;
  background-color: #f6f4f3;
  margin-left: 10px;
  position: relative;
}

.rating-bar__fill {
  height: 100%;
  background-color: #f7a346;
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

.article-details {
  background-color: #f6f4f3;
  padding: 30px;
  border-radius: 15px;
}

.article-title {
  font-size: 32px;
  font-weight: bold;
}

.article-text {
  font-size: 18px;
  line-height: 1.5;
}

.rating-section {
  display: flex;
  align-items: center;
}

.rating-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
}

.rating-percentage {
  font-size: 24px;
  font-weight: bold;
  color: #ffcf56;
}

.rating-stars {
  display: flex;
  align-items: center;
  font-size: 24px;
  color: #ffa500;
  margin-bottom: 10px;
}

.add-review {
  font-size: 16px;
}

.reviews {
  margin-top: 30px;
}

.review-item {
  border-top: 1px solid #ddd;
  padding-top: 15px;
  margin-top: 15px;
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
}
</style>