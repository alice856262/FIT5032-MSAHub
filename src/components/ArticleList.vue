<template>
  <div class="container mt-3 mb-5">
    <h1>Article</h1>
    <p>Click any article title to view details, or you can search and sort our collection of articles by title, type, or date.</p>
    <!-- Interactive Table for All Articles -->
    <interactive-table :rows="articles" :columns="columns" aria-label="Table listing articles with options to search and sort"/>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig.js';
import InteractiveTable from '../components/ArticleInteractiveTable.vue';

export default {
  components: {
    InteractiveTable,
  },
  setup() {
    const articles = ref([]);
    const columns = ref([
      { key: 'title', label: 'Article Title', searchable: true, ariaLabel: "Sort by Article Title" },
      { key: 'type', label: 'Article Type', searchable: true, ariaLabel: "Sort by Article Type" },
      { key: 'time', label: 'Publish Date', searchable: true, ariaLabel: "Sort by Publish Date" },
    ]);

    // Function to format date to dd/mm/yyyy
    const formatDate = (timestamp) => {
      const date = new Date(timestamp.toDate());
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const fetchArticles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'articles'));
        articles.value = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const formattedTime = data.time ? formatDate(data.time) : '';
          return {
            id: doc.id,
            ...data,
            time: formattedTime,
          };
        });
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    onMounted(fetchArticles);
    return { articles, columns };
  },
};
</script>

<style scoped>
.container {
  padding: 30px;
  border-radius: 10px;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

p {
  color: #666;
  font-size: 1.125rem;
  line-height: 1.6;
}

button, [role="button"] {
  background-color: #e5533d;
  border-color: #e5533d;
  font-weight: bold;
  color: white;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
}

button:hover, [role="button"]:hover {
  background-color: #c94431;
  border-color: #c94431;
}
</style>