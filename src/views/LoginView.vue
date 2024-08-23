<template>
  <div class="container mt-5 custom-container">
    <div class="row">
      <div class="col-md-6 offset-md-3">
        <h1 class="display-4 mb-4">Login</h1>
        <form @submit.prevent="submitForm">
          <div class="row mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" v-model="formData.email" />
          </div>
          <div class="row mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" v-model="formData.password" />
          </div> 
          <div class="row mb-3" style="margin-top: 30px">
            <div class="text-center">
              <button type="submit" class="btn btn-primary me-2">Login</button>
            </div>
          </div>
          <div class="row mb-3">
            <div class="text-center">
              <button type="button" class="btn btn-secondary">Sign in with Google</button>
            </div> 
          </div>
          <div class="mb-4">
            <p class="text-center">Don't have an account? <router-link to="/register">Register here!</router-link></p>
          </div>
        </form>
      </div>  
    </div>
  </div>
</template>
  
<script setup>
import { ref } from 'vue';

const formData = ref({
    firstName: '',
    lastName: '', 
    gender: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dob: '',
    address: '',
    reason: ''
});

const submittedCards = ref([]);

const submitForm = () => {
  // validateFirstName(true);
  // validateLastName(true);  
  // validateGender();
  // validateEmail(true);
  // validatePassword(true);
  // validateConfirmPassword(true);
  // validateDob(true);
  // validateReason(true);
  if (!Object.values(errors.value).some(x => x !== null)) {
    submittedCards.value.push({ ...formData.value });
    clearForm();
  }
};

</script>
  