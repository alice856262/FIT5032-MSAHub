<template>
  <div class="container mt-3 custom-container">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <h1 class="display-4 mb-4">Create New Account</h1>
        <form @submit.prevent="submitForm" aria-live="polite">  <!-- .prevent: prevents browser reloads page when the form is submitted -->
          <!-- Form Fields for User Details -->
          <div class="row mb-3">
            <div class="col-md-4 col-sm-4">
              <label for="firstName" class="form-label">First Name *</label>
              <input type="text" class="form-control" id="firstName" 
                @blur="validateFirstName(true)"
                @input="validateFirstName(false)"
                v-model="formData.firstName" 
                aria-required="true" aria-describedby="firstNameError" />
              <div v-if="errors.firstName" class="text-danger" id="firstNameError">{{ errors.firstName }}</div>
            </div>
            <div class="col-md-4 col-sm-4">
              <label for="lastName" class="form-label">Last Name *</label>
              <input type="text" class="form-control" id="lastName" 
                @blur="validateLastName(true)"
                @input="validateLastName(false)"
                v-model="formData.lastName" 
                aria-required="true" aria-describedby="lastNameError" />
              <div v-if="errors.lastName" class="text-danger" id="lastNameError">{{ errors.lastName }}</div>
            </div>
            <div class="col-md-4 col-sm-4">
              <label for="gender" class="form-label">Gender *</label>
              <select class="form-select" id="gender" v-model="formData.gender" @change="validateGender" aria-required="true" aria-describedby="genderError">
                <option value="" disabled>Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div v-if="errors.gender" class="text-danger" id="genderError">{{ errors.gender }}</div>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6 col-sm-6">
              <label for="email" class="form-label">Email *</label>
              <input type="email" class="form-control" id="email" 
                @blur = "validateEmail(true)"
                @input = "validateEmail(false)"
                v-model="formData.email" 
                aria-required="true" aria-describedby="emailError" />
              <div v-if="errors.email" class="text-danger" id="emailError">{{ errors.email }}</div>
            </div>
            <div class="col-md-6 col-sm-6">
              <label for="phone" class="form-label">Phone</label>
              <input type="text" class="form-control" id="phone" 
                v-model="formData.phone" 
                aria-label="Phone number" />
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6 col-sm-6">
              <label for="password" class="form-label">Password *</label>
              <input type="password" class="form-control" id="password" 
                @blur = "validatePassword(true)"
                @input = "validatePassword(false)"
                v-model="formData.password" 
                aria-required="true" aria-describedby="passwordError" />
              <div v-if="errors.password" class="text-danger" id="passwordError">{{ errors.password }}</div>
            </div>
            <div class="col-md-6 col-sm-6">
              <label for="confirmPassword" class="form-label">Confirm Password *</label>
              <input type="password" class="form-control" id="confirmPassword" 
                @input = "validateConfirmPassword(false)"
                v-model="formData.confirmPassword" 
                aria-required="true" aria-describedby="confirmPasswordError" />
              <div v-if="errors.confirmPassword" class="text-danger" id="confirmPasswordError">{{ errors.confirmPassword }}</div>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-4 col-sm-4">
              <label for="dob" class="form-label">Date of Birth *</label>
              <input type="date" class="form-control" id="dob" 
                @blur="validateDob(true)"
                v-model="formData.dob" 
                aria-required="true" aria-describedby="dobError" />
              <div v-if="errors.dob" class="text-danger" id="dobError">{{ errors.dob }}</div>
            </div>
            <div class="col-md-8 col-sm-8">
              <label for="address" class="form-label">Address</label>
              <input type="text" class="form-control" id="address" 
                v-model="formData.address" 
                aria-label="Address" />
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6 col-sm-6">
              <label for="reason" class="form-label">Main Reason for Joining Us *</label>
              <select class="form-select" id="reason" v-model="formData.reason" @change="validateReason" aria-required="true" aria-describedby="reasonError">
                <option value="" disabled>Select your reason</option>
                <option value="patient">I'm a MSA Patient</option>
                <option value="caregiver">I'm a Caregiver</option>
                <option value="professional">I'm a Professional</option>
              </select>
              <div v-if="errors.reason" class="text-danger" id="reasonError">{{ errors.reason }}</div>
            </div>
          </div>
          <!-- Submit/Cancel Button -->
          <div class="mt-4 mb-3 text-center">
            <button type="submit" class="btn btn-primary" aria-label="Sign up for a new account">Sign Up</button>
          </div>
          <div class="mb-3 text-center">
            <button type="button" class="btn btn-secondary" @click="clearForm" aria-label="Clear the form">Clear</button>
          </div>
          <div class="row mb-5">
            <p class="text-center">Already registered? <router-link to="/login" class="custom-link text-center" aria-label="Go to login page">Login</router-link></p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref } from 'vue';
// import { useAuth } from '../router/useAuth.js';  // --> Only for Basic Auth
import { auth, db } from '../config/firebaseConfig.js';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from 'vue-router';
import DOMPurify from 'dompurify';

const router = useRouter();
// const { register } = useAuth();  // --> Only for Basic Auth

// PrimeVue
// import DataTable from 'primevue/datatable';
// import Column from 'primevue/column';

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

// Form Submission
const submitForm = async () => {
  // Validate form fields
  validateFirstName(true);
  validateLastName(true);  
  validateGender();
  validateEmail(true);
  validatePassword(true);
  validateConfirmPassword();
  validateDob(true);
  validateReason();
  
  // Check if there are any validation errors
  if (!Object.values(errors.value).some(x => x !== null)) {
    try {
      // Sanitize input fields
      const sanitizedData = {
        firstName: DOMPurify.sanitize(formData.value.firstName),
        lastName: DOMPurify.sanitize(formData.value.lastName),
        gender: DOMPurify.sanitize(formData.value.gender),
        email: DOMPurify.sanitize(formData.value.email),
        phone: DOMPurify.sanitize(formData.value.phone),
        password: formData.value.password,  // Passwords should not be sanitized to maintain security of the hashing
        dob: new Date(formData.value.dob),  // Date objects should be parsed
        address: DOMPurify.sanitize(formData.value.address),
        reason: DOMPurify.sanitize(formData.value.reason)
      };

      // // ------- Only for Basic Auth -------
      // // Call register() from useAuth
      // register(formData.value);
      // // ------- Only for Basic Auth -------

      // Register the user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        sanitizedData.email,
        sanitizedData.password
      );
      const user = userCredential.user;
      const dobAsDate = new Date(formData.value.dob);    // convert dob to a Date object

      console.log("User registered with Firebase. UID:", user.uid);

      // Store user data in Firestore
      // await setDoc(doc(db, "users", formData.value.email), {  // --> Only for Basic Auth
      await setDoc(doc(db, "users", user.uid), {
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        gender: sanitizedData.gender,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        dob: dobAsDate,
        address: sanitizedData.address,
        reason: sanitizedData.reason,
        userType: "general"
      });

      alert('User registered successfully!');
      clearForm();
      router.push('/login');
    } catch (error) {
      console.error("Error registering user: ", error);
      alert('Failed to register. Please try again.');
    }
  } else {
    console.log("Form has validation errors: ", errors.value);
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
  Object.keys(errors.value).forEach(key => errors.value[key] = null);
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
  if (!formData.value.dob) {
    errors.value.dob = "Date of Birth is required.";
  } else {
    errors.value.dob = null;
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

<style scoped>
button.btn-primary {
  color: white;
  border-radius: 60px;
  background-color: #e96951;
  height: 45px; 
  width: 210px; 
  font-weight: bold;
}

button.btn-primary:hover {
  background-color: #e5533d;
  border-color: #e5533d;
}

button.btn-secondary {
  color: white;
  border-radius: 60px;
  height: 45px; 
  width: 210px; 
  font-weight: bold;
}

.custom-link {
  color: #e5533d;
  font-weight: bold;
}
</style>