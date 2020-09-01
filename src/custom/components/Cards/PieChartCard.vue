<template>
  <card type="chart" style="margin-bottom: 0px;">
    <audio id="connectionLost" src="media/connectionLost.mp3" preload="auto"></audio>
    <div class="chart-area" style="margin-top: 50px; height: 100%">
      <section v-if="noData" style="text-align: center">
        <p style="padding-top: 50px">{{ $t('noData') }}</p>
      </section>
      <section v-else>
        <pie-chart :chart-data="chartData"
                   :options="options"/>
      </section>
    </div>
  </card>
</template>
<script>
import PieChart from '@/custom/components/Charts/PieChart';

export default {
  name: "pie-chart-card",
  components: {
    PieChart
  },

  props: {
    chartData: {
      type: Object,
      default: () => {
        return {
          datasets: [],
          labels: []
        }
      },
      description: 'Data for pie chart'
    },
    options: {
      type: Object,
      default: () => {
        return {
          responsive: true
        }
      },
      description: 'Chart settings'
    }
  },

  computed: {
    noData() {
      return !this.chartData || !('datasets' in this.chartData) || !(this.chartData.datasets.length)
    }
  }
};
</script>
<style>
</style>