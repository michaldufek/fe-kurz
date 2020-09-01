<template>
  <card type="chart">
    <audio id="connectionLost" src="media/connectionLost.mp3" preload="auto"></audio>
    <div class="card-header">
      <h5 class="card-title" style="float: right;"><i class="tim-icons icon-heart-2" :class="{ 'text-success': live }" style="color:red"></i>  {{ updateTs | chartUpdateTsText(loading) }}</h5>
    </div>
    <br/>
    <div class="chart-area">
      <section v-if="noData" style="text-align: center">
        <p style="padding-top: 50px">{{ $t('noData') }}</p>
      </section>
      <section v-else-if="isError" style="text-align: center">
        <p style="padding-top: 50px">{{ $t('errors.dataError') }}</p>
      </section>
      <section v-else>
        <DualRingLoader v-if="loading" :color="'#54f1d2'" style="width: 80px; height: 80px; position: absolute; top: 40%; left: 45%;" />
        <Ohlc v-if="type === $t('research.patternLab.chartTypes')[1]"
              :chart-data="datacollection" 
              :options="options"/>
        <Candlestick v-else
              :chart-data="datacollection" 
              :options="options"/>
      </section>
    </div>
  </card>
</template>
<script>
import DualRingLoader from '@bit/joshk.vue-spinners-css.dual-ring-loader';
import Ohlc from '@/custom/components/Charts/Ohlc';
import Candlestick from '@/custom/components/Charts/Candlestick';

import config from '@/config';
import constants from '@/custom/assets/js/constants';
import helper from '@/custom/assets/js/helper';


export default {
  name: "ohlc-chart",
  components: {
    DualRingLoader,
    Ohlc,
    Candlestick
  },

  props: {
    title: {
      type: String,
      description: "Chart title"
    },
    apiUrl: {
      type: String,
      description: "URL to API data source"
    },
    type: {
      type: String,
      description: "Type of chart - OHLC or Candlestick"
    },
    highlights: {
      type: Array,
      default: () => {
        return [{ 
          points: [], 
          color: config.colors.primary 
        }]
      },
      description: "Points that should be highlighted with big triangle of defined color"
    }
  },

  data() {
    return {
      updateTs: null,
      live: false,
      error: false,
      loading: false,

      // chart
      datacollection: {},
      options: {
        scales: {
          xAxes: [{
            ticks: {
              autoSkip: true,
            },
          }],
        },
      }
    }
  },

  computed: {
    noData() {
      return !this.loading && (!('datasets' in this.datacollection) || !this.datacollection.datasets.length)
    },
    isError() {
      return this.error
    }
  },

  methods: {
    initData() {
      this.loadData();
        
      setInterval(() => { 
        this.loadData();
      }, constants.intervals.dataReload );
    },

    loadData() {
      this.loading = true
      this.error = false
      
      this.$http
      .get(this.apiUrl)
      .then(response => {
        this.fillChartData(response.data)
        this.updateTs = new Date(Number(Math.max(...Object.keys(response.data.Open))))
        this.live = !response.data.WARNING
      })
      .catch(error => {
        console.log(error);
        this.error = true

        if (error.message === constants.strings.errors.networkError) {
          helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.$t('notifications.beConnectionLost') + '(' + this.title + ' ' + this.$t('chart') + ')')
        }
      })
      .finally(() => {
        this.loading = false

        if (!this.live && !this.error) {
          helper.notifyAudio(this, document.getElementById('connectionLost'), 'warning', this.$t('notifications.brokerConnectionLost') + '(' + this.title + ' ' + this.$t('chart') + ')')
        }
      });
    },

    fillChartData(data) {
      let newData = []

      for (const [key, val] of Object.entries(data.Open)) {
        newData.push({
          t: new Date(Number(key)),
          o: val,
          h: data.High[key],
          l: data.Low[key],
          c: data.Close[key]
        })
      }

      // to-do: figure out how to use highlights with this type of chart (standard FancyChart way doesn't work - dataset highlights settings are ignored)

      this.datacollection = {
        datasets: [{
          label: this.title,
          data: newData         
        }],
      }
    }
  },

  mounted() {
    this.initData();
  }
};
</script>
<style>
</style>