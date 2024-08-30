<template>
  <div id="app" style="margin-left: 10px; margin-right: 10px;">
    <header class="d-flex justify-content-between align-items-center py-3" style="margin-left: 35px;">
      <div class="d-flex align-items-center" style="width: 250px">
        <a href="/">
          <img src="./assets/MSA_Hub_logo.png" alt="MSA Hub" style="height: 50px;">
        </a>
      </div>
      <ul class="nav nav-pills me-3 flex-wrap" style="margin-right: 20px;">
        <li class="nav-item">
          <router-link to="/" class="nav-link custom-nav-link" active-class="active" aria-current="page">HOME</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/about" class="nav-link custom-nav-link" active-class="active" aria-current="page">ABOUT MSA</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/resource" class="nav-link custom-nav-link" active-class="active" aria-current="page">RESOURCE</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/community" class="nav-link custom-nav-link" active-class="active" aria-current="page">COMMUNITY</router-link>
        </li>
        <!-- Show CARING TOOL, PROFILE, DASHBOARD (admin only) and LOGOUT button if logged in -->
        <li class="nav-item" v-if="isAuthenticated">
          <router-link to="/tool" class="nav-link custom-nav-link" active-class="active" aria-current="page">CARING TOOL</router-link>
        </li>
        <li class="nav-item" v-if="isAuthenticated">
          <router-link to="/profile" class="nav-link custom-nav-link" active-class="active" aria-current="page">PROFILE</router-link>
        </li>
        <!-- <li class="nav-item" v-if="userType === 'admin'"> --> 
        <li class="nav-item" v-if="userType === 'admin@msa.com'">  <!-- Only for Basic Auth -->
          <router-link to="/dashboard" class="nav-link custom-nav-link" active-class="active" aria-current="page">DASHBOARD</router-link>
        </li>
        <li class="nav-item" v-if="isAuthenticated">
          <a href="#" @click.prevent="logout" class="nav-link custom-nav-link">LOGOUT</a>
        </li>
        <!-- Show LOGIN and REGISTER buttons if not logged in -->
        <li class="nav-item" v-if="!isAuthenticated">
          <router-link to="/login" class="nav-link custom-nav-link" active-class="active">LOGIN</router-link>
        </li>
        <li class="nav-item" v-if="!isAuthenticated">
          <router-link to="/register" class="nav-link custom-nav-link" active-class="active">REGISTER</router-link>
        </li>
      </ul>
    </header>
    <div style="width: 100%; margin-left: 0px; margin-right: 0px;">
      <router-view></router-view>
    </div>  
    <Footer />
  </div>
</template>

<script setup>
import { useAuth } from './router/useAuth.js';
import Footer from './components/Footer.vue';

const { isAuthenticated, userType, logout } = useAuth();
</script>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

.nav-pills {
  flex-wrap: wrap;
  padding: 0;
  list-style: none;
}

.custom-nav-link {
  color: #333;
  padding: 8px 16px;
  border-radius: 20px;
  text-decoration: none;
  font-weight: bold;
}

.custom-nav-link:hover {
  background-color: #e96951;
  border-color: #e96951;
  color: white;
}

.custom-nav-link.active {
  background-color: #e5533d; /* Optional: Differentiate the active state */
}

@media (max-width: 575px) {
  header {
    flex-direction: column;
    align-items: center;
  }
  .nav-pills {
    flex-direction: column;
    text-align: center;
  }
  .nav-item {
    margin-right: 5px; 
  }
}

@media (min-width: 576px) and (max-width: 768px) {
  .nav-pills {
    justify-content: center;
  }
  .nav-link {
    padding: 5px 20px;
  }
  .nav-item {
    margin-right: 5px; 
  }
}

@media (min-width: 768px) and (max-width: 1200px) {
  .nav-pills {
    justify-content: right;
  }
  .nav-link {
    padding: 5px 20px;
  }
  .nav-item {
    margin-right: 5px; 
  }
}

@media (min-width: 1200px) {
  .nav-pills {
    justify-content: right;
  }
  .nav-link {
    padding: 10px 30px;
  }
  .nav-item {
    margin-right: 10px;
  }
}
</style>
