<template>
  <main class="medication-view">
    <h1 class="mb-3">Medication Usage</h1>

    <p v-if="!currentUser">Please log in to view your medication data.</p>
    <p v-if="medicationData.length">You can search and sort your medication list by name, dosage, frequency, and date.</p>
    <InteractiveTable 
      v-if="medicationData.length" 
      :columns="columns" 
      :rows="medicationData" 
      :rowsPerPage="10" 
      aria-label="Interactive table showing medication list" 
    />
    <p v-else>No medication data available.</p>

    <br/>
    <br/>

    <h2>Add New Medication</h2>
    <form @submit.prevent="addMedication" aria-labelledby="form-description">
      <p id="form-description" class="sr-only">Fill out this form to add a new medication.</p>
      <div class="form-group">
        <label for="medication">Medication</label>
        <input v-model="newMedication.medication" type="text" id="medication" required class="form-control" aria-required="true" aria-describedby="medication-desc" />
        <p id="medication-desc" class="sr-only">Enter the name of the medication.</p>
      </div>
      <div class="form-group">
        <label for="dosage">Dosage</label>
        <input v-model="newMedication.dosage" type="text" id="dosage" required class="form-control" aria-required="true" aria-describedby="dosage-desc" />
        <p id="dosage-desc" class="sr-only">Enter the dosage information.</p>
      </div>
      <div class="form-group">
        <label for="frequency">Frequency</label>
        <input v-model="newMedication.frequency" type="text" id="frequency" required class="form-control" aria-required="true" aria-describedby="frequency-desc" />
        <p id="frequency-desc" class="sr-only">Enter how often you take the medication.</p>
      </div>
      <div class="form-group">
        <label for="startDate">Start Date</label>
        <input v-model="newMedication.startDate" type="date" id="startDate" required class="form-control" aria-required="true" aria-describedby="startdate-desc" />
        <p id="startdate-desc" class="sr-only">Enter the start date of the medication.</p>
      </div>
      <div class="form-group">
        <label for="endDate">End Date (optional)</label>
        <input v-model="newMedication.endDate" type="date" id="endDate" class="form-control" aria-describedby="enddate-desc" />
        <p id="enddate-desc" class="sr-only">Enter the end date of the medication if applicable.</p>
      </div>
      <button type="submit" class="btn btn-primary mt-3" aria-label="Add new medication">Add Medication</button>
    </form>
  </main>
</template>
  
<script>
import { ref, watch, onMounted } from 'vue';
import { collection, addDoc, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig.js';
import { useAuth } from '../router/useAuth.js';
import InteractiveTable from './MedicationInteractiveTable.vue';

export default {
  components: {
    InteractiveTable,
  },
  setup() {
    const { currentUser } = useAuth(); // Get the current user from useAuth composable
    const medicationData = ref([]); // Holds the fetched medication data
    const newMedication = ref({
      medication: '',
      dosage: '',
      frequency: '',
      startDate: '',
      endDate: '',
    });

    const columns = [
      { key: 'medication', label: 'Medication', searchable: true },
      { key: 'dosage', label: 'Dosage', searchable: true },
      { key: 'frequency', label: 'Frequency', searchable: true },
      { key: 'startDate', label: 'Start Date', searchable: true },
      { key: 'endDate', label: 'End Date', searchable: true },
    ];

    const fetchMedications = (userId) => {
      if (userId) {
        console.log("Fetching medications for user:", userId);

        const q = query(collection(db, 'medications'), where('userId', '==', userId));
        onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            console.log("No medications found for this user");
          } else {
            medicationData.value = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              startDate: new Date(doc.data().startDate.seconds * 1000).toLocaleDateString(),
              endDate: doc.data().endDate ? new Date(doc.data().endDate.seconds * 1000).toLocaleDateString() : 'N/A',
            }));
            console.log("Fetched medications:", medicationData.value);
          }
        }, (error) => {
          console.error("Error fetching medications:", error);
        });
      } else {
        console.warn("No user ID found. Cannot fetch medications.");
      }
    };

    const addMedication = async () => {
      if (!currentUser.value) {
        alert('Please log in to add medications.');
        return;
      }

      try {
        const newMed = {
          userId: currentUser.value.uid,
          medication: newMedication.value.medication,
          dosage: newMedication.value.dosage,
          frequency: newMedication.value.frequency,
          startDate: Timestamp.fromDate(new Date(newMedication.value.startDate)),
          endDate: newMedication.value.endDate ? Timestamp.fromDate(new Date(newMedication.value.endDate)) : null,
        };

        await addDoc(collection(db, 'medications'), newMed);
        newMedication.value = {
          medication: '',
          dosage: '',
          frequency: '',
          startDate: '',
          endDate: '',
        };
        alert('Medication added successfully!');
      } catch (error) {
        console.error('Error adding medication:', error);
      }
    };

    watch(currentUser, (newUser) => {
      if (newUser && newUser.uid) {
        console.log("User logged in:", newUser.uid);
        fetchMedications(newUser.uid); // Fetch medications for the logged-in user
      } else {
        console.log("User logged out or no user, clearing medication data.");
        medicationData.value = []; // Clear the medication data if no user is logged in
      }
    }, { immediate: true }); // Trigger the watcher immediately on component mount

    onMounted(() => {
      if (currentUser.value) {
        console.log("User already logged in, fetching medications:", currentUser.value.uid);
        fetchMedications(currentUser.value.uid);
      }
    });

    return {
      columns,
      medicationData,
      newMedication,
      addMedication,
      currentUser,
    };
  },
};
</script>
  
<style scoped>
.medication-view {
  padding: 20px;
}

p {
  color: #666;
  font-size: 1.125rem;
  line-height: 1.6;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.form-group {
  margin-bottom: 15px;
}

.btn-primary {
  background-color: #e5533d;
  border-color: #e5533d;
}

.btn-primary:hover {
  background-color: #c94431;
  border-color: #c94431;
}
</style>
  