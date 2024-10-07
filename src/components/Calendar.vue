<template>
  <div class="calendar-view">
    <h1 class="mb-3">Treatment Calendar</h1>
    <p>You can use this calendar to plan your treatments and medication schedule!</p>
    <FullCalendar :options="calendarOptions" />

    <!-- Modal for adding or editing events -->
    <div v-if="showModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <form @submit.prevent="saveEvent">
          <h3>{{ editingEvent ? 'Edit Event' : 'Add Event' }}</h3>
          <div class="form-group">
            <label>Title:</label>
            <input type="text" class="form-control" v-model="eventForm.title" required />
          </div>
          <div class="form-group">
            <label>Description:</label>
            <textarea class="form-control" v-model="eventForm.description"></textarea>
          </div>
          <div class="form-group">
            <label><input type="checkbox" v-model="eventForm.allDay" /> All Day Event</label>
          </div>
          <div v-if="!eventForm.allDay">
            <div class="form-group">
              <label>Start Time:</label>
              <input type="datetime-local" class="form-control" v-model="eventForm.startTime" required />
            </div>
            <div class="form-group">
              <label>End Time:</label>
              <input type="datetime-local" class="form-control" v-model="eventForm.endTime" required />
            </div>
          </div>
          <div class="d-flex justify-content-between mt-3">
            <button class="btn btn-primary" type="submit">{{ editingEvent ? 'Save Changes' : 'Add Event' }}</button>
            <button class="btn btn-secondary" type="button" @click="closeModal">Cancel</button>
            <button v-if="editingEvent" class="btn btn-primary" type="button" @click="deleteEvent">Delete Event</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, Timestamp, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../router/useAuth.js'; // Import useAuth for authentication

export default {
  components: {
    FullCalendar,
  },
  data() {
    return {
      events: [],
      showModal: false,
      eventForm: {
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        allDay: false,
      },
      editingEvent: null,
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        editable: true, // Make events draggable
        selectable: true, // Allow selecting a date range
        events: [],
        dateClick: this.handleDateClick,
        eventClick: this.handleEventClick,
        eventChange: this.handleEventChange, // For drag-and-drop event changes
        select: this.handleDateRangeSelect, // For selecting a date range to create an event
      },
    };
  },
  methods: {
    fetchEvents() {
      const { currentUser } = useAuth(); // Get the current user using useAuth composable

      // Ensure we only proceed if there is a logged-in user
      if (!currentUser.value) return;

      // Fetch events for the current user
      const eventsCollection = query(collection(db, 'events'), where('userId', '==', currentUser.value.uid));

      onSnapshot(eventsCollection, (snapshot) => {
        this.events = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          start: new Date(doc.data().start.seconds * 1000),
          end: doc.data().end ? new Date(doc.data().end.seconds * 1000) : null,
        }));
        this.calendarOptions.events = this.events;
      });
    },
    // Handle single date click to open the event creation modal
    handleDateClick(info) {
      this.resetEventForm();
      this.eventForm.startTime = this.formatDateTimeLocal(new Date(info.dateStr));
      this.showModal = true;
    },
    // Handle selecting a date range to create an event across multiple days
    handleDateRangeSelect(info) {
      this.resetEventForm();
      this.eventForm.startTime = this.formatDateTimeLocal(new Date(info.startStr));
      this.eventForm.endTime = this.formatDateTimeLocal(new Date(info.endStr));
      this.showModal = true;
    },
    // Handle event click to view/edit/delete
    handleEventClick(info) {
      this.editingEvent = info.event;
      this.eventForm.title = info.event.title;
      this.eventForm.description = info.event.extendedProps.description || '';
      this.eventForm.allDay = info.event.allDay || false;
      if (!this.eventForm.allDay) {
        this.eventForm.startTime = this.formatDateTimeLocal(new Date(info.event.start));
        this.eventForm.endTime = this.formatDateTimeLocal(new Date(info.event.end));
      }
      this.showModal = true;
    },
    checkForConflicts(newEvent, excludeEventId = null) {
      return this.events.some(event => {
        if (excludeEventId && event.id === excludeEventId) {
          return false;
        }

        const existingStart = event.start;
        const existingEnd = event.end || new Date(existingStart.getTime() + 86400000);
        const newStart = new Date(newEvent.start.seconds ? newEvent.start.seconds * 1000 : newEvent.start);
        const newEnd = new Date(newEvent.end ? (newEvent.end.seconds ? newEvent.end.seconds * 1000 : newEvent.end) : newStart.getTime() + 86400000);

        return (
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        );
      });
    },
    saveEvent() {
      const { currentUser } = useAuth();

      if (!currentUser.value) {
        alert('User not logged in.');
        return;
      }

      const newEvent = {
        userId: currentUser.value.uid,
        title: this.eventForm.title,
        description: this.eventForm.description,
        allDay: this.eventForm.allDay,
        start: this.eventForm.allDay
          ? Timestamp.fromDate(new Date(this.eventForm.startTime.split('T')[0]))
          : Timestamp.fromDate(new Date(this.eventForm.startTime)),
        end: this.eventForm.allDay
          ? Timestamp.fromDate(new Date(new Date(this.eventForm.startTime.split('T')[0]).getTime() + 86400000))
          : Timestamp.fromDate(new Date(this.eventForm.endTime)),
      };

      const excludeEventId = this.editingEvent ? this.editingEvent.id : null;
      if (this.checkForConflicts(newEvent, excludeEventId)) {
        alert('This event conflicts with an existing one! Please choose a different time.');
        return;
      }

      if (this.editingEvent) {
        const eventRef = doc(db, 'events', this.editingEvent.id);
        updateDoc(eventRef, newEvent)
          .then(() => {
            console.log('Event updated:', newEvent);
          })
          .catch((error) => {
            console.error('Error updating event:', error);
          });
      } else {
        addDoc(collection(db, 'events'), newEvent)
          .then(() => {
            console.log('Event added:', newEvent);
          })
          .catch((error) => {
            console.error('Error adding event:', error);
          });
      }

      this.closeModal();
    },
    deleteEvent() {
      if (this.editingEvent) {
        const confirmDelete = confirm(`Delete event: ${this.editingEvent.title}?`);
        if (confirmDelete) {
          deleteDoc(doc(db, 'events', this.editingEvent.id))
            .then(() => {
              console.log('Event deleted:', this.editingEvent.title);
            })
            .catch((error) => {
              console.error('Error deleting event:', error);
            });
        }
      }
      this.closeModal();
    },
    handleEventChange(info) {
      const updatedEvent = {
        userId: info.event.extendedProps.userId,
        title: info.event.title,
        start: Timestamp.fromDate(new Date(info.event.startStr)),
        end: Timestamp.fromDate(new Date(info.event.endStr)),
        allDay: info.event.allDay,
      };

      if (this.checkForConflicts(updatedEvent, info.event.id)) {
        alert('This event conflicts with an existing one! Please choose a different time.');
        info.revert();
        return;
      }

      const eventRef = doc(db, 'events', info.event.id);
      updateDoc(eventRef, updatedEvent)
        .then(() => {
          console.log('Event updated after drag:', updatedEvent);
        })
        .catch((error) => {
          console.error('Error updating event:', error);
        });
    },
    formatDateTimeLocal(date) {
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    },
    resetEventForm() {
      this.eventForm = {
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        allDay: false,
      };
      this.editingEvent = null;
    },
    closeModal() {
      this.showModal = false;
    },
  },
  mounted() {
    const { currentUser } = useAuth();
    watch(
      currentUser,
      (user) => {
        if (user) {
          this.fetchEvents();
        }
      },
      { immediate: true }
    );
  },
};
</script>

<style scoped>
.container {
  padding: 30px;
  border-radius: 10px;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

p {
  color: #666;
  font-size: 18px;
  line-height: 1.6;
}

.calendar-view {
  padding: 20px;
}

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

.form-group {
  margin-bottom: 15px;
}

.form-group input, 
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
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
</style>
