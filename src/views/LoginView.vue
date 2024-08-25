<template>
  <div class="container mt-5 custom-container">
    <div class="row">
      <div class="col-md-6 offset-md-3">
        <h1 class="display-4 mb-4">Login</h1>
        <form @submit.prevent="handleLogin">
          <div class="row mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" v-model="email" required />
          </div>
          <div class="row mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" v-model="password" required />
          </div>
          <div class="row mb-3" style="margin-top: 30px">
            <div class="text-center" style="margin-left: 3px">
              <button type="submit" class="btn btn-primary-login me-2">Login</button>
            </div>
          </div>
          <div class="row mb-3">
            <div class="text-center">
              <img src="/src/assets/google_signin.png" alt="Sign in with Google" style="height: 48px; cursor: pointer;" @click="handleGoogleLogin" />
            </div>
          </div>
          <div class="row mb-3">
            <div class="text-center">
              <a href="#" @click.prevent="handleForgotPasswordLinkClick">Forgot Password?</a>
            </div>
          </div>          
          <div class="mb-5">
            <p class="text-center">Don't have an account? <router-link to="/register">Register here!</router-link></p>
          </div>
        </form>
      </div>
    </div>
  </div>
  <br>
  <div class="modal" v-if="showForgotPasswordModal">
    <div class="modal-content mb-4">
      <h3>Send Reset Password Link</h3>
      <div class="mt-3 mb-4">
        <input type="email" v-model="resetEmail" placeholder="Enter your email" class="form-control" />
      </div>
      <div class="d-flex justify-content-between">
        <button class="btn btn-primary" @click="handleForgotPassword">Send</button>
        <button class="btn btn-secondary" @click="closeForgotPasswordModal">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../router/useAuth.js';
import { auth } from '../config/firebaseConfig.js';
import { sendPasswordResetEmail } from 'firebase/auth';

const email = ref('');
const password = ref('');
const { login, loginWithGoogle } = useAuth();
const showForgotPasswordModal = ref(false);
const resetEmail = ref('');

const handleLogin = async () => {
  await login(email.value, password.value);
};

const handleGoogleLogin = async () => {
  await loginWithGoogle();
};

const handleForgotPasswordLinkClick = () => {
  showForgotPasswordModal.value = true; // This sets the variable to true, showing the modal
};

const closeForgotPasswordModal = () => {
  showForgotPasswordModal.value = false; // This sets the variable to false, hiding the modal
};

// Function to handle forgot password
const handleForgotPassword = async () => {
  if (!resetEmail.value) {
    alert('Please enter your email.');
    return;
  }

  try {
    await sendPasswordResetEmail(auth, resetEmail.value);
    alert('Password reset email sent!');
    showForgotPasswordModal.value = false;
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
  }
};

// import { ref } from 'vue';
// import { useAuth } from '../router/useAuth.js';

// const email = ref('');
// const password = ref('');
// const { login } = useAuth();

// const handleLogin = () => {
//   login(email.value, password.value);
// };
</script>

<style scoped>
button.btn-primary-login {
    color: white;
    border-radius: 60px;
    background-color: #e96951;
    border-color: #333;
    height: 45px; 
    width: 210px; 
    font-weight: bold;
}
  
button.btn-primary-login:hover {
    background-color: #e5533d;
    border-color: #e5533d;
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
}

.modal-content {
  background-color: #ffcf78;
  padding: 30px;
  border-radius: 15px;
  width: 50%;
}

</style>