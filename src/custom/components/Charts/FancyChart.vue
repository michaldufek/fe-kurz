<template>
  <card type="chart">
    <audio id="connectionLost" src="media/connectionLost.mp3" preload="auto"></audio>
    <div class="card-header">
      <h4 v-if="showTitle" slot="header" class="card-title" style="float: left; margin-bottom: 20px">{{title}}</h4>
      <span v-if="legend" v-html="legend" />
      <h5 v-if="!noData" class="card-title" style="float: right;"><i class="tim-icons icon-heart-2" :class="{ 'text-success': live }" style="color:red"></i>  {{ updateTs | chartUpdateTsText(loading) }}</h5>
    </div>
    <br/>
    <div class="chart-area" style="height: 425px">
      <section v-if="noData" style="text-align: center">
        <p style="padding-top: 50px">{{ noDataText ? noDataText : $t('noData') }}</p>
      </section>
      <section v-else-if="isError" style="text-align: center">
        <p style="padding-top: 50px">{{ $t('errors.dataError') }}</p>
      </section>
      <section v-else>
        <DualRingLoader v-if="loading" :color="'#54f1d2'" style="width: 80px; height: 80px; position: absolute; top: 40%; left: 45%;" />
        <line-chart v-if="responsive"
                    :chart-data="chartData"
                    :gradient-colors="bigLineChart.gradientColors"
                    :gradient-stops="bigLineChart.gradientStops"
                    :extra-options="extraOptions"
                    :height="null"
                    :width="null">
        <!-- height and width nulls is workaround of responsiveness library bug - will be fixed in vue-chartjs v4.0.0 (added as milestone) -->
        </line-chart>
        <line-chart v-else
                    :chart-data="chartData"
                    :gradient-colors="bigLineChart.gradientColors"
                    :gradient-stops="bigLineChart.gradientStops"
                    :extra-options="extraOptions">                    
        </line-chart>
      </section>
    </div>
  </card>
</template>
<script>
import LineChart from '@/components/Charts/LineChart';
import * as chartConfigs from '@/components/Charts/config';
import DualRingLoader from '@bit/joshk.vue-spinners-css.dual-ring-loader';

import config from '@/config';
import helper from '@/custom/assets/js/helper';
import constants from '@/custom/assets/js/constants';

const defaultPointRadius = 4
const highlightPointRadius = 10
const defaultPointStyle = 'circle'
const highlightPointStyle = 'triangle'
const defaultDatasets = {
  borderColor: config.colors.primary,
  borderWidth: 2,
  borderDash: [],
  borderDashOffset: 0.0,
  pointBackgroundColor: config.colors.primary,
  pointBorderColor: 'rgba(255,255,255,0)',
  pointHoverBackgroundColor: config.colors.primary,
  pointBorderWidth: 20,
  pointHoverRadius: 4,
  pointHoverBorderWidth: 15,
  pointRadius: [],
  pointStyle: []
}


export default {
  name: "fancy-chart",
  components: {
    LineChart,
    DualRingLoader
  },

  props: {
    title: {
      type: String,
      description: "Chart title"
    },
    legend: {
      type: String,
      description: "Chart legend"
    },  // workaround because trades legend cannot be done correctly in chart.js
    showTitle: {
      type: Boolean,
      description: "Whether to show chart title"
    },
    axesLabels: {
      type: Array,
      default: () => [],
      description: "Labels of chart axes"
    },
    apiUrls: {
      type: Array,
      default: () => [],
      description: "URLs to API data sources"
    },
    dataFields: {
      type: Array,
      default: () => {
        return [ 'Close' ]
      },
      description: "Response data fields to use for distinctive lines in chart"      
    },
    dataCreator: {
      type: Function,
      default: responseData => {
        return responseData
      },
      description: "How to create data (object of type { time: [Array], equity: [Array], WARNING: [String], report_timestamp: [Date] }) from response data"
    },
    noDataText: {
      type: String,
      description: "Text to show when no data"
    },
    fill: {
      type: Boolean,
      description: "Whether to fill area above/below line"
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
    },
    responsive: {
      type: Boolean,
      description: "Whether chart height should scale by parent height"
    }
  },

  data() {
    return {
      updateTs: null,
      live: false,
      error: false,
      loading: false,

      // chart
      bigLineChart: {
          gradientColors: config.colors.gradients.primaryGradient,
          gradientStops: [1, 0.4, 0],
      },
      chartData: {
        datasets: [{
          ...defaultDatasets,
          data: []
        }],
        labels: []      
      },
      chartMins: [],
      chartMaxes: []
    }
  },

  computed: {
    noData() {
      return !this.loading && (!this.chartData.datasets.length || !this.chartData.datasets[0].data.length)
    },
    isError() {
      return this.error
    },
    extraOptions() {
      let eOp = JSON.parse(JSON.stringify(chartConfigs.purpleChartOptions))   // deep clone

      let dfNr = 0
      this.dataFields.forEach(field => {        
        eOp.scales.yAxes[dfNr].id = field
        eOp.scales.yAxes[dfNr].position = dfNr === 0 ? 'left' : 'right'
        eOp.scales.yAxes[dfNr].ticks.suggestedMin = this.chartMins[dfNr]
        eOp.scales.yAxes[dfNr].ticks.suggestedMax = this.chartMaxes[dfNr]
      })

      eOp.scales.xAxes[0].scaleLabel = {
        display: this.axesLabels.length > 0,
        labelString: this.axesLabels[0]
      }
      eOp.scales.yAxes[0].scaleLabel = {
        display: this.axesLabels.length > 0,
        labelString: this.axesLabels[1]
      }

      return eOp
    }
  },

  methods: {
    initData() {
      this.loadData();
        
      setInterval(() => { 
        this.loadData();
      }, constants.intervals.dataReload );
    },

    nearestValue(label, labels, data) {
      // finds label's value or nearest left neighbour
      let val = 0
      let i = 0

      labels.forEach(oldLabel => {
        if (label === oldLabel) {
          // label is from this array
          val = data[i]
        } else if (label > oldLabel) {
          // we are in another array so get last known value
          if (i === labels.length - 1) {
            // at the end of array
            val = data[i]
          } else if (label < labels[i+1]) {            
            val = data[i]
          }
        }
        // otherwise iterate further
        i++
      })

      return val
    },

    loadData() {  
      let loadings = {    
        finished: 0,
        error: 0
      }
      if (this.apiUrls.length > 0) {
        this.loading = true
        this.error = false
      }

      this.apiUrls.forEach(apiUrl => {
        this.$http
        .get(apiUrl)
        .then(response => this.responseDataTransformer(response.data, loadings))
        .catch(error => {
          // console.log(error)
          if (++loadings.error === this.apiUrls.length) {
            this.error = true
          }

          if (error.message === constants.strings.errors.networkError) {
            helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.$t('notifications.beConnectionLost') + '(' + this.title + ' ' + this.$t('chart') + ')')
          }
        })
        .finally(() => {
          if (++loadings.finished === this.apiUrls.length) {
            this.loading = false

            if (!this.live && !this.error) {
              helper.notifyAudio(this, document.getElementById('connectionLost'), 'warning', this.$t('notifications.brokerConnectionLost') + '(' + this.title + ' ' + this.$t('chart') + ')')
            }
          }
        });
      })
    },
    responseDataTransformer(responseData, loadings=null) {
      if (!loadings || !loadings.finished) {
        let datasets = []
        this.dataFields.forEach(_ => datasets.push({
          ...defaultDatasets,
          data: []
        }))

        this.chartData = {
          datasets: datasets,
          labels: []
        } 
      }

      responseData = this.dataCreator(responseData)

      if (responseData && !responseData.time) {
        // data in ticker symbol format
        let times = []
        let equities = []
        let firstTime = true

        this.dataFields.forEach(field => {
          let fieldEquities = []

          if (field in responseData) {
            for (const [key, value] of Object.entries(responseData[field])) {
              if (firstTime) {
                // times are same for all price fields
                times.push(Number(key))
              }
              fieldEquities.push(value)
            }
          }

          equities.push(fieldEquities)
          firstTime = false
        })            

        var data = {
          time: times,
          equity: equities,
          WARNING: null,
          report_timestamp: helper.formatDateTime(times[times.length - 1])
        }
      } else {
        data = {
          time: responseData ? responseData.time : [],
          equity: responseData ? [ responseData.equity ] : [],
          WARNING: responseData ? responseData.WARNING : null,
          report_timestamp: responseData ? responseData.report_timestamp || helper.formatDateTime(responseData.time[responseData.time.length - 1]) : null
        }
      }

      this.createChartData(data)

      // if at least one source is live we are live
      this.live = this.live || !data.WARNING

      if (!this.updateTs) {
        this.updateTs = data.report_timestamp
      }
      // get last report's TimeStamp
      this.updateTs = [this.updateTs, data.report_timestamp].sort()[1] 
    },
    
    createChartData(data) {
      let datasets = []
      let datasetNr = 0

      let dataTimes = helper.formatDateTimes(data.time)
      let allLabels = this.chartData.labels.concat(dataTimes)
      
      data.equity.forEach(equity => {
        // add new dates and sort it
        let allData = []
        // aggregate values for all dates
        allLabels.forEach(label => {
          let aggValue = this.nearestValue(label, this.chartData.labels, this.chartData.datasets[datasetNr].data)
                          + this.nearestValue(label, dataTimes, equity)

          // add to final data array
          allData.push(aggValue)
        })

        if (Math.min(...allData) < this.chartMins[datasetNr]) {
          this.chartMins[datasetNr] = Math.min(...allData)
        }        
        if (Math.max(...allData) > this.chartMaxes[datasetNr]) {
          this.chartMaxes[datasetNr] = Math.max(...allData)
        }
        // to-do: fix extraOptions recomputation

        let datasetSetting = JSON.parse(JSON.stringify(defaultDatasets))    // deep clone
        let defColor = Object.values(config.colors)[datasetNr % Object.values(config.colors).length]      
        datasetSetting.borderColor = defColor

        if (this.highlights[0].points.length) {   // probably not possible to be only stop losses or trade exits
          datasetSetting.pointBackgroundColor = context => {  // https://www.chartjs.org/docs/latest/general/options.html#scriptable-options
            let label = new Date(allLabels[context.dataIndex]).getTime()            
            let color = defColor

            this.highlights.forEach(highlight => {
              if (highlight.points.includes(label)) {
                color = highlight.color
              }
            })
            return color
          }

          datasetSetting.pointRadius = context => {
            let label = new Date(allLabels[context.dataIndex]).getTime()
            let radius = defaultPointRadius

            this.highlights.forEach(highlight => {
              if (highlight.points.includes(label)) {
                radius = highlightPointRadius
              }
            })
            return radius
          }

          datasetSetting.pointStyle = context => {
            let label = new Date(allLabels[context.dataIndex]).getTime()
            let style = defaultPointStyle

            this.highlights.forEach(highlight => {
              if (highlight.points.includes(label)) {
                style = highlightPointStyle
              }
            })
            return style
          }
        }
        
        datasetSetting.pointHoverBackgroundColor = defColor
        
        let dataset = {
          ...datasetSetting,
          data: allData
        }
        if (this.fill) {
          dataset['backgroundColor'] = config.colors.primary
        }
        if (allData.length > 0 && this.dataFields.length > 1) {
          dataset.label = this.dataFields[datasetNr++]
        } 

        datasets.push(dataset)
      })    
      
      this.chartData = {
        datasets: datasets,
        labels: allLabels
      }       
    }
  },

  mounted() {
    this.dataFields.forEach(_ => {
      this.chartMins.push(Number.MAX_VALUE)
      this.chartMaxes.push(0)
    })    

    this.initData();
  }
};
</script>
<style>
</style>