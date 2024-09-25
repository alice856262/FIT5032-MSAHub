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
