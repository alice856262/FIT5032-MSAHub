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

const token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjVhYWZmNDdjMjFkMDZlMjY2Y2NlMzk1YjIxNDVjN2M2ZDQ3MzBlYTUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzMjU1NTk0MDU1OS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjMyNTU1OTQwNTU5LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA4NDA5NzI1OTk0OTE0ODA5MTcxIiwiZW1haWwiOiJhbGljZTg1NjI2MkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IjZWRWNHTzdJcnU0cTZwMlg5VGRiWGciLCJpYXQiOjE3MjcyNjcxMDEsImV4cCI6MTcyNzI3MDcwMX0.QMcsF_e4-HpiGWP-FGYansQ6O0himt_85NSHnPDlwLbL5EqQhoEH-4d8OWUW3I4q-bO_jH2iI0ldrW4xIxr7SC5fwFYh22E4gb-m-eFZChExOCTl29DRF3o7AOlYW0lWD1D1baZ-_wdKGvsfnE1wZf__8-_rKuk_UEAnYAeR0AjuAYCVz3AviYEL0DWFm3I7psPOi9j0yRTTnNVjYQ5NMfv6WnS1Ru-iT400hNFJyCk8sZ23y8O85xZAoxvIRQ0DWXyBB375COMzjSFjMf_WQoKJvCQc8yzKkUgLhQtEmGPmYkIGF_cSD7JLexcNd-WjaVUnTuNkSKeIfCbf2tVkEg";

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
