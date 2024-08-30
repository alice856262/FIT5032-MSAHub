<template>
    <div class="container mt-3">
      <h1 class="mb-4">Resources</h1>
  
      <!-- Educational Materials Section -->
      <div class="category-section" v-if="educationalMaterials.length > 0">
        <h2>Educational Materials</h2>
        <ul class="list-group">
          <li
            v-for="article in educationalMaterials"
            :key="article.id"
            class="list-group-item"
          >
            <router-link :to="`/article/${article.id}`">{{ article.title }}</router-link>
          </li>
        </ul>
      </div>
  
      <!-- Caregiving Resources Section -->
      <div class="category-section mt-5" v-if="caregivingResources.length > 0">
        <h2>Caregiving Resources</h2>
        <ul class="list-group">
          <li
            v-for="article in caregivingResources"
            :key="article.id"
            class="list-group-item"
          >
            <router-link :to="`/article/${article.id}`">{{ article.title }}</router-link>
          </li>
        </ul>
      </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig.js';

export default {
    setup() {
      const articles = ref([]);
      const educationalMaterials = ref([]);
      const caregivingResources = ref([]);
  
      const fetchArticles = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'articles'));
  
          articles.value = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          educationalMaterials.value = articles.value.filter(
            (article) => article.type === 'Educational Materials'
          );
          caregivingResources.value = articles.value.filter(
            (article) => article.type === 'Caregiving Resources'
          );
        } catch (error) {
          console.error('Error fetching articles:', error);
        }
      };
  
      onMounted(fetchArticles);
  
      return { educationalMaterials, caregivingResources };
    },
};
</script>
  
<style scoped>
.category-section {
  margin-bottom: 30px;
}

.list-group-item {
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  padding: 15px 20px;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: #f6f4f3;
  font-family: 'Arial', sans-serif;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.list-group-item a {
  color: #333;
  text-decoration: none;
  flex-grow: 1;
}

.list-group-item a:hover {
  color: #e5533d;
}

.list-group-item:hover {
  background-color: #ffcf78;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.list-group-item::before {
  content: "📄";
  margin-right: 15px;
  font-size: 24px;
}

h2 {
  font-family: 'Arial', sans-serif;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.container {
    max-width: 800px;
}
</style>
  