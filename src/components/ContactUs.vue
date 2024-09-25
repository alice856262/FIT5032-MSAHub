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
        <div class="mb-3">
          <label for="attachment">Attachment</label>
          <input @change="onFileChange" type="file" id="attachment" class="form-control" />
        </div>
        <button type="submit" class="btn btn-primary">Send Email</button>
      </form>
    </div>
</template>

<script>
import axios from 'axios';

const token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjVhYWZmNDdjMjFkMDZlMjY2Y2NlMzk1YjIxNDVjN2M2ZDQ3MzBlYTUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzMjU1NTk0MDU1OS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjMyNTU1OTQwNTU5LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA4NDA5NzI1OTk0OTE0ODA5MTcxIiwiZW1haWwiOiJhbGljZTg1NjI2MkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6Il9CT1FpanhqNXBrUEZSYXA4c2hJU0EiLCJpYXQiOjE3MjcyNzUxNjMsImV4cCI6MTcyNzI3ODc2M30.R7DGQ0vPhdUKnrB59DEQyUyUYvFQ4wF2iji3iHZV0rFI6CJHh8DU_PJuFSNeLyfqHCMzKwyv5llIbFxYbwd3ly7Hl8qjpBh88cpNhfvT9HXBjzZUKe1tvESMCW_pNPMMI7BeR9yApaHzFYMRMWtM57g9iscPZ_-24Ifdom0Vdq7cJA3Js8YELd82p_jvItBUvHN4Ewq5VIUWkuEZey9l0vThAFfSEeqwxXrPXpItgw6b1vKvRss3xwLyUDBQlUyf2dA4HN4heiR65p7WuUApjDCvQ1fOh8Eos4VUXMcB3mcVtBmyAxxCaKw56DZNuUsjZwCmSwPjP9P4ChOolT5V_A";

export default {
    data() {
      return {
        name: '',
        email: '',
        message: '',
        attachment: null,
      };
    },
    methods: {
      onFileChange(event) {
        this.attachment = event.target.files[0];
      },
      async sendEmail() {
        const formData = new FormData();
        formData.append('name', this.name);
        formData.append('email', this.email);
        formData.append('message', this.message);
        if (this.attachment) {
          formData.append('attachment', this.attachment); // Add attachment if available
        }

        try {
          const response = await axios.post('https://sendemail-t4aajf3gxq-uc.a.run.app', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
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
