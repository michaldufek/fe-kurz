<template>
  <div class="row">
    <!-- <card class="card"> to-do: must be in one card --> 
      <div class="flex-stretch col-xl-4 col-12">
        <fancy-card :title="$t('research.stockPickingLab.stock').toLowerCase()"
                    :fullTitle="rank + '. ' + symbol + (name ? ' (' + name + ')' : '')"
                    :showTitle="true"
                    :watchable="true"
                    :items="[ $t('cagr'), $t('sharpeRatio'), $t('stdDev'), $t('recoveryDDtime'), $t('maxDD'), $t('score') ]"
                    :values="stats"                    
                    :titles="$t('terms.perfStats')">
        </fancy-card>
      </div>

      <div class="col-xl-8 col-12">
        <fancy-chart :title="$t('sidebar.stockPickingLab') + ' - ' + symbol"
                     :axesLabels="[ $t('research.stockPickingLab.xLabel'), $t('research.stockPickingLab.yLabel') ]"
                     :apiUrls="chartApiUrl">
        </fancy-chart>
      </div>      
     <!-- </card> -->
  </div>
</template>
<script>
import FancyCard from '@/custom/components/Cards/FancyCard.vue';
import FancyChart from '@/custom/components/Charts/FancyChart';
import constants from '@/custom/assets/js/constants';

export default {
  name: "stock-card",
  components: {
    FancyCard,
    FancyChart
  },

  props: {
    symbol: {
      type: String,
      description: "Stock symbol"
    },
    name: {
      type: String,
      description: "Stock name"
    },
    rank: {
      type: Number,
      description: "Rank of the stock"
    },
    stats: {
      type: Array,
      default: () => [],
      description: "Statistics data in same shape and order as items"
    }
  },

  computed: {
    chartApiUrl() {
      return [ constants.urls.tickerSP.stock + this.symbol ]
    }
  }
};
</script>
<style>
</style>