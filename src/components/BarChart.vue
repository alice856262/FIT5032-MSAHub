<template>
  <div>
    <Bar v-if="chartData" :data="chartData" :options="options" />
  </div>
</template>
  
<script>
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
  
// Register chart components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: 'BarChart',
  components: {
    Bar,
  },
  props: {
    chartData: {
      type: Object,
      required: true,
      default: () => ({
        labels: [],
        datasets: [],
      }),
    },
  },
  data() {
    return {
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };
  },
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
}
</style>