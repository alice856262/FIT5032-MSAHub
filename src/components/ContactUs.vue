<template>
  <div class="contact-us">
    <h2>Contact Us</h2>
    <form @submit.prevent="sendEmail">
      <div class="mb-3">
        <label for="name">Name</label>
        <input v-model="name" type="text" id="name" class="form-control" required />
      </div>
      <div class="mb-3">
        <label for="email">Email</label>
        <input v-model="email" type="email" id="email" class="form-control" required />
      </div>
      <div class="mb-3">
        <label for="message">Message</label>
        <textarea v-model="message" id="message" class="form-control" rows="5" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Send Email</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { getFirestore, addDoc, collection } from "firebase/firestore";

const token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjVhYWZmNDdjMjFkMDZlMjY2Y2NlMzk1YjIxNDVjN2M2ZDQ3MzBlYTUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzMjU1NTk0MDU1OS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjMyNTU1OTQwNTU5LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA4NDA5NzI1OTk0OTE0ODA5MTcxIiwiZW1haWwiOiJhbGljZTg1NjI2MkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6Il9CT1FpanhqNXBrUEZSYXA4c2hJU0EiLCJpYXQiOjE3MjcyNzUxNjMsImV4cCI6MTcyNzI3ODc2M30.R7DGQ0vPhdUKnrB59DEQyUyUYvFQ4wF2iji3iHZV0rFI6CJHh8DU_PJuFSNeLyfqHCMzKwyv5llIbFxYbwd3ly7Hl8qjpBh88cpNhfvT9HXBjzZUKe1tvESMCW_pNPMMI7BeR9yApaHzFYMRMWtM57g9iscPZ_-24Ifdom0Vdq7cJA3Js8YELd82p_jvItBUvHN4Ewq5VIUWkuEZey9l0vThAFfSEeqwxXrPXpItgw6b1vKvRss3xwLyUDBQlUyf2dA4HN4heiR65p7WuUApjDCvQ1fOh8Eos4VUXMcB3mcVtBmyAxxCaKw56DZNuUsjZwCmSwPjP9P4ChOolT5V_A"

export default {
  data() {
    return {
      name: '',
      email: '',
      message: '',
    };
  },
  methods: {
    async saveToFirestore() {
      const db = getFirestore();
      const docRef = await addDoc(collection(db, "contactEmails"), {
        name: this.name,
        email: this.email,
        message: this.message,
        timestamp: new Date(),
      });
      console.log("Message saved to Firestore with ID: ", docRef.id);
      return docRef.id;
    },
    async sendEmail() {
      try {
        // Save message content to Firestore
        await this.saveToFirestore();

        // Send the email using the backend function
        const response = await axios.post('https://sendemail-t4aajf3gxq-uc.a.run.app', {
          name: this.name,
          email: this.email
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log('Email sent successfully:', response.data);
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
  },
};
</script>
