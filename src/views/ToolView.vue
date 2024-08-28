<template>
  <div class="container mt-5">
    <h1 class="mb-4">MSA Caring Tool</h1>
    <p>Use the tools below to monitor symptoms and plan your treatments effectively:</p>

    <div class="row mt-4">
      <!-- Symptom Tracker Section -->
      <div class="col-md-6">
        <div class="card caring-tool-card">
          <div class="card-body">
            <h5 class="card-title">Symptom Tracker</h5>
            <p class="card-text">
              Track your symptoms daily to monitor changes and progress over time.
            </p>
            <button class="btn btn-primary" @click="openSymptomTracker">Open Symptom Tracker</button>
          </div>
        </div>
      </div>

      <!-- Treatment Planner Section -->
      <div class="col-md-6">
        <div class="card caring-tool-card">
          <div class="card-body">
            <h5 class="card-title">Treatment Planner</h5>
            <p class="card-text">
              Plan your treatments and medication schedule using the calendar.
            </p>
            <button class="btn btn-primary" @click="openTreatmentPlanner">Open Treatment Planner</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Symptom Tracker -->
    <div v-if="showSymptomTracker" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <h3>Symptom Tracker</h3>
        <form @submit.prevent="addSymptomEntry">
          <div class="form-group mb-3">
            <label for="symptom">Symptom</label>
            <input type="text" id="symptom" v-model="newSymptom" class="form-control" required />
          </div>
          <div class="form-group mb-3">
            <label for="severity">Severity (1-10)</label>
            <input type="number" id="severity" v-model.number="newSeverity" min="1" max="10" class="form-control" required />
          </div>
          <button type="submit" class="btn btn-primary">Add Entry</button>
          <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
        </form>
        <hr />
        <h5>Tracked Symptoms</h5>
        <ul class="list-group">
          <li v-for="(entry, index) in symptomEntries" :key="index" class="list-group-item">
            {{ entry.date }}: {{ entry.symptom }} (Severity: {{ entry.severity }})
          </li>
        </ul>
      </div>
    </div>

    <!-- Modal for Treatment Planner -->
    <div v-if="showTreatmentPlanner" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <h3>Treatment Planner</h3>
        <p>Use the calendar below to schedule your treatments:</p>
        <div id="calendar"></div> <!-- Placeholder for a calendar widget -->
        <button type="button" class="btn btn-secondary mt-3" @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Modal visibility states
const showSymptomTracker = ref(false);
const showTreatmentPlanner = ref(false);

// Symptom Tracker state
const symptomEntries = ref([]);
const newSymptom = ref('');
const newSeverity = ref(5);

// Functions to handle modal opening and closing
const openSymptomTracker = () => {
  showSymptomTracker.value = true;
};

const openTreatmentPlanner = () => {
  showTreatmentPlanner.value = true;
};

const closeModal = () => {
  showSymptomTracker.value = false;
  showTreatmentPlanner.value = false;
};

// Function to add a new symptom entry
const addSymptomEntry = () => {
  const entry = {
    date: new Date().toLocaleDateString(),
    symptom: newSymptom.value,
    severity: newSeverity.value,
  };
  symptomEntries.value.push(entry);
  newSymptom.value = '';
  newSeverity.value = 5;
};
</script>

<style scoped>
.container {
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card {
  margin-bottom: 20px;
}

.card-title {
  font-weight: bold;
  font-size: 1.25rem;
  margin-bottom: 10px;
}

.card-text {
  color: #666;
  font-size: 1rem;
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

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
}

.form-group {
  margin-bottom: 15px;
}

.list-group-item {
  margin-bottom: 5px;
}
</style>
