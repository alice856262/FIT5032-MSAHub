<template>
  <div class="resource-container">
    <!-- Sidebar with navigation buttons -->
    <aside class="sidebar" aria-label="Resource Navigation">
      <div class="btn-container" role="tablist">
        <button 
          class="btn-nav" 
          :class="{ active: currentView === 'Articles' }" 
          @click="currentView = 'Articles'"
          :aria-selected="currentView === 'Articles'"
          role="tab"
          aria-label="View Articles">
          <span class="icon" aria-hidden="true">📄</span>
          <span class="text">Article</span>
        </button>
        <button 
          class="btn-nav" 
          :class="{ active: currentView === 'Maps' }" 
          @click="currentView = 'Maps'"
          :aria-selected="currentView === 'Maps'"
          role="tab"
          aria-label="View Maps">
          <span class="icon" aria-hidden="true">🗺️</span>
          <span class="text">Map</span>
        </button>
      </div>
    </aside>

    <!-- Main content area for Articles or Maps -->
    <main class="content" aria-live="polite" aria-atomic="true">
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
  align-items: center;
}

.btn-container {
  position: sticky;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn-nav {
  margin-bottom: 30px;
  width: 100px;
  height: 95px;
  display: flex;
  flex-direction: column;
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

.btn-nav:focus {
  outline: 3px solid #ffdb99;
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
  background: #ffdb99;
  color: #333;
  box-shadow: 1px 1px 3px #ffdb99, -1px -1px 3px #ffdb99;
}

.content {
  flex: 1;
  padding: 0px;
  border-radius: 10px;
}
</style>
