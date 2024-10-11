<template>
  <main class="container mt-3 mb-5">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-10 col-md-10 col-lg-10 col-xl-10">
        <h1>About MSA Hub</h1>
        <p>
          Multiple System Atrophy (MSA) is a rare neurodegenerative disorder characterized by a combination of symptoms that affect both the autonomic nervous system and movement. 
          It is a progressive condition, meaning it worsens over time. MSA can lead to symptoms such as muscle rigidity, tremors, and impaired coordination. 
          While the exact cause of MSA is unknown, research is ongoing to better understand this disease and find effective treatments.
        </p>
        <h2>Our Mission</h2>
        <p>
          Our mission is to provide support, resources, and advocacy for individuals affected by MSA. We strive to raise awareness about this rare disease and promote research to improve treatment and, ultimately, find a cure.
        </p>
        <h2>What We Offer</h2>
        <ul>
          <li>Comprehensive information about MSA and its symptoms.</li>
          <li>Resources for patients, caregivers, and healthcare professionals.</li>
          <li>Support groups and community connections.</li>
          <li>Up-to-date news on research and clinical trials.</li>
        </ul>
        <h2>Contact Us</h2>
        <p>
          If you have any questions or need support, feel free to contact us <router-link to="/contact-us" aria-label="Contact us page">here</router-link>.
        </p>
      </div>
    </div>
  </main>
</template>

<script setup>

</script>

<style scoped>
.container {
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h1, h2 {
  color: #333;
  outline: none;
}

h1 {
  margin-bottom: 20px;
}

h2 {
  margin-top: 30px;
}

p, ul {
  color: #666;
  font-size: 1.125rem;
  line-height: 1.6;
}

a {
  color: #e5533d;
  text-decoration: none;
}

a:hover, a:focus {
  text-decoration: underline;
}

@media (max-width: 575px) {
  .container {
    padding: 15px;
  }

  p, ul {
    font-size: 1rem;
  }
}

@media (min-width: 576px) and (max-width: 768px) {
  .container {
    padding: 20px;
  }

  p, ul {
    font-size: 1.125rem;
  }
}

@media (min-width: 992px) and (max-width: 1200px) {
  .container {
    padding: 25px;
  }
}

@media (min-width: 1400px) {
  .container {
    padding: 40px;
  }
}
</style>
