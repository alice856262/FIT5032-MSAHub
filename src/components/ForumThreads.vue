<template>
  <div>
    <h2>{{ forumTitle }}</h2>
    <button class="btn btn-primary mb-3" @click="openModal">Start a New Thread</button>

    <!-- Modal for creating a new thread -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>Start a New Thread</h3>
        <form @submit.prevent="createThread">
          <div class="form-group">
            <label for="threadTitle">Thread Title</label>
            <input type="text" id="threadTitle" v-model="newThreadTitle" class="form-control" required />
          </div>
          <div class="form-group">
            <label for="initialMessage">Message</label>
            <textarea id="initialMessage" v-model="newThreadMessage" class="form-control" required></textarea>
          </div>
          <div class="form-group">
            <input type="checkbox" id="showName" v-model="showName" />
            <label for="showName">Show my name</label>
          </div>
          <button type="submit" class="btn btn-primary mt-2">Create Thread</button>
          <button type="button" class="btn btn-secondary mt-2" @click="closeModal">Cancel</button>
        </form>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="search-bar mb-3">
      <input type="text" v-model="searchQuery" placeholder="Search for threads..." class="form-control" />
    </div>

    <!-- Two-column layout for threads and details -->
    <div class="thread-container">
      <!-- Left column: Thread List -->
      <div class="thread-list">
        <h3>Threads</h3>
        <ul>
          <li v-for="thread in filteredThreads" :key="thread.id">
            <a @click="viewThread(thread.id)" href="javascript:void(0)">
              {{ thread.title }}<br />
              <small>Created on: {{ formatTimestamp(thread.createdAt) }}</small>
            </a>
          </li>
        </ul>
      </div>

      <!-- Right column: Thread Details -->
      <div class="thread-details" v-if="viewMode === 'details'">
        <button class="btn btn-secondary mb-3" @click="backToList">Close Thread</button>
        <h3>{{ currentThread.title }}</h3>
        <p>Started by: {{ currentThread.displayName }} on {{ formatTimestamp(currentThread.createdAt) }}</p>
        <div class="messages">
          <div v-for="(message, index) in currentThread.messages" :key="index" class="message">
            <p>{{ message.text }}</p>
            <small>By: {{ message.displayName }} on {{ formatTimestamp(message.timestamp) }}</small>
          </div>
        </div>
        <form @submit.prevent="addMessage">
          <div class="form-group">
            <label for="newMessage">Leave a message</label>
            <textarea id="newMessage" v-model="newMessage" class="form-control" required></textarea>
          </div>
          <div class="form-group">
            <input type="checkbox" id="showMessageName" v-model="showMessageName" />
            <label for="showMessageName">Show my name</label>
          </div>
          <button type="submit" class="btn btn-primary mt-2">Send Message</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { db } from '../config/firebaseConfig.js'; // Import Firestore configuration
import { collection, addDoc, getDocs, doc, updateDoc, query, where } from 'firebase/firestore'; // Firestore functions
import { Timestamp } from 'firebase/firestore'; // Import Firestore Timestamp
import { useAuth } from '../router/useAuth.js'; // Import useAuth to get user details
import { useRouter, useRoute } from 'vue-router'; // Import useRouter and useRoute from vue-router

const forumTitle = ref('');
const threads = ref([]);
const newThreadTitle = ref('');
const newThreadMessage = ref('');
const newMessage = ref('');

const showModal = ref(false); // State to show/hide modal
const viewMode = ref('list'); // 'list' or 'details'
const currentThread = ref(null);
const searchQuery = ref(''); // Search query for filtering threads
const showName = ref(true); // Show or hide user name for new thread
const showMessageName = ref(true); // Show or hide user name for new message

const { currentUser } = useAuth(); // Get the current user
const forumType = ref(''); // Forum type to filter threads

const router = useRouter(); // Get the router instance
const route = useRoute(); // Get the route instance

// Function to open the modal
const openModal = () => {
  showModal.value = true;
};

// Function to close the modal
const closeModal = () => {
  showModal.value = false;
};

// Fetch threads from Firestore on mounted, filtered by forumType
const fetchThreads = async () => {
  try {
    const threadsQuery = query(
      collection(db, 'threads'),
      where('forumType', '==', forumType.value) // Filter by forumType
    );
    const querySnapshot = await getDocs(threadsQuery);
    threads.value = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (error) {
    console.error('Error fetching threads:', error);
  }
};

// Helper function to create display name from first name and last name
const getDisplayName = () => {
  return currentUser.value.firstName + " " + currentUser.value.lastName;
};

// Save new thread to Firestore
const createThread = async () => {
  try {
    if (newThreadTitle.value && newThreadMessage.value) {
      const displayName = showName.value ? getDisplayName() : 'Anonymous';
      const newThread = {
        title: newThreadTitle.value,
        messages: [
          { 
            text: newThreadMessage.value, 
            timestamp: Timestamp.now(), 
            userId: currentUser.value.uid, 
            displayName: displayName // Use the displayName based on user choice
          }
        ],
        createdAt: Timestamp.now(), // Use Firestore Timestamp
        userId: currentUser.value.uid, // Include userId
        displayName: displayName, // Display name or Anonymous
        forumType: forumType.value // Include forumType
      };
      const docRef = await addDoc(collection(db, 'threads'), newThread);
      threads.value.push({ ...newThread, id: docRef.id });

      // Reset form fields and close modal
      newThreadTitle.value = '';
      newThreadMessage.value = '';
      showName.value = true; // Reset the checkbox to show name
      closeModal();
    }
  } catch (error) {
    console.error('Error creating thread:', error);
  }
};

const viewThread = (threadId) => {
  currentThread.value = threads.value.find((thread) => thread.id === threadId);
  if (currentThread.value) {
    viewMode.value = 'details';
  }
};

const backToList = () => {
  currentThread.value = null;
  viewMode.value = 'list';
};

const addMessage = async () => {
  if (newMessage.value && currentThread.value) {
    const displayName = showMessageName.value ? getDisplayName() : 'Anonymous';
    const newMsg = {
      text: newMessage.value,
      timestamp: Timestamp.now(), // Use Firestore Timestamp
      userId: currentUser.value.uid, // Include userId
      displayName: displayName // Use the displayName based on user choice
    };
    currentThread.value.messages.push(newMsg);

    // Update the thread in Firestore
    try {
      const threadRef = doc(db, 'threads', currentThread.value.id);
      await updateDoc(threadRef, {
        messages: currentThread.value.messages
      });
    } catch (error) {
      console.error('Error adding message:', error);
    }

    newMessage.value = '';
    showMessageName.value = true; // Reset the checkbox to show name
  }
};

// Filtered threads based on search query
const filteredThreads = computed(() => {
  return threads.value.filter(thread => 
    thread.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Helper function to format timestamps
const formatTimestamp = (timestamp) => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toLocaleString();
  } else if (timestamp instanceof Date) {
    return timestamp.toLocaleString();
  } else {
    return 'Invalid timestamp';
  }
};

onMounted(() => {
  forumType.value = route.params.forumType; // Set forumType from route params
  fetchThreads(); // Fetch threads from Firestore when the component is mounted
});
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffcf78;
  padding: 30px;
  border-radius: 15px;
  width: 50%;
}

.thread-container {
  display: flex;
}

.thread-list {
  flex: 1;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-right: 10px;
  max-height: 70vh; /* Set a max height */
  overflow-y: auto; /* Scroll if overflow */
}

.thread-details {
  flex: 3;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  max-height: 70vh; /* Set a max height */
  overflow-y: auto; /* Scroll if overflow */
}

.search-bar {
  width: 100%;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 10px;
}

a {
  cursor: pointer;
  color: #333;
  text-decoration: none;
}

a:hover {
  cursor: pointer;
  color: #e5533d;
  text-decoration: underline;
}

.messages {
  margin-bottom: 20px;
}

.message {
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.message:last-child {
  border-bottom: none;
}
</style>
