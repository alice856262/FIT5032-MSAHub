<template>
  <div class="container mt-3">
    <h1>Resources</h1>
    <!-- Interactive Table for All Articles -->
    <interactive-table :rows="articles" :columns="columns" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig.js';
import InteractiveTable from '../components/InteractiveTable.vue';

export default {
  components: {
    InteractiveTable,
  },
  setup() {
    const articles = ref([]);
    const columns = ref([
      { key: 'title', label: 'Article Title', searchable: true },
      { key: 'type', label: 'Article Type', searchable: true },
      { key: 'time', label: 'Publish Date', searchable: true },
    ]);

    const fetchArticles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'articles'));
        articles.value = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const formattedTime = data.time ? new Date(data.time.toDate()).toISOString().substring(0, 10) : '';
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
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
