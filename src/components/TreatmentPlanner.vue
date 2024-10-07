<template>
  <div class="resource-container">
    <!-- Sidebar with navigation buttons -->
    <aside class="sidebar">
      <div class="btn-container">
        <button 
          class="btn-nav" 
          :class="{ active: currentView === 'CalendarView' }" 
          @click="currentView = 'CalendarView'">
          <span class="icon">📅</span>
          <span class="text">Calendar</span>
        </button>
        <button 
          class="btn-nav" 
          :class="{ active: currentView === 'MedicationView' }" 
          @click="currentView = 'MedicationView'">
          <span class="icon">💊</span>
          <span class="text">Medication</span>
        </button>
      </div>
    </aside>

    <!-- Main content area for Calendar or Medication -->
    <main class="content">
      <component :is="currentViewComponent" />
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import CalendarView from './Calendar.vue';
import MedicationView from './MedicationList.vue';

export default {
  name: 'TreatmentPlanner',
  components: {
    CalendarView,
    MedicationView,
  },
  setup() {
    // State to track the current view
    const currentView = ref('CalendarView');

    // Computed property to return the appropriate component
    const currentViewComponent = computed(() => {
      return currentView.value === 'CalendarView' ? CalendarView : MedicationView;
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

.btn-nav .icon {
  font-size: 24px;
}

.btn-nav.active {
  background: #ffcf78;
  box-shadow: 1px 1px 3px #ffcf78, -1px -1px 3px #ffcf78;
}

.content {
  flex: 1;
  padding: 0px;
  border-radius: 10px;
}
</style>
