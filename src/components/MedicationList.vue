<template>
    <div class="medication-view">
      <h1 class="mb-3">Medication Usage</h1>
  
      <p v-if="!currentUser">Please log in to view your medication data.</p>
      <p v-if="medicationData.length">You can search and sort your medication list by name, dosage, frequency, and date.</p>
      <InteractiveTable v-if="medicationData.length" :columns="columns" :rows="medicationData" :rowsPerPage="10" />
      <p v-else>No medication data available.</p>
  
      <h2>Add New Medication</h2>
      <form @submit.prevent="addMedication">
        <div class="form-group">
          <label for="medication">Medication</label>
          <input v-model="newMedication.medication" type="text" id="medication" required class="form-control" />
        </div>
        <div class="form-group">
          <label for="dosage">Dosage</label>
          <input v-model="newMedication.dosage" type="text" id="dosage" required class="form-control" />
        </div>
        <div class="form-group">
          <label for="frequency">Frequency</label>
          <input v-model="newMedication.frequency" type="text" id="frequency" required class="form-control" />
        </div>
        <div class="form-group">
          <label for="startDate">Start Date</label>
          <input v-model="newMedication.startDate" type="date" id="startDate" required class="form-control" />
        </div>
        <div class="form-group">
          <label for="endDate">End Date (optional)</label>
          <input v-model="newMedication.endDate" type="date" id="endDate" class="form-control" />
        </div>
        <button type="submit" class="btn btn-primary mt-3">Add Medication</button>
      </form>
    </div>
  </template>
  
  <script>
  import { ref, watch, onMounted } from 'vue';
  import { collection, addDoc, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
  import { db } from '../config/firebaseConfig.js';
  import { useAuth } from '../router/useAuth.js'; // Import the useAuth composable for user authentication
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
            userId: currentUser.value.uid, // Ensure we're using the authenticated user's UID
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
  
  .form-group {
    margin-bottom: 15px;
  }
  </style>
  