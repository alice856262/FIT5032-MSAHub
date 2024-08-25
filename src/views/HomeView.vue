<template>
  <div class="row justify-content-center align-items-center" style="background-color: #ffcf78; padding: 50px;">
    <div class="col-md-4 col-sd-4 text-start d-flex justify-content-start" style="padding-left: 20px;">
      <div class="photo-placeholder" style="background-color: #f6f4f3;">Photo</div>
    </div>
    <div class="col-md-8 col-sd-8 text-end d-flex flex-column align-items-end" style="padding-right: 30px;">
      <h1 class="display-4">MSA Hub</h1>
      <h1>Insights, Support & Hope</h1>
      <br>
      <p class="lead text-end">MSA Hub is commissioned to improve the lives of those affected by MSA - a rare, progressive neurodegenerative disorder.</p>
      <p class="lead text-end">Through MSA Hub, we provide comprehensive support to patients, caregivers, and healthcare professionals.</p>
      <div class="mb-4">
        <button class="btn btn-primary btn-lg">Find More</button>
      </div>
    </div>
  </div>
  <div class="row justify-content-center align-items-center">
    <div class="col-md-6 col-sd-6 text-start d-flex flex-column align-items-start" style="padding-left: 80px;">
      <p class="lead text-start">MSA Hub aims to impact the MSA community by improving access to treatments, research, and support, fostering knowledge exchange, and providing resources for managing MSA.</p>
      <p class="lead text-start">Living with MSA can be challenging for both patients and their families. It's essential to build a support network, including healthcare providers, therapists, and support groups.</p>
      <div class="mb-4">
        <button class="btn btn-primary-custom btn-lg">Find More</button>
      </div>
    </div>
    <div class="col-md-2 col-sd-2 text-start d-flex justify-content-start" style="padding-right: 10px;">
      <div class="photo-placeholder" style="background-color: #ffcf78;">Photo</div>
    </div>
    <div class="col-md-4 col-sd-4 text-start d-flex justify-content-start" style="padding-right: 80px;">
      <div class="photo-placeholder" style="background-color: #ffcf78;">Photo</div>
    </div>
    
  </div>
</template>

<script setup>

</script>

<style scoped>
.display-4 {
    font-size: 4.5rem;
    font-weight: bold;
    color: #333;
}

.photo-placeholder {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #555;
  border-radius: 15px;
}

button.btn-primary-custom {
    border-color: #e5533d;
    border-width: 3px;
    color: #555;
}
  
button.btn-primary-custom:hover {
    background-color: #e5533d;
    border-color: #e5533d;
    color: #f6f4f3;
}
</style>