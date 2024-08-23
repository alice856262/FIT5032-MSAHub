<template>
  <footer>
    <div class="row justify-content-center align-items-center" style="background-color: #ffcf78; padding: 50px;">
      <div class="row mb-3">
        <p>© 2024 MSA Hub. All Rights Reserved.</p>
      </div>
      <div class="row mb-3">
        <router-link to="/about">About Us</router-link>
        <router-link to="/contact">Contact Us</router-link>
        <router-link to="/privacy">Privacy Policy</router-link>
        <router-link to="/terms">Terms of Service</router-link>
      </div>
      <div>
        Icons made by 
        <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> 
        from 
        <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
      </div>
    </div>  
  </footer>
</template>
  
<script>
  export default {
    name: "Footer",
  };
</script>
  