<template>
  <div class="container mt-5 custom-container">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <h1 class="display-4 mb-4">Create New Account</h1>
        <form @submit.prevent="submitForm">
          <div class="row mb-3">
            <div class="col-md-4 col-sm-4">
              <label for="firstName" class="form-label">First Name *</label>
              <input type="text" class="form-control" id="firstName" 
              @blur="validateFirstName(true)"
              @input="validateFirstName(false)"
              v-model="formData.firstName" />
              <div v-if="errors.firstName" class="text-danger">{{ errors.firstName }}</div>
            </div>
            <div class="col-md-4 col-sm-4">
              <label for="lastName" class="form-label">Last Name *</label>
              <input type="text" class="form-control" id="lastName" 
              @blur="validateLastName(true)"
              @input="validateLastName(false)"
              v-model="formData.lastName" />
              <div v-if="errors.lastName" class="text-danger">{{ errors.lastName }}</div>
            </div>
            <div class="col-md-4 col-sm-4">
              <label for="gender" class="form-label">Gender *</label>
              <select class="form-select" id="gender" v-model="formData.gender" @change="validateGender">
                <option value="" disabled>Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div v-if="errors.gender" class="text-danger">{{ errors.gender }}</div>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6 col-sm-6">
              <label for="email" class="form-label">Email *</label>
              <input type="email" class="form-control" id="email" 
              @blur = "() => validateEmail(true)"
              @input = "() => validateEmail(false)"
              v-model="formData.email" />
              <div v-if = "errors.email" class = "text-danger">{{ errors.email }}</div>
            </div>
            <div class="col-md-6 col-sm-6">
              <label for="phone" class="form-label">Phone</label>
              <input type="text" class="form-control" id="phone" v-model="formData.phone" />
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6 col-sm-6">
              <label for="password" class="form-label">Password *</label>
              <input type="password" class="form-control" id="password" 
              @blur = "() => validatePassword(true)"
              @input = "() => validatePassword(false)"
              v-model="formData.password" />
              <div v-if = "errors.password" class = "text-danger">{{ errors.password }}</div>
            </div>
            <div class="col-md-6 col-sm-6">
              <label for="confirmPassword" class="form-label">Confirm Password *</label>
              <input type="password" class="form-control" id="confirmPassword" 
              @input = "() => validateConfirmPassword(false)"
              v-model="formData.confirmPassword" />
              <div v-if = "errors.confirmPassword" class = "text-danger">{{ errors.confirmPassword }}</div>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-4 col-sm-4">
              <label for="dob" class="form-label">Date of Birth *</label>
              <input type="date" class="form-control" id="dob" 
              @blur="validateDob(true)"
              v-model="formData.dob" />
              <div v-if="errors.dob" class="text-danger">{{ errors.dob }}</div>
            </div>
            <div class="col-md-8 col-sm-8">
              <label for="address" class="form-label">Address</label>
              <input type="text" class="form-control" id="address" v-model="formData.address" />
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6 col-sm-6">
              <label for="reason" class="form-label">Main reason for joining MSA Hub *</label>
              <select class="form-select" id="reason" v-model="formData.reason" @change="validateReason">
                <option value="" disabled>Select your reason</option>
                <option value="patient">I'm a MSA Patient</option>
                <option value="caregiver">I'm a Caregiver</option>
                <option value="professional">I'm a Professional</option>
              </select>
              <div v-if="errors.reason" class="text-danger">{{ errors.reason }}</div>
            </div>
          </div>
          <div class="row mb-3" style="margin-top: 30px">
            <div class="text-center">
              <button type="submit" class="btn btn-primary me-2">Sign Up</button>
              <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
            </div>
          </div>
          <div class="row mb-5">
            <p class="text-center">Already registered? <router-link to="/login">Login</router-link></p>
          </div>
        </form>
      </div>
    </div>
  </div>
  <br>
</template>
  
<script setup>
import { ref } from 'vue';

// PrimeVue
// import DataTable from 'primevue/datatable';
// import Column from 'primevue/column';

// const booleanTemplate = (rowData) => {
//   return rowData.isAustralian ? 'Yes' : 'No';
// }

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
  validateFirstName(true);
  validateLastName(true);  
  validateGender();
  validateEmail(true);
  validatePassword(true);
  validateConfirmPassword(true);
  validateDob(true);
  validateReason(true);
  if (!Object.values(errors.value).some(x => x !== null)) {
    submittedCards.value.push({ ...formData.value });
    clearForm();
  }
};

const clearForm = () => {
  formData.value = {
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
  };
};

const errors = ref({
  firstName: null,
  lastName: null, 
  gender: null,
  email: null,
  phone: null,
  password: null,
  confirmPassword: null,
  dob: null,
  address: null,
  reason: null,
});

const validateFirstName = (blur) => {
    if (!formData.value.firstName) {
        if (blur) errors.value.firstName = "First name is required.";
    } else {
        errors.value.firstName = null;
    }
};

const validateLastName = (blur) => {
    if (!formData.value.lastName) {
        if (blur) errors.value.lastName = "Last name is required.";
    } else {
        errors.value.lastName = null;
    }
};

const validateGender = () => {
    if (!formData.value.gender) {
        errors.value.gender = "Please select your gender.";
    } else {
        errors.value.gender = null;
    }
};

const validateEmail = (blur) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.value.email) {
    if (blur) errors.value.email = "Email is required.";
  } else if (!emailPattern.test(formData.value.email)) {
    if (blur) errors.value.email = "Please enter a valid email address.";
  } else {
    errors.value.email = null;
  }
};

const validatePassword = (blur) => {
  const password = formData.value.password;
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    if (blur) errors.value.password = `Password must be at least ${minLength} characters long.`;
  } else if (!hasUppercase) {
    if (blur) errors.value.password = "Password must contain at least 1 uppercase letter.";
  } else if (!hasLowercase) {
    if (blur) errors.value.password = "Password must contain at least 1 lowercase letter.";
  } else if (!hasNumber) {
    if (blur) errors.value.password = "Password must contain at least 1 number.";
  } else if (!hasSpecialChar) {
    if (blur) errors.value.password = "Password must contain at least 1 special character.";
  } else {
    errors.value.password = null;
  }
};

const validateConfirmPassword = () => {
  if (formData.value.confirmPassword !== formData.value.password) {
    errors.value.confirmPassword = "Password do not match.";
  } else {
    errors.value.confirmPassword = null;
  }
};

const validateDob = (blur) => {
  if (!formData.value.dateOfBirth) {
    errors.value.dateOfBirth = "Date of Birth is required.";
  } else {
    errors.value.dateOfBirth = null;
  }
};

const validateReason = () => {
    if (!formData.value.reason) {
        errors.value.reason = "Please select your reason.";
    } else {
        errors.value.reason = null;
    }
};

</script>
  