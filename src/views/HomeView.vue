<template>
  <main>
    <section class="row justify-content-center align-items-center" style="background-color: #ffdb99; padding: 50px;">
      <div class="col-12 col-md-4 text-center text-md-start d-flex justify-content-center justify-content-md-start mb-4 mb-md-0">  
        <img src="@/assets/Home_1.png" alt="Illustration representing hope and support" class="picture">
      </div>
      <div class="col-md-8 col-sd-8 text-end d-flex flex-column align-items-end" style="padding-right: 30px;">
        <h1 class="display-4">MSA Hub</h1>
        <h2>Insights, Support & Hope</h2>
        <br>
        <p class="lead text-end">MSA Hub is commissioned to improve the lives of those affected by MSA - a rare, progressive neurodegenerative disorder.</p>
        <p class="lead text-end">Through MSA Hub, we provide comprehensive support to patients, caregivers, and healthcare professionals.</p>
        <div class="mb-4">
          <button class="btn btn-primary btn-lg" aria-label="Find more about MSA Hub" @click="goToAbout">Find More</button>
        </div>
      </div>
    </section>
    <section class="row justify-content-center align-items-center" style="padding-left: 50px; padding-right: 40px;">
      <div class="col-md-6 col-sd-6 text-start d-flex flex-column align-items-start" style="padding-right: 30px;">
        <p class="lead text-start">MSA Hub aims to impact the MSA community by improving access to treatments, research, and support, fostering knowledge exchange, and providing resources for managing MSA.</p>
        <p class="lead text-start">Living with MSA can be challenging for both patients and their families. It's essential to build a support network, including healthcare providers, therapists, and support groups.</p>
        <div class="mb-4">
          <button class="btn btn-primary-custom btn-lg" aria-label="Find more about MSA community impact" @click="goToResource">Find More</button>
        </div>
      </div>
      <div class="col-ld-2 col-md-3 text-center d-flex justify-content-center mb-4 mb-md-0" style="padding-right: 20px;">
        <img src="@/assets/Home_2.png" alt="Support team image" class="picture"> 
      </div>
      <div class="col-12 col-ld-4 col-md-3 text-center d-flex justify-content-center" style="padding-right: 20px;">  
        <img src="@/assets/Home_3.png" alt="Illustration showing MSA resources" class="picture">
      </div>
    </section>
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToAbout = () => {
  router.push('/about');
};

const goToResource = () => {
  router.push('/resource');
};
</script>

<style scoped>
.display-4 {
    font-size: 4.0rem;
    font-weight: bold;
    color: #333;
}

.picture {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #555;
  border-radius: 15px;
}

.btn-primary {
  background-color: #e5533d;
  border-color: #e5533d;
  font-weight: bold;
}

.btn-primary:hover {
  background-color: #c94431;
  border-color: #c94431;
}

button.btn-primary-custom {
    border-color: #e5533d;
    border-width: 3px;
    color: #555;
    font-weight: bold;
}
  
button.btn-primary-custom:hover {
    background-color: #e5533d;
    border-color: #e5533d;
    color: #f6f4f3;
    font-weight: bold;
}
</style>
