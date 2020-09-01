<template>
  <div>
    <audio id="connectionLost" src="media/connectionLost.mp3" preload="auto"></audio>
    <div class="row">
      <div class="col-lg-3 col-md-12 container">
        <!-- statistics -->
        <fancy-card :title="$t(storeKey + '.title') + ' - ' + $t(storeKey + '.statistics.title')"
                    :fullTitle="$t(storeKey + '.statistics.title')"
                    :showTitle="true"
                    :items="$t(storeKey + '.statistics.items')"                    
                    :values="[ patternsStats.total, patternsStats.bullish, patternsStats.bearish ]"
                    style="margin-bottom: 0px;"
                    :key="cardKey">
        </fancy-card>

        <!-- pie charts -->
        <div style="position: relative; left: 10%; top: 50px; z-index: 1">
          <base-dropdown class="dd" 
                         menu-classes="dropdown-black" 
                         title-classes="btn btn-secondary"
                         :title="selectedAsset ? selectedAsset.symbol : null"
                         style="width: 20%">
            <ul style="list-style-type: none;">
              <li v-for="asset in (selectedAsset ? assets.filter(a => a.id !== selectedAsset.id) : assets)">            
                <a class="dropdown-item" 
                   @click="selectAsset(asset)" 
                   href="#">
                  {{ asset.symbol }}
                </a>
              </li>
            </ul>
          </base-dropdown>
        </div>
        <pie-chart-card :title="$t(storeKey + '.title') + ' - ' + $t(storeKey + '.patternsByStock')"
                        :chartData="chartData.patternsByAsset" />

        <div style="position: relative; left: 10%; top: 50px; z-index: 1">
          <base-dropdown class="dd" 
                         menu-classes="dropdown-black" 
                         title-classes="btn btn-secondary"
                         :title="selectedPattern ? selectedPattern.name : null"
                         style="width: 20%">
            <ul style="list-style-type: none;">
              <li v-for="pattern in (selectedPattern ? patterns.filter(p => p.id !== selectedPattern.id) : patterns)">            
                <a class="dropdown-item" 
                   @click="selectPattern(pattern)" 
                   href="#">
                  {{ pattern.name }}
                </a>
              </li>
            </ul>
          </base-dropdown>
        </div>
        <pie-chart-card :title="$t(storeKey + '.title') + ' - ' + $t(storeKey + '.stocksByPattern')"
                        :chartData="chartData.assetsByPattern" />
      </div>

      <!-- patterns table -->
      <div class="col-lg-9 col-md-12">
        <fancy-table :title="$t(storeKey + '.patternsTable.title')"
                     :showTitle="false"
                     :apiUrls="patternsUrl"
                     :columns="columns"
                     :rowsCreator="rowsCreator"
                     :sortable="true"
                     :filterable="true"
                     :key="tableKey"
                     @filtered="filtered">
        </fancy-table>
      </div>
    </div>
  </div>
</template>
<script>
  import FancyTable from '@/custom/components/Tables/FancyTable';  
  import FancyCard from '@/custom/components/Cards/FancyCard';  
  import OhlcChart from '@/custom/components/Charts/OhlcChart';
  import PieChartCard from '@/custom/components/Cards/PieChartCard'

  import constants from '@/custom/assets/js/constants';
  import helper from '@/custom/assets/js/helper';

  const sKey = 'research.patternLab.patternStatistics'


  export default {
    components: {  
      FancyTable,
      FancyCard,
      OhlcChart,
      PieChartCard
    },

    data() {
      return {
        storeKey: sKey,
        columns: this.$t(sKey + '.patternsTable.columns'),

        // statistics card
        patternsStats: {
          total: 0,
          bullish: 0,
          bearish: 0
        },
        cardKey: 0,

        // pie charts
        selectedAsset: null,
        assets: [],
        selectedPattern: null,
        patterns: [],
        timeframe: this.$t('research.patternLab.timeframes')[0],
        chartData: {
          // only chosen asset and pattern
          patternsByAsset: null,
          assetsByPattern: null 
        },
        // all assets and patterns
        patternsByAsset: {},
        assetsByPattern: {},
        // initPieChartsLock: false,

        // patterns table
        patternsUrl: [],
        tableKey: 0
      }
    },

    methods: {
      // initialization
      initData() {
        let data = helper.getAssetsPatternsPickerData(this.$store)
        if (data) {
          this.timeframe = data.timeframe
          this.patternsUrl = helper.getPatternLabHistoryUrl(data.selectedAssets, data.checkedPatterns, this.timeframe, data.range.from, data.range.to)
          this.tableKey++ // force reload of fancy-table component

          this.initPieCharts()
        }        
      },
      initPieCharts(column=null, filter=null) {
        if (this.patternsUrl) {
          let datas = []          
          this.$http
          .get(this.patternsUrl)
          .then(response => response.data.forEach(datum => {
              if (datum.count && (!column || (column && String(this.getColumnValue(column, datum)).toLowerCase().includes(filter.toLowerCase())))) {
                datas.push(datum)
              }
          }))
          .catch(error => {
            console.log(error)
            if (error.message === constants.strings.errors.networkError) {
              helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.$t('notifications.beConnectionLost') + '(' + this.$t('sidebar.patternLab') + ' ' + this.$t(this.storeKey + '.title') + ')')
            }
          })
          .finally(() => {
            this.assets = []
            this.patterns = []
            this.patternsStats = {  // doing it in finally because of emmited events based concurrency
              total: 0,
              bullish: 0,
              bearish: 0
            }
            this.patternsByAsset = {} 
            this.assetsByPattern = {} 

            datas.forEach(datum => {
              this.updateAssetsPatterns(datum)
              this.updatePatternsStats(this.getDirection(datum.signal_set), datum.count)
              this.updateChartDatas(datum)
            }) 
            this.initSelectedAssetPattern()     

            // creating pie charts data
            this.createChartDatas()
            // force reload of fancy-card component
            this.cardKey++
          })
        }
      },
      initSelectedAssetPattern() {
        // setting valid value of selected asset and pattern
        let data = this.$store.getItem(this.storeKey)

        this.selectedAsset = this.initSelectedItem(this.selectedAsset, this.assets)
        this.selectedPattern = this.initSelectedItem(this.selectedPattern ? this.selectedPattern : data ? data.selectedPattern : null, this.patterns)
      },
      initSelectedItem(selectedCandidate, items) {
        if (selectedCandidate && items.includes(selectedCandidate)) {
          return selectedCandidate
        } else if (items.length) {
          return items[0]
        }        
        return null
      },

      // emit event
      filtered(data) {
        this.initPieCharts(data.column, data.filter)
      },

      // table rows creator
      rowsCreator(responseData) { 
        let rows = []     

        responseData.forEach(data => {
          if (data.count) {
            let row = []
            this.createRow(data, row)
            rows.push(row)          
          }
        })

        return rows
      },
      createRow(data, row) {
        row.push(data.history.ticker.symbol) // Asset
        row.push(data.pattern.name) // Pattern
        row.push(data.count) // # of occurence          
        row.push(data.signal_set.length) // Pattern length

        let direction = this.getDirection(data.signal_set)       
        row.push(direction) // Direction

        row.push(data.count_mean ? 1 / data.count_mean : null) // Average frequency

        if (direction === constants.strings.bullish) {
          row.push(data.d1_bull_up + ' %')  // 1 day up_down
          row.push(data.d5_bull_up + ' %')  // 5 days up_down
          row.push(data.d10_bull_up + ' %') // 10 days up_down
        } else if (direction === constants.strings.bearish) {
          row.push(data.d1_bear_down + ' %')
          row.push(data.d5_bear_down + ' %')
          row.push(data.d10_bear_down + ' %')
        }
      },
      getDirection(signal_set) {
        let directionNr = 0
        signal_set.forEach(signal => directionNr += signal.direction) // to-do: how to calculate overall direction?

        return helper.convertDirection(directionNr)
      },

      getColumnValue(column, data) {
        let clNr = 0

        switch (column) {
          case this.columns[clNr++]:
            return data.history.ticker.symbol // Asset
          case this.columns[clNr++]:
            return data.pattern.name          // Pattern
          case this.columns[clNr++]:
            return data.count                 // # of occurence          
          case this.columns[clNr++]:
            return data.signal_set.length    // Pattern length
          case this.columns[clNr++]:
            let direction = this.getDirection(data.signal_set)       
            return direction                  // Direction
          case this.columns[clNr++]:
            return data.count_mean ? 1 / data.count_mean : null // Average frequency
          case this.columns[clNr++]:
            return direction === constants.strings.bullish ? data.d1_bull_up + ' %' : data.d1_bear_down + ' %'  // 1 day up_down
          case this.columns[clNr++]:
            return direction === constants.strings.bullish ? data.d5_bull_up + ' %' : data.d5_bear_down + ' %'  // 5 days up_down
          case this.columns[clNr++]:
            return direction === constants.strings.bullish ? data.d10_bull_up + ' %' : data.d10_bear_down + ' %'  // 10 days up_down
        }
      },

      // chart & stats methods
      updateAssetsPatterns(datum) {
        let asset = datum.history.ticker
        if (!this.assets.map(a => a.id).includes(asset.id)) {
          this.assets.push({ id: asset.id, symbol: asset.symbol })
        }

        let pattern = datum.pattern
        if (!this.patterns.map(p => p.id).includes(pattern.id)) {
          this.patterns.push(pattern)
        }
      },
      updatePatternsStats(direction, count) {
        this.patternsStats.total += count

        if (direction === constants.strings.bullish) {
          this.patternsStats.bullish += count
        } else if (direction === constants.strings.bearish) {
          this.patternsStats.bearish += count
        }
      },
      updateChartDatas(data) {
        if (!(data.history.ticker.symbol in this.patternsByAsset)) {
          this.patternsByAsset[data.history.ticker.symbol] = {}              
        }
        if (!(data.pattern.name in this.patternsByAsset[data.history.ticker.symbol])) {
          this.patternsByAsset[data.history.ticker.symbol][data.pattern.name] = 0              
        }
        this.patternsByAsset[data.history.ticker.symbol][data.pattern.name] += data.count

        if (!(data.pattern.name in this.assetsByPattern)) {
          this.assetsByPattern[data.pattern.name] = {}              
        }
        if (!(data.history.ticker.symbol in this.assetsByPattern[data.pattern.name])) {
          this.assetsByPattern[data.pattern.name][data.history.ticker.symbol] = 0              
        }
        this.assetsByPattern[data.pattern.name][data.history.ticker.symbol] += data.count
      },
      createChartDatas() {
        this.chartData.patternsByAsset = this.selectedAsset ? this.createChartData(this.patternsByAsset[this.selectedAsset.symbol]) : null
        this.chartData.assetsByPattern = this.selectedPattern ? this.createChartData(this.assetsByPattern[this.selectedPattern.name]) : null
      },
      createChartData(items) {
        if (items) {
          return {
            datasets: [{
              data: Object.values(items),
              backgroundColor: Object.keys(items).map(_ => "#"+((1<<24)*Math.random()|0).toString(16))  // random colors
            }],
            labels: Object.keys(items)
          }
        }
        return null
      },      

      // dropdowns selections methods
      selectAsset(asset) {
        this.selectedAsset = asset
        this.createChartDatas()
      },
      selectPattern(pattern) {
        this.selectedPattern = pattern
        this.createChartDatas()
      }      
    },

    watch: {
      selectedAsset(val) {        
        helper.updateStore(this.$store, 'selectedAsset', val, this.storeKey)
      },
      selectedPattern(val) {        
        helper.updateStore(this.$store, 'selectedPattern', val, this.storeKey)
      }
    },

    mounted() {
      this.initData();
    }
  }  
</script>
<style>
  .table > thead > tr > th {
    font-size: inherit
  }
</style>