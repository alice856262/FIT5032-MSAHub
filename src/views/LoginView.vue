<template>
  <div class="container mt-3 mb-5 custom-container">
    <div class="row">
      <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-6 offset-sm-1 offset-md-2 offset-lg-3 offset-xl-3">
        <h1 class="display-4 mb-4 text-center">Login</h1>
        <form @submit.prevent="handleLogin" aria-labelledby="login-form-heading">  <!-- .prevent: prevents browser reloads page when the form is submitted -->
          <!-- Email Field -->
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" v-model="email" required aria-required="true" aria-describedby="email-desc" />
          </div>
          
          <!-- Password Field -->
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" v-model="password" required aria-required="true" aria-describedby="password-desc" />
          </div>

          <!-- Login Button -->
          <div class="mt-5 mb-3 text-center">
            <button type="submit" class="btn btn-primary-login" aria-label="Login to your account">Login</button>
          </div>

          <!-- Forgot Password Link -->
          <div class="mb-3 text-center">
            <a href="#" class="custom-link" @click.prevent="handleForgotPasswordLinkClick" aria-label="Forgot password? Reset it here.">Forgot Password?</a>
          </div>
          
          <!-- Register Link -->
          <div class="text-center">
            <p>Don't have an account? <router-link to="/register" class="custom-link" aria-label="Register a new account">Register here!</router-link></p>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Forgot Password Modal -->
  <div class="modal" v-if="showForgotPasswordModal" aria-labelledby="forgot-password-title" aria-modal="true" role="dialog">
    <div class="modal-content" @keydown.esc="closeForgotPasswordModal">
      <h3 class="mb-4" id="forgot-password-title">Send Reset Password Link</h3>
      <div class="mb-3">
        <input type="email" v-model="resetEmail" placeholder="Enter your email" class="form-control" aria-required="true" aria-describedby="reset-email-desc"/>
      </div>
      <div class="d-flex justify-content-between">
        <button class="btn btn-primary" @click="handleForgotPassword" aria-label="Send password reset email">Send</button>
        <button class="btn btn-secondary" @click="closeForgotPasswordModal" aria-label="Cancel password reset">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// // ------- Only for Basic Auth -------
// import { ref } from 'vue';
// import { useAuth } from '../router/useAuth.js';

// const email = ref('');
// const password = ref('');
// const { login } = useAuth();

// // Call login() from useAuth, passing the email and password values
// const handleLogin = async () => {
//   console.log('Login initiated...');
//   await login(email.value, password.value);
// };
// // ------ Only for Basic Auth -------

// Firebase
import { ref } from 'vue';
import { useAuth } from '../router/useAuth.js';
import { auth } from '../config/firebaseConfig.js';
import { sendPasswordResetEmail } from 'firebase/auth';

const email = ref('');
const password = ref('');
const { login, loginWithGoogle } = useAuth();
const showForgotPasswordModal = ref(false);
const resetEmail = ref('');

// const handleLogin = async () => {
//   await login(email.value, password.value);
// };

const handleLogin = async () => {
  await login(email.value, password.value);
};

// const handleGoogleLogin = async () => {
//   await loginWithGoogle();
// };

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
</script>

<style scoped>
button.btn-primary-login {
  color: white;
  border-radius: 60px;
  background-color: #e96951;
  height: 45px; 
  width: 210px; 
  font-weight: bold;
}

button.btn-primary-login:hover {
  background-color: #e5533d;
  border-color: #e5533d;
}

.custom-link {
  color: #e5533d;
  font-weight: bold;
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
  background-color: #ffdb99;
  padding: 30px;
  border-radius: 15px;
  width: 90%;
  max-width: 400px;
}

/* .google-signin {
  height: 48px;
  cursor: pointer;
} */

@media (max-width: 575px) {
  .container {
    padding: 15px;
  }

  .modal-content {
    width: 100%;
    padding: 20px;
  }
}

@media (min-width: 576px) and (max-width: 768px) {
  .container {
    padding: 20px;
  }

  .modal-content {
    padding: 25px;
  }
}

@media (min-width: 992px) and (max-width: 1200px) {
  .container {
    padding: 25px;
  }

  .modal-content {
    padding: 30px;
  }
}

@media (min-width: 1400px) {
  .container {
    padding: 40px;
  }

  .modal-content {
    padding: 35px;
  }
}
</style>