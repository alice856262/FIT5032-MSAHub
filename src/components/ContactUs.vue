<template>
  <div class="container mt-3 mb-5" role="main" aria-labelledby="contactUsTitle">
    <h1 id="contactUsTitle">Contact Us</h1>
    <p>
      Have any questions or feedback? Please fill out the form below to get in touch with us. We look forward to hearing from you!
    </p>
    <form @submit.prevent="sendEmail">
      <div class="mb-3">
        <label for="name">Name</label>
        <input v-model="name" type="text" id="name" class="form-control" required aria-required="true" aria-label="Enter your full name" />
      </div>
      <div class="mb-3">
        <label for="email">Email</label>
        <input v-model="email" type="email" id="email" class="form-control" required aria-required="true" aria-label="Enter your email address" />
      </div>
      <div class="mb-3">
        <label for="message">Message</label>
        <textarea v-model="message" id="message" class="form-control" rows="5" required aria-required="true" aria-label="Enter your message"></textarea>
      </div>
      <div class="mb-3">
        <label for="attachment">Attachments</label>
        <input @change="onFileChange" type="file" id="attachment" class="form-control" multiple aria-label="Attach files if necessary" />
      </div>
      <div class="text-center">
        <button type="submit" class="btn btn-primary" aria-label="Submit your message">Submit</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { getFirestore, addDoc, collection } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default {
  data() {
    return {
      name: '',
      email: '',
      message: '',
      attachments: [],
    };
  },
  methods: {
    onFileChange(event) {
      this.attachments = Array.from(event.target.files); // Convert file list to array
    },
    async saveToFirestore() {
      const db = getFirestore();
      const storage = getStorage();
      const uploadedFiles = [];

      // Save each attachment to Firebase Storage with path including email
      for (const file of this.attachments) {
        const storagePath = `contactAttachments/${this.email}/${file.name}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        uploadedFiles.push(downloadURL); // Store the download URL of the uploaded file
      }

      // Save message content and attachment URLs to Firestore
      const docRef = await addDoc(collection(db, "contactEmails"), {
        name: this.name,
        email: this.email,
        message: this.message,
        attachments: uploadedFiles,
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
          email: this.email,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Email sent successfully:', response.data);
        alert("Your message has been sent successfully!");
        
        // Reset form fields and attachments after successful submission
        this.name = '';
        this.email = '';
        this.message = '';
        this.attachments = [];
      } catch (error) {
        console.error('Error sending email:', error);
        alert("There was an error sending your message. Please try again.");
      }
    }
  },
};
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
</style>