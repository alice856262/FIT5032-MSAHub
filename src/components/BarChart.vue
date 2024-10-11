<template>
  <div class="chart-container" role="img" aria-label="Bar chart representing the provided dataset">
    <Bar v-if="chartData" :data="chartData" :options="options" />
    <p class="sr-only">This bar chart shows {{ chartSummary }}.</p>
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
  computed: {
    chartSummary() {
      // Provide a textual summary of the data based on chartData
      const dataPoints = this.chartData.datasets[0]?.data || [];
      const labels = this.chartData.labels || [];
      return labels
        .map((label, index) => `${label} with value ${dataPoints[index]}`)
        .join(', ');
    },
  },
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>