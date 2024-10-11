<template>
  <div class="offset-sd-1 offset-md-1">
    <button class="btn btn-secondary mb-3" @click="goBack" aria-label="Go back to Tool View">← Back</button>
  </div>
  <div class="resource-container">
    <!-- Sidebar with navigation buttons -->
    <aside class="sidebar" role="navigation" aria-label="Section Navigation">
      <div class="btn-container">
        <button 
          class="btn-nav" 
          :class="{ active: currentView === 'CalendarView' }" 
          @click="currentView = 'CalendarView'"
          aria-label="Switch to Calendar View">
          <span class="icon" aria-hidden="true">📅</span>
          <span class="text">Calendar</span>
        </button>
        <button 
          class="btn-nav" 
          :class="{ active: currentView === 'MedicationView' }" 
          @click="currentView = 'MedicationView'"
          aria-label="Switch to Medication View">
          <span class="icon" aria-hidden="true">💊</span>
          <span class="text">Medication</span>
        </button>
      </div>
    </aside>

    <!-- Main content area for Calendar or Medication -->
    <main class="content" role="main" aria-live="polite">
      <component :is="currentViewComponent" />
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import CalendarView from './Calendar.vue';
import MedicationView from './MedicationList.vue';

export default {
  name: 'TreatmentPlanner',
  components: {
    CalendarView,
    MedicationView,
  },
  setup() {
    const currentView = ref('CalendarView');
    const router = useRouter();

    // Computed property to return the appropriate component
    const currentViewComponent = computed(() => {
      return currentView.value === 'CalendarView' ? CalendarView : MedicationView;
    });

    const goBack = () => {
      router.push('/tool');
    };

    return {
      currentView,
      currentViewComponent,
      goBack,
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
