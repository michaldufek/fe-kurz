<template>
    <div>
        <!-- dropdowns -->
        <div style="position: relative; left: 10px; z-index: 1">
          <base-dropdown class="dd" 
                         menu-classes="dropdown-black" 
                         title-classes="btn btn-secondary"
                         :title="selectedAsset ? selectedAsset.symbol : null"
                         style="width: 17%">
            <ul style="list-style-type: none;">
              <li v-for="asset in assetsPatterns.checkedAssets.filter(a => a.id !== selectedAsset.id)" :key="asset.id">            
                <a class="dropdown-item" 
                   @click="selectAsset(asset)" 
                   href="#">
                  {{ asset.symbol }}
                </a>
              </li>
            </ul>
          </base-dropdown>
        </div>

        <div style="position: relative; z-index: 1">
          <base-dropdown class="dd" 
                         menu-classes="dropdown-black" 
                         title-classes="btn btn-secondary"
                         :title="selectedBacktest ? selectedBacktest.name : null"
                         style="width: 20%">
            <ul style="list-style-type: none;">
              <li v-for="bt in btNamesFiltered" :key="bt.id">            
                <a class="dropdown-item" 
                   @click="selectBacktest(bt)" 
                   href="#">
                  {{ bt.name }}
                </a>
              </li>
            </ul>
          </base-dropdown>          
        </div>

        <div style="position: relative; z-index: 1">
          <base-dropdown class="dd" 
                         menu-classes="dropdown-black" 
                         title-classes="btn btn-secondary"
                         :title="chartType">
            <ul style="list-style-type: none;">
              <li v-for="(chartType, key) in $t('research.patternLab.chartTypes').filter(el => el !== chartType)" :key="key">            
                <a class="dropdown-item" 
                   @click="selectChartType(chartType)" 
                   href="#">
                  {{ chartType }}
                </a>
              </li>
            </ul>
          </base-dropdown>          
        </div>

        <!-- trades chart -->
        <fancy-chart v-if="chartType === $t('research.patternLab.chartTypes')[0]"
                    :title="$t('sidebar.patternLab') + ' ' + this.$t('research.patternLab.backtestPatterns.title') + ' ' + $t(storeKey + '.title')"
                    :legend="legend"
                    :apiUrls="chartUrl ? [ chartUrl ] : []"
                    style="height: 100%"
                    :highlights="highlights"
                    :responsive="true"                     
                    :key="historyChartKey" />
        <ohlc-chart v-else 
                    :title="ohlcChartTitle"
                    :apiUrl="chartUrl" 
                    :type="chartType"
                    :highlights="highlights"
                    style="height: 830px" 
                    :key="historyChartKey" />

        <!-- cumulated profit chart -->
        <fancy-chart :title="$t('sidebar.patternLab') + ' ' + this.$t('research.patternLab.backtestPatterns.title') + ' ' + $t(storeKey + '.title') + ' ' + $t(storeKey + '.cumulatedProfit')"
                     :apiUrls="statsChartUrl"
                     :dataCreator="profitDataCreator"
                     :noDataText="noDataText"
                     :axesLabels="[ $t(storeKey + '.xLabel'), $t(storeKey + '.cumulatedProfit') ]"
                     :responsive="true"                     
                     :key="statsChartKey" />

        <!-- drawdown chart -->
        <fancy-chart :title="$t('sidebar.patternLab') + ' ' + this.$t('research.patternLab.backtestPatterns.title') + ' ' + $t(storeKey + '.title') + ' ' + $t(storeKey + '.drawdown')"
                     :apiUrls="statsChartUrl"    
                     :dataCreator="drawdownDataCreator"
                     :noDataText="noDataText"
                     :axesLabels="[ $t(storeKey + '.xLabel'), $t(storeKey + '.drawdown') ]"
                     :fill="true"
                     :responsive="true"                    
                     :key="statsChartKey" />
    </div>    
</template>
<script>
import FancyChart from '@/custom/components/Charts/FancyChart';
import OhlcChart from '@/custom/components/Charts/OhlcChart';

import constants from '@/custom/assets/js/constants';
import helper from '@/custom/assets/js/helper';


export default {
    components: {
        FancyChart,
        OhlcChart
    },

    data() {
        return {
            storeKey: constants.translationKeys.chart,

            // assets-patterns-picker
            assetsPatterns: {
              range:{
                from: null,
                to: null
              },
              checkedAssets: [],
              checkedPatterns: []
            },

            loading: true,
            noDataText: '',

            // dropdowns
            backtestsNames: [],
            selectedBacktest: null,
            selectedAsset: null,            
            chartType: null,

            // chart highlights
            tradesEntries: [],
            tradesStopLosses: [],
            tradesExits: [],

            // chart
            chartUrl: null,
            historyChartKey: 0,
            statsChartKey: 0
        }
    },

    computed: {
      ohlcChartTitle() {
          return this.selectedAsset ? this.selectedAsset.symbol : ''
      },
      btNamesFiltered() {
        return this.selectedBacktest ? this.backtestsNames.filter(bt => bt.id !== this.selectedBacktest.id) : this.backtestsNames
      },

      statsChartUrl() {
        return !this.loading ? [ constants.urls.patternLab.backtestPatterns.results ] : []
      },

      legend() {
        return this.tradesEntries.length || this.tradesStopLosses.length || this.tradesExits.length ? `<span style="color:${constants.colors.tradeEntry}">&#9650;</span> ${this.$t(this.storeKey + '.tradeEntry')}<br/><span style="color:${constants.colors.tradeStopLoss}">&#9650;</span> ${this.$t(this.storeKey + '.tradeStopLoss')}<br/><span style="color:${constants.colors.tradeExit}">&#9650;</span> ${this.$t(this.storeKey + '.tradeExit')}` : null
      },

      highlights() {
        return [{
          points: this.tradesEntries,
          color: constants.colors.tradeEntry 
        }, 
        { 
          points: this.tradesStopLosses, 
          color: constants.colors.tradeStopLoss 
        }, 
        { 
          points: this.tradesExits, 
          color: constants.colors.tradeExit 
        }]
      }
    },
    
    methods: {
        initData() {
            let data = helper.getAssetsPatternsPickerData(this.$store)
            if (data) {
              this.assetsPatterns = data
            }

            ({ backtestsNames:this.backtestsNames, loading:this.loading, selectedBacktest:this.selectedBacktest, updateKey:this.statsChartKey } = helper.getBacktestsNames(this.$store, this.storeKey, this.statsChartKey))
            this.initDropDowns()
            this.loadChart()
        },        

        initDropDowns() {
            let data = this.$store.getItem(this.storeKey)
            if (data) {
              ({ selectedAsset:this.selectedAsset } = data)
            }
            this.chartType = this.$t('research.patternLab.chartTypes')[data ? data.chartType : 0]

            if (!this.selectedAsset && this.assetsPatterns.checkedAssets.length) {
                this.selectedAsset = this.assetsPatterns.checkedAssets[0]
            }
        },

        loadChart(reloadHistory=true) {
            this.chartUrl = null
            if (this.selectedAsset) {
                this.chartUrl = helper.getPatternLabChartUrl(this.selectedAsset, this.assetsPatterns.timeframe, this.assetsPatterns.range)
            }

            // force reload of chart components 
            if (reloadHistory) {
              this.historyChartKey++
            }
        },

        selectAsset(asset) {
            this.selectedAsset = asset
            this.loadChart()
        },
        selectBacktest(bt) {
            this.selectedBacktest = bt
            this.statsChartKey++
            this.loadChart()
        },
        selectChartType(chartType) {
            this.chartType = chartType
            this.loadChart()
        },

        profitDataCreator(responseData) {
          let data = responseData.filter(d => d.id === this.selectedBacktest.id)
          if (data.length) {
            let datum = data[0]

            this.noDataText = null
            this.tradesEntries = []
            this.tradesStopLosses = []
            this.tradesExits = []
            let base = helper.getBacktestPatternsTableBase(datum, this.$store, this.$t(constants.translationKeys.patterns + '.columns'))
            if (datum.error) {              
              this.noDataText = `${this.$t(this.storeKey + '.problemsPrefix')} '${base.name}' ${this.$t(this.storeKey + '.problemsSuffix')} ${datum.msg}`
            } else {
              if (base.symbol === this.selectedAsset.symbol) {
                this.tradesEntries = Object.values(datum.output.trades.start)
                this.tradesStopLosses = datum.stop_loss_unit === constants.defaultUnit ? [ datum.stop_loss_value ] : []   // temporary until BE doesn't return stop_loss_value for % !!!
                this.tradesExits = Object.values(datum.output.trades.finish)
              }

              return {
                time: Object.values(datum.output.trades.finish),
                equity: Object.values(datum.output.stats.pnl_cum)
              }
            }
          }
          // otherwise let exception happen, ie. it's server error
        },
        drawdownDataCreator(responseData) {
          let data = responseData.filter(d => d.id === this.selectedBacktest.id)
          if (data.length) {
            let datum = data[0]

            this.noDataText = null
            if (datum.error) {
              let btName = helper.getBacktestPatternsTableBase(datum, this.$store, this.$t(constants.translationKeys.patterns + '.columns')).name
              this.noDataText = `${this.$t(this.storeKey + '.problemsPrefix')} '${btName}' ${this.$t(this.storeKey + '.problemsSuffix')} ${datum.msg}`
            } else {
              return {
                time: Object.values(datum.output.trades.finish),
                equity: Object.values(datum.output.stats["Drawdown Underwater plot"])
              }
            }
          }
          // otherwise let exception happen, ie. it's server error
        }
    },

    watch: {
      selectedAsset(val) {        
        helper.updateStore(this.$store, 'selectedAsset', val, this.storeKey)
      },
      selectedBacktest(val) {        
        helper.updateStore(this.$store, 'selectedBacktest', val, this.storeKey)
      },
      chartType(val) {        
        helper.updateStore(this.$store, 'chartType', this.$t('research.patternLab.chartTypes').indexOf(val), this.storeKey)
      }
    },

    mounted() {
        this.initData()
    }
}
</script>
<style scoped>

</style>