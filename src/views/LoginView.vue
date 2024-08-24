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
          <div class="mb-5">
            <p class="text-center">Don't have an account? <router-link to="/register">Register here!</router-link></p>
          </div>
        </form>
      </div>
    </div>
  </div>
  <br>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../router/useAuth.js';

const email = ref('');
const password = ref('');
const { login, loginWithGoogle } = useAuth();

const handleLogin = async () => {
  await login(email.value, password.value);
};

const handleGoogleLogin = async () => {
  await loginWithGoogle();
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
</style>