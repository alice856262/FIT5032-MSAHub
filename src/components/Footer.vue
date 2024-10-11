<template>
  <footer>
    <div class="row footer-container d-flex justify-content-center justify-content-md-start mb-md-0">
      
      <!-- Navigation Links -->
      <div class="col-md-6 col-sd-6">
        <div class="footer-column mt-3 mb-3">
          <router-link to="/about" aria-label="Learn more about MSA Hub">About Us</router-link>
          <router-link to="/resource" aria-label="Read about MSA related articles">MSA Resource</router-link>
          <router-link to="/community" aria-label="Join in community forum">MSA Community</router-link>
          <router-link to="/contact-us" aria-label="Contact us at MSA Hub">Contact Us</router-link>
        </div>
        <!-- Icon Attribution -->
        <div>
          <p>Icons made by 
            <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons" target="_blank">Smashicons</a> 
            from 
            <a href="https://www.flaticon.com/" title="Flaticon" target="_blank">www.flaticon.com</a>
          </p>
        </div>
      </div>

      <!-- MSA Hub Information -->
      <div class="col-md-6 col-sd-6">
        <h3>MSA Hub</h3>
        <p>Phone: +613 1234 5678</p>
        <p>Address: 123 Health St., Clayton, VIC, 3168</p>
        <p>© 2024 MSA Hub. All Rights Reserved.</p>
      </div>
      
      
    </div>
  </footer>
</template>
  
<script>
export default {
  name: "Footer",
};
</script>

<style scoped>
.footer-container {
  flex-direction: row;
  align-items: center;
  background-color: #ffdb99;
  padding: 40px;
  color: #333;
}

.footer-column {
  display: flex;
  flex-direction: column;
  font-size: 1.125rem;
  gap: 10px;
}

a {
  color: #e5533d;
  font-weight: bold;
  text-decoration: none;
  margin: 0 10px;
}

a:hover {
  text-decoration: underline;
}
</style>
