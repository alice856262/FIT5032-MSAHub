<template>
  <div class="offset-sd-1 offset-md-1">
    <button class="btn btn-secondary mb-3" @click="goBack" aria-label="Go back to Tool View">← Back</button>
  </div>
  <div class="container mb-5">
    <h1 id="symptomTrackerHeading">Symptom Tracker</h1>
    <p>You can use this tool to track your symptoms and monitor their severity over time.</p>
    <p>Simply fill in today's symptom and its severity below!</p>

    <!-- Symptom Entry Form -->
    <form @submit.prevent="addSymptomEntry" aria-labelledby="symptomTrackerHeading">
      <div class="mb-3">
        <label for="symptom">Symptom</label>
        <select v-model="newSymptom" id="symptom" class="form-control" @change="checkOtherSymptom" required aria-required="true">
          <option disabled value="">Please select a symptom type</option>
          <option value="Postural (Orthostatic) Hypotension">Postural (Orthostatic) Hypotension</option>
          <option value="Bradykinesia (Slowness of Movement)">Bradykinesia (Slowness of Movement)</option>
          <option value="Urinary Incontinence or Retention">Urinary Incontinence or Retention</option>
          <option value="Impotence (Erectile Dysfunction)">Impotence (Erectile Dysfunction)</option>
          <option value="Ataxia (Lack of Coordination)">Ataxia (Lack of Coordination)</option>
          <option value="Tremors">Tremors</option>
          <option value="Speech Difficulties (Dysarthria)">Speech Difficulties (Dysarthria)</option>
          <option value="Breathing Problems (Stridor)">Breathing Problems (Stridor)</option>
          <option value="Muscle Stiffness or Rigidity">Muscle Stiffness or Rigidity</option>
          <option value="Sleep Disturbances (REM Sleep Behavior Disorder)">Sleep Disturbances (REM Sleep Behavior Disorder)</option>
          <option value="Other">Other</option>
        </select>
        <!-- If "Other" is selected, show input field for manual symptom entry -->
        <div v-if="isOtherSymptom" class="mt-2">
          <label for="otherSymptom">Specify Other Symptom</label>
          <input v-model="otherSymptom" type="text" id="otherSymptom" class="form-control" required aria-required="true" aria-label="Specify other symptom" />
        </div>
      </div>

      <div class="mb-3">
        <label for="severity">Severity (1-10)</label>
        <select v-model.number="newSeverity" id="severity" class="form-control" required aria-required="true">
          <option disabled value="">Please select a severity level</option>
          <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary" aria-label="Submit symptom entry">Submit</button>
    </form>
    <hr />

    <!-- Symptom Chart -->
    <div v-if="chartData && chartData.labels && chartData.labels.length" class="mt-5">
      <h3>Symptom Severity Over Time</h3>
      <BarChart :chart-data="chartData" />
    </div>
    <div v-else class="mt-5">
      <p>No symptom data available. Please add some entries.</p>
    </div>

    <!-- Comparison Paragraph -->
    <div v-if="symptomComparisons.length" class="mt-5" aria-live="polite">
      <h3>Symptom Severity Summary</h3>
      <br>
      <p v-for="(comparison, index) in symptomComparisons" :key="index" class="symptom">
        {{ comparison }}
      </p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getFirestore, collection, addDoc, Timestamp, onSnapshot, query, where } from 'firebase/firestore';
import BarChart from './BarChart.vue';
import { useAuth } from '../router/useAuth.js'; // Import useAuth for authentication

export default {
  name: 'SymptomTracker',
  components: { BarChart },
  setup() {
    const router = useRouter();
    const db = getFirestore();

    const { currentUser } = useAuth(); // Get the current user using useAuth composable

    // Form fields for new symptom entry
    const newSymptom = ref('');
    const otherSymptom = ref(''); // Field for custom symptom entry when "Other" is selected
    const newSeverity = ref(''); // Default empty value for severity
    const isOtherSymptom = ref(false); // Boolean to track if "Other" is selected

    // Chart data and comparisons
    const chartData = ref({
      labels: [],
      datasets: [],
    });
    const symptomComparisons = ref([]); // Store comparison messages

    // Function to handle selection of "Other" symptom
    const checkOtherSymptom = () => {
      isOtherSymptom.value = newSymptom.value === 'Other';
    };

    // Function to process Firestore data and update the chart
    const processSymptoms = (symptoms) => {
      symptoms.sort((a, b) => a.timestamp - b.timestamp);

      const uniqueDates = [
        ...new Set(symptoms.map((data) => new Date(data.timestamp * 1000).toLocaleDateString())),
      ];

      const aggregatedData = {};
      const symptomHistories = {}; // To keep track of previous entries for comparisons
      symptoms.forEach((data) => {
        const date = new Date(data.timestamp * 1000).toLocaleDateString();
        if (!aggregatedData[data.symptom]) {
          aggregatedData[data.symptom] = {};
        }
        aggregatedData[data.symptom][date] = data.severity;

        // Update symptom history for comparison
        if (!symptomHistories[data.symptom]) {
          symptomHistories[data.symptom] = [];
        }
        symptomHistories[data.symptom].push(data.severity);
      });

      const datasets = Object.keys(aggregatedData).map((symptom) => {
        const symptomData = uniqueDates.map((date) => aggregatedData[symptom][date] || null);
        return {
          label: symptom,
          backgroundColor: getRandomColor(),
          data: symptomData,
        };
      });

      chartData.value = {
        labels: uniqueDates,
        datasets: datasets,
      };

      // Compare the latest symptom entries
      compareSymptomEntries(symptomHistories);
    };

    // Function to generate random colors for the datasets
    const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    // Compare symptom entries and update the comparison paragraph
    const compareSymptomEntries = (symptomHistories) => {
      const comparisons = [];

      Object.keys(symptomHistories).forEach((symptom) => {
        const history = symptomHistories[symptom];
        const latestSeverity = history[history.length - 1];

        if (history.length === 1) {
          comparisons.push(`The symptom "${symptom}" is new, with a severity score of ${latestSeverity}.`);
        } else {
          const previousSeverity = history[history.length - 2];
          if (latestSeverity > previousSeverity) {
            comparisons.push(`The latest entry for "${symptom}" is higher than the previous record.`);
          } else if (latestSeverity < previousSeverity) {
            comparisons.push(`The latest entry for "${symptom}" is lower than the previous record.`);
          } else {
            comparisons.push(`The latest entry for "${symptom}" is the same as the previous record.`);
          }
        }
      });

      symptomComparisons.value = comparisons; // Update the comparison paragraph
    };

    // Function to add new symptom entry to Firestore
    const addSymptomEntry = async () => {
      if (!currentUser.value) {
        alert('Please log in to add symptom entries.');
        return;
      }

      try {
        const entry = {
          date: Timestamp.now(),
          userId: currentUser.value.uid, // Use current user's ID
          symptom: isOtherSymptom.value ? otherSymptom.value : newSymptom.value,
          severity: newSeverity.value,
        };

        await addDoc(collection(db, 'symptomEntries'), entry);
        alert('Symptom entry successfully recorded!');

        // Clear form fields after submission
        newSymptom.value = '';
        otherSymptom.value = '';
        newSeverity.value = '';
        isOtherSymptom.value = false;
      } catch (error) {
        console.error('Error adding symptom to Firestore:', error);
      }
    };

    // Real-time listener for Firestore to get updates without reloading
    const listenToSymptoms = () => {
      const symptoms = [];

      // Query only the entries of the current user
      const userEntriesQuery = query(
        collection(db, 'symptomEntries'),
        where('userId', '==', currentUser.value.uid) // Filter by current user's userId
      );

      onSnapshot(userEntriesQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            symptoms.push({ ...data, timestamp: data.date?.seconds });
          }
        });

        // Process and update the chart with the new data
        processSymptoms(symptoms);
      });
    };

    // Function to navigate back to ToolView page
    const goBack = () => {
      router.push('/tool');
    };

    // Load symptom data when the component is mounted and listen to real-time updates
    onMounted(() => {
      if (currentUser.value) {
        listenToSymptoms(); // Only listen if userId is available
      }
    });

    return {
      newSymptom,
      otherSymptom,
      newSeverity,
      isOtherSymptom,
      chartData,
      symptomComparisons,
      addSymptomEntry,
      checkOtherSymptom,
      goBack,
    };
  },
};
</script>

<style scoped>
.container {
  background-color: #f6f4f3;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
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

form {
  margin-bottom: 30px;
}

.btn-primary {
  background-color: #e5533d;
  border-color: #e5533d;
}

.btn-primary:hover {
  background-color: #c94431;
  border-color: #c94431;
}

.bar-chart-container {
  margin-top: 50px;
}

.symptom {
  font-size: 1.125rem;
  line-height: 1.0;
}
</style>
