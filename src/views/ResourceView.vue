<template>
  <div class="resource-container">
    <!-- Sidebar with navigation buttons -->
    <aside class="sidebar">
      <div class="btn-container">
        <button 
          class="btn-nav" 
          :class="{ active: currentView === 'Articles' }" 
          @click="currentView = 'Articles'">
          <span class="icon">📄</span>
          <span class="text">Article</span>
        </button>
        <button 
          class="btn-nav" 
          :class="{ active: currentView === 'Maps' }" 
          @click="currentView = 'Maps'">
          <span class="icon">🗺️</span>
          <span class="text">Map</span>
        </button>
      </div>  
    </aside>

    <!-- Main content area for Articles or Maps -->
    <main class="content">
      <!-- Show the Articles or Maps component based on currentView -->
      <component :is="currentViewComponent" />
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import Articles from '../components/ArticleList.vue';
import Maps from '../components/Map.vue';

export default {
  name: 'ResourceView',
  components: {
    Articles,
    Maps,
  },
  setup() {
    // State to keep track of the current view
    const currentView = ref('Articles');

    // Computed property to return the current component based on currentView
    const currentViewComponent = computed(() => {
      return currentView.value === 'Articles' ? Articles : Maps;
    });

    return {
      currentView,
      currentViewComponent,
    };
  },
};
</script>

<style scoped>
.resource-container {
  display: flex;
}

.sidebar {
  width: 160px;
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center the button container */
}

.btn-container {
  position: sticky;
  top: 50%; /* Stick the buttons container in the middle */
  transform: translateY(-50%); /* Center the buttons container vertically */
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn-nav {
  margin-bottom: 30px;
  width: 100px;
  height: 95px;
  display: flex;
  flex-direction: column; /* Stack icon and text vertically */
  align-items: center;
  justify-content: center;
  padding: 15px 20px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffffff, #e6e6e6);
  box-shadow: 3px 3px 6px #d1d1d1, -3px -3px 6px #ffffff;
  font-weight: bold;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-nav .icon {
  font-size: 24px;
}

.btn-nav:hover {
  background: linear-gradient(145deg, #e6e6e6, #ffffff);
  box-shadow: 1px 1px 3px #d1d1d1, -1px -1px 3px #ffffff;
}

.btn-nav:active {
  background: linear-gradient(145deg, #d1d1d1, #f1f1f1);
  box-shadow: inset 1px 1px 3px #c1c1c1, inset -1px -1px 3px #ffffff;
}

.btn-nav.active {
  background: #ffcf78;
  color: #333;
  box-shadow: 1px 1px 3px #ffcf78, -1px -1px 3px #ffcf78;
}

.content {
  flex: 1;
  padding: 0px;
  border-radius: 10px;
}
</style>
