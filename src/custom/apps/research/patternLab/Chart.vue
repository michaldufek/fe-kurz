<template>
  <div>
    <div class="row ">
      <div class="col-xl-2 col-md-6 col-12 killflex container">
        <assets-patterns-picker :title="$t('research.patternLab.chart.title')"
                                :oneAssetLimit="true"
                                :btnText="$t('research.patternLab.chart.addChart')" 
                                @btnClicked="addChart" 
                                @timeframeChanged="timeframeChanged" />      
      </div>

      <!-- chart -->
      <div class="col-xl-10 col-md-6 col-12">
        <!-- chart settings -->
        <div style="position: relative; z-index: 1">
          <base-dropdown class="dd col-xl-2" 
                         menu-classes="dropdown-black" 
                         title-classes="btn btn-secondary"
                         :title="chartType">
            <ul style="list-style-type: none;">
              <li v-for="chartType in $t('research.patternLab.chartTypes').filter(el => el !== chartType)">            
                <a class="dropdown-item" 
                   @click="selectChartType(chartType)" 
                   href="#">
                  {{ chartType }}
                </a>
              </li>
            </ul>
          </base-dropdown>          
        </div>

        <fancy-chart v-if="chartType === $t('research.patternLab.chartTypes')[0]"
                     :title="$t('sidebar.patternLab') + ' ' + $t('research.patternLab.chart.title')"
                     :apiUrls="chartUrl ? [ chartUrl ] : []"
                      :highlights="highlights"
                     :dataFields="[ 'Close', 'Volume' ]"
                     :responsive="true"
                     style="height: 100%"
                     :key="chartKey" />
        <ohlc-chart v-else 
                    :title="ohlcChartTitle"
                    :apiUrl="chartUrl" 
                    :type="chartType"
                    style="height: 830px" 
                    :key="chartKey" />
      </div>

      <!-- patterns history -->
      </div>
      <div class="row">
      <div class="col-12">
        <fancy-table :title="$t('research.patternLab.chart.patternsHistory.title')"
                     noDataText="No patterns detected."
                     :apiUrls="patternsHistoryUrl"
                     :columns="$t('research.patternLab.chart.patternsHistory.columns')"
                     :rowsCreator="rowsCreator"
                     :clickable="true"
                     @selected="selected"
                     :key="tableKey">
        </fancy-table>
      </div>
    </div>
  </div>
</template>
<script>
  import AssetsPatternsPicker from '@/custom/components/AssetsPatternsPicker'
  import FancyChart from '@/custom/components/Charts/FancyChart';
  import OhlcChart from '@/custom/components/Charts/OhlcChart';
  import FancyTable from '@/custom/components/Tables/FancyTable';  

  import constants from '@/custom/assets/js/constants';
  import helper from '@/custom/assets/js/helper';


  export default {
    components: {  
      AssetsPatternsPicker,
      FancyChart,
      OhlcChart,
      FancyTable
    },

    data() {
      // fixes x-axes label overlapping
      // https://www.chartjs.org/docs/latest/axes/cartesian/?h=autoskip
      return {
        storeKey: 'research.patternLab.chart',

        // assets-patterns-picker
        range: {
          from: null,
          to: null
        },
        timeframe: null,
        asset: null,
        patterns: [],

        // chart
        chartType: this.$t('research.patternLab.chartTypes')[0],
        chartUrl: null,
        chartKey: 0,        

        // patterns history
        patternsHistoryUrl: [],
        patternLabels: [],
        tableKey: 0
      }
    },

    computed: {
      ohlcChartTitle() {
        // title in form <asset> ([patterns]) - more than 3 patterns will be replaced by '...'
        if (this.asset) {
          const maxPatterns = 3
          let patterns = this.patterns.slice(0, maxPatterns).map(p => p.name)
          if (this.patterns.length > maxPatterns) {
            patterns = patterns.concat([ '...' ])
          }

          return this.asset.symbol + (patterns.length ? ' (' + patterns.join(', ') + ')' : '')
        }
      },

      highlights() {
        return [{
          points: this.patternLabels,
          color: constants.colors.tradeEntry 
        }]
      }
    },

    methods: {
      initData() {
        let data = this.$store.getItem(this.storeKey)
        if (data) {
          this.chartType = this.$t('research.patternLab.chartTypes')[data.chartType]
        }
        
        this.addChart()
      },

      // chart methods
      addChart() {
        let data = helper.getAssetsPatternsPickerData(this.$store)
        if (data) {
          ({ range:this.range, timeframe:this.timeframe, checkedAsset:this.asset, checkedPatterns:this.patterns } = data)
        }
        
        this.loadChart()

        this.patternsHistoryUrl = null
        if (this.patterns.length) {
          // load patterns history table
          this.patternsHistoryUrl = helper.getPatternLabHistoryUrl(this.asset ? [ this.asset ] : [], this.patterns, this.timeframe, this.range.from, this.range.to)     
        }
        this.patternLabels = []
        this.tableKey++ // force reload of fancy-table component
      },
      loadChart() {
        this.chartUrl = null
        if (this.asset) {
          this.chartUrl = helper.getPatternLabChartUrl(this.asset, this.timeframe, this.range) 
        }
        this.chartKey++ // force reload of fancy-chart component
      },      

      // emited events
      timeframeChanged() {
        let data = helper.getAssetsPatternsPickerData(this.$store)
        if (data) {
          ({ timeframe:this.timeframe } = data)
        }

        this.loadChart()
      },
      selected(rowIndex) {
        if (rowIndex > -1) {
          let data = this.$store.getItem(this.storeKey)
          let signalSet = null

          // patternsHistoryUrl and data (with rowsSignalIds) must exist if we managed to get here - no need to check
          this.$http
          .get(this.patternsHistoryUrl)
          .then(response => {
            let filtered = response.data.filter(datum => datum.id === data.rowsSignalIds[rowIndex])
            signalSet = filtered.length ? filtered[0].signal_set : null
          })
          .catch(error => {
            console.log(error)
            if (error.message === constants.strings.errors.networkError) {
              helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.$t('notifications.beConnectionLost') + '(' + this.$t('sidebar.patternLab') + ' ' + this.$t(this.storeKey + '.title') + ')')
            }
          })
          .finally(() => {
            if (signalSet) {
              this.patternLabels = signalSet.map(s => new Date(s.date).getTime())
              this.chartKey++
            } else {
              console.log(`${this.$t('serverIncontinency')}: Couldn't find selected signal set on server!`)
            }
          }) 
        } else {
          this.patternLabels = []
          this.chartKey++
        }       
      },
      
      selectChartType(chartType) {
        this.chartType = chartType
        this.loadChart()
      },

      // table methods (patterns history)
      rowsCreator(responseData) {
        let rows = []
        let rowsSignalIds = []

        responseData.forEach(data => {            
            let pattern = data.pattern.name
            
            data.signal_set.forEach(signal => {
              let row = []

              row.push(signal.date)
              row.push(pattern)
              row.push(helper.convertDirection(signal.direction))

              rows.push(row);
              rowsSignalIds.push(data.id)
            })
          });

        helper.updateStore(this.$store, 'rowsSignalIds', rowsSignalIds, this.storeKey)
        return rows
      }
    },

    watch: {
      chartType(val) {   
        helper.updateStore(this.$store, 'chartType', this.$t('research.patternLab.chartTypes').indexOf(val), this.storeKey)
      }
    },

    mounted() {
      this.initData()      
    }
  }  
</script>
<style>
</style>