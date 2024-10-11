<template>
  <div class="container mt-3 mb-5" role="main" aria-labelledby="pageTitle">
    <h1 id="pageTitle">MSA Caring Tool</h1>
    <p>Use the tools below to monitor symptoms and plan your treatments effectively:</p>

    <div class="row mt-4">
      <!-- Symptom Tracker Section -->
      <div class="col-md-6">
        <div class="card caring-tool-card">
          <div class="card-body">
            <h5 class="card-title" aria-label="Symptom Tracker">📝 Symptom Tracker</h5>
            <p class="card-text">
              Track your symptoms daily to monitor changes and progress over time.
            </p>
            <button class="btn btn-primary" @click="openSymptomTracker" aria-label="Open Symptom Tracker">
              Open Symptom Tracker
            </button>
          </div>
        </div>
      </div>

      <!-- Treatment Planner Section -->
      <div class="col-md-6">
        <div class="card caring-tool-card">
          <div class="card-body">
            <h5 class="card-title" aria-label="Treatment Planner">⏰ Treatment Planner</h5>
            <p class="card-text">
              Plan your treatment schedule and organise your medication usage.
            </p>
            <button class="btn btn-primary" @click="openTreatmentPlanner" aria-label="Open Treatment Planner">
              Open Treatment Planner
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    openSymptomTracker() {
      this.$router.push('/tool/symptom-tracker');
    },
    openTreatmentPlanner() {
      this.$router.push('/tool/treatment-planner');
    }
  }
}
</script>

<style scoped>
.container {
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.card {
  margin-top: 20px;
  margin-bottom: 20px;
}

.card-title {
  font-weight: bold;
  font-size: 1.25rem;
  margin-bottom: 10px;
}

.card-text {
  color: #666;
  font-size: 1.125rem;
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

.form-group {
  margin-bottom: 15px;
}

.list-group-item {
  margin-bottom: 5px;
}
</style>
