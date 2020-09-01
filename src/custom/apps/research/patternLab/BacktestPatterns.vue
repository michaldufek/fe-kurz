<template>
  <div class="row">

    <div class="col-xl-12 col-12 col-md-6 container">
      <assets-patterns-picker :title="$t('research.patternLab.backtestPatterns.title')"
                              :btnText="$t('research.patternLab.backtestPatterns.addPattern')" 
                              @btnClicked="addPattern" />
    </div>

    <!-- strategy settings  -->
    <div class="col-md-6 container col-12 col-xl-3" style="margin-left: 0px">
      <card>
        <!-- initial capital -->
        <div>
          <p class="label">{{ $t('research.patternLab.backtestPatterns.initialCapital') }}</p>
          <base-input alternative
                      type="text"
                      class="input"
                      style=""
                      v-model="strategy.initialCapital"
                      :placeholder="$t('research.patternLab.backtestPatterns.numberUSD')">
          </base-input>
        </div>    

        <!-- entry rules -->
        <div style="clear:both;">
          <h4 slot="header" class="card-title">{{ $t('research.patternLab.entry') + ' ' + $t('research.patternLab.rules') }}</h4>        

          <table>
            <!-- direction -->
            <tr>
              <td>
                <p>{{ $t('research.patternLab.backtestPatterns.entryRules.direction') }}</p>
              </td>
              <td>
                <base-dropdown menu-classes="dropdown-black" 
                              title-classes="btn btn-secondary"
                              :title="strategy.direction">
                  <ul style="list-style-type: none;">
                    <li v-for="dir in Object.values($t('research.patternLab.backtestPatterns.entryRules.directions')).filter(d => d !== strategy.direction)">            
                      <a class="dropdown-item" 
                        @click="strategy.direction = dir" 
                        href="#">
                        {{ dir }}
                      </a>
                    </li>
                  </ul>
                </base-dropdown>
              </td>
            </tr>

            <!-- trend filter -->
            <tr :title="$t('research.patternLab.backtestPatterns.entryRules.trendFilterTip')">
              <td style="width: 46%">
                <p>{{ $t('research.patternLab.backtestPatterns.entryRules.trendFilter') }}</p>
              </td>
              <td>
                <base-checkbox v-model="strategy.trendFilter" style="margin-top: -20px; margin-bottom: 10px; text-align: center;" />
              </td>
            </tr>

            <!-- moving average -->
            <tr v-if="strategy.trendFilter" :title="$t('research.patternLab.backtestPatterns.entryRules.movingAverageTip')">
              <td>
                <p>{{ $t('research.patternLab.backtestPatterns.entryRules.ma_filter_period') }}</p>
              </td>
              <td>
                <base-input alternative
                            type="text"
                            v-model="strategy.ma_filter_period"
                            :placeholder="$t('research.patternLab.backtestPatterns.numberUSD')">
                </base-input>
              </td>
            </tr>
            
            <!-- risk (fix-amount) -->
            <tr>
              <td>
                <p>{{ $t('research.patternLab.backtestPatterns.entryRules.fixed_amount') }}</p>
              </td>
              <td>
                <base-input alternative
                        type="text"
                        v-model="strategy.fixed_amount"
                        :placeholder="$t('research.patternLab.backtestPatterns.numberUSD')">
                </base-input>
              </td>
            </tr>
          </table>
          
        </div>

        <!-- exit rules -->
        <div>
          <h4 slot="header" class="card-title">{{ $t('research.patternLab.exit') + ' ' + $t('research.patternLab.rules') }}</h4>

          <!-- analyze -->
          <!-- <div :title="$t('research.patternLab.backtestPatterns.exitRules.analyzeTip')">
            <p class="label" style="width: 34%">{{ $t('research.patternLab.backtestPatterns.exitRules.analyze') }}</p>
            <base-input alternative
                        type="text"
                        class="input"
                        style="width: 40%"
                        v-model="strategy.analyze"
                        :placeholder="$t('research.patternLab.backtestPatterns.exitRules.numberBars')">
            </base-input>
          </div> -->

          <table>
            <!-- profit target -->
            <tr>
              <td colspan="2">
                <p class="label">{{ $t('research.patternLab.backtestPatterns.exitRules.profit_take') }}</p>
              </td>
            </tr>
            <tr>
              <td>
                <base-input alternative
                          type="text"                        
                          v-model="strategy.profit_take.value"
                          :placeholder="$t('number')">
                </base-input>
              </td>
              <td>
                <base-dropdown menu-classes="dropdown-black" 
                            title-classes="btn btn-secondary"
                            :title="strategy.profit_take.unit">
                  <ul style="list-style-type: none;">
                    <li v-for="unit in $t('research.patternLab.units').filter(u => u !== strategy.profit_take.unit)">
                      <a class="dropdown-item" 
                        @click="strategy.profit_take.unit = unit" 
                        href="#">
                        {{ unit }}
                      </a>
                    </li>
                  </ul>
                </base-dropdown>
              </td>
            </tr>

            <!-- stop loss -->
            <tr>
              <td colspan="2">
                <p class="label">{{ $t('research.patternLab.backtestPatterns.exitRules.stoploss') }}</p>
              </td>

            </tr>
            <tr>
              <td>
                <base-input alternative
                          type="text"
                          v-model="strategy.stoploss.value"
                          :placeholder="$t('number')">
                </base-input>
              </td>
              <td>
                <base-dropdown menu-classes="dropdown-black" 
                            title-classes="btn btn-secondary"
                            :title="strategy.stoploss.unit">
                  <ul style="list-style-type: none;">
                    <li v-for="unit in $t('research.patternLab.units').filter(u => u !== strategy.stoploss.unit)">
                      <a class="dropdown-item" 
                        @click="strategy.stoploss.unit = unit" 
                        href="#">
                        {{ unit }}
                      </a>
                    </li>
                  </ul>
                </base-dropdown>
              </td>
            </tr>
          </table>

        </div>

        <!-- Run strategy button -->
        <base-button native-type="submit" type="secondary" @click="runStrategyClick" style="width: 100%">{{ $t('research.patternLab.backtestPatterns.runStrategy') }}</base-button>

      </card>
    </div>
    
    <!-- performance results  -->
    <card class="col-xl-8 col-md-12  container " style="margin-right: 0px" :key="cardKey">
      <h4 slot="header" class="card-title" style="float: left">{{ $t('research.patternLab.backtestPatterns.performanceResults.title') }}</h4>

      <top-navbar />
      <DualRingLoader v-if="loading" :color="'#54f1d2'" :class="[loading ? dataClass : noDataClass, loaderClass]"/>
      <dashboard-content @click.native="toggleSidebar" style="margin-top: 15px" />
    </card>

  </div>
</template>
<script>
  import AssetsPatternsPicker from '@/custom/components/AssetsPatternsPicker'
  import constants from '@/custom/assets/js/constants'
  import helper from '@/custom/assets/js/helper';
  import i18n from "@/i18n"
  
  import TopNavbar from "@/custom/layout/application/patternLab/performanceResults/TopNavbar.vue";
  import DashboardContent from "@/custom/layout/application/patternLab/Content.vue";
  import MobileMenu from "@/layout/dashboard/MobileMenu";
  import DualRingLoader from '@bit/joshk.vue-spinners-css.dual-ring-loader';

  
  const defaultStrategy = {
    initialCapital: null,

    // entry rules
    trendFilter: false,
    ma_filter_period: null,
    fixed_amount: null,
    
    // exit rules
    analyze: null,
    profit_take: {
      value: null,
      unit: constants.defaultUnit
    },
    stoploss: {
      value: null,
      unit: constants.defaultUnit
    }
  }
  
  export default {
    components: {
      AssetsPatternsPicker,
      TopNavbar,
      DashboardContent,
      MobileMenu,
      DualRingLoader
    },

    data() {
      return {
        errorTitle: ' (' + this.$t('research.patternLab.backtestPatterns.title') + ').',
        columns: this.$t(constants.translationKeys.patterns + '.columns'),

        strategy: {
          ...defaultStrategy,
          direction: Object.values(this.$t('research.patternLab.backtestPatterns.entryRules.directions'))[0]
        },
        loading: false,
        cardKey: 0,

        // css classes
        dataClass: 'data',      
        noDataClass: 'noData',
        loaderClass: 'loader',
      }
    },
    
    methods: {
      initData() {
        let data = this.$store.getItem(constants.storeKeys.backtestPatterns)
        if (data) {
          this.loading = data.loading ? data.loading : false
          if (this.loading) {
            this.setCheckBacktestsInterval()
          }

          if (data.strategy) {
            this.strategy = data.strategy
            this.strategy.direction = Object.values(this.$t('research.patternLab.backtestPatterns.entryRules.directions'))[data.strategy.direction]
          } else {
            this.strategy = {
              ...defaultStrategy,
              direction: Object.values(this.$t('research.patternLab.backtestPatterns.entryRules.directions'))[0]
            }            
          }
        }
      },

      setCheckBacktestsInterval() {
        let interval = setInterval(() => { 
          this.checkBacktests(interval)
        }, constants.intervals.seconds3 )        
      },
      checkBacktests(interval) {
        let backtestsDone = true
        let noResp = true

        this.$http
        .get(constants.urls.patternLab.backtestPatterns.status)
        .then(response => {
          response.data.forEach(bt => {
            noResp = false
            if (!bt.done) {
              backtestsDone = false
            }
          })
        })
        .catch(error => {
          console.log(error);

          if (error.message === constants.strings.errors.networkError) {
            helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.errorTitle)
          }
        })
        .finally(() => {
          if (backtestsDone && !noResp) {
              let bpData = this.$store.getItem(constants.storeKeys.backtestPatterns)
              if (bpData) {
                // set bt id and name
                let bts = helper.getStoredBacktests(bpData)

                this.$http
                .get(constants.urls.patternLab.backtestPatterns.results)
                .then(response => {
                  let errorIDs = []

                  bts.forEach(bt => {   // we have ids so change backtests names to 'bt_name (bt_id)' form
                    let respBts = response.data.filter(datum => datum.asset === bt.get('assetId') && datum.pattern === bt.get('patternId'))
                    if (respBts.length) {
                      let respBt = respBts[0]
                      
                      bt.set('btId', respBt.id)
                      bt.set(this.columns[0].toLowerCase(), `${bt.get(this.columns[0].toLowerCase()) && !this.isDefaultPrName(bt.get(this.columns[0].toLowerCase())) 
                                                          ? bt.get(this.columns[0].toLowerCase()).split(' (')[0] 
                                                          : helper.getDefaultPrName(bt.get('btId'))} (${bt.get('btId')})`)    // Name

                      if (respBt.error) {
                        this.$notify({
                          type: 'danger', 
                          message: bt.get(this.columns[0].toLowerCase()) + ': ' + respBt.msg
                        })
                      }
                      errorIDs.push(respBt.id)
                    }
                  })

                  // notifying response backtests errors that weren't matched by frontend backtests
                  response.data.forEach(respBt => {
                    if (respBt.error && !errorIDs.includes(respBt.id)) {
                      let btsFiltered = bts.filter(bt => bt.get('btId') === respBt.id)
                      this.$notify({
                        type: 'danger', 
                        message: (btsFiltered.length ? btsFiltered[0].get(this.columns[0].toLowerCase()) : (this.$t('research.patternLab.backtestPatterns.patternResult') + ' nr.' + respBt.id)) + ': ' + respBt.msg
                      })
                    }
                  })

                  helper.updateStoreBacktests(this.$store, 'backtests', bts, constants.storeKeys.backtestPatterns)
                  helper.updateStore(this.$store, 'allowSave', true, constants.storeKeys.backtestPatterns)
                })
                .catch(error => {
                  console.log(error);

                  if (error.message === constants.strings.errors.networkError) {
                    helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.errorTitle)
                  }
                })
                .finally(() => {
                  this.loading = false
                  clearInterval(interval)
                  this.cardKey++
                })
              }
          }
        })
      },
      isDefaultPrName(name) {
        let nameSplitted = name.split('_')
        if (nameSplitted.length < 2) {
          return false
        }
        let splitted = nameSplitted[1].split(' (')
        if (splitted.length < 2) {
          return false
        }
        return splitted[0] === splitted[1].split(')')[0]
      },

      // methods from AssetsPatternsPicker emits
      addPattern() {
        if (!this.strategy.initialCapital) {
          this.$notify({
                          type: 'warning', 
                          message: this.$t('notifications.noInitialCapital') + this.errorTitle
                      })
          return false
        }

        if (this.loading) {
          this.$notify({
                          type: 'warning', 
                          message: this.$t('notifications.loading') + this.errorTitle
                      })
          return false
        }

        let data = helper.getAssetsPatternsPickerData(this.$store)
        if (!data || !data.checkedPatterns.length) {   
          return false
        }

        this.setBacktestsTable(true)

        helper.updateStore(this.$store, 'savedBacktestsIDs', [], constants.storeKeys.backtestPatterns)
        helper.updateStore(this.$store, 'unsavedBacktestsIDs', [], constants.storeKeys.backtestPatterns)
        helper.updateStore(this.$store, 'allowSave', false, constants.storeKeys.backtestPatterns)

        this.cardKey++

        return true
      },

      runStrategyClick() {
        let data = helper.getAssetsPatternsPickerData(this.$store)
        if (!data || !data.checkedAssets.length) {   
          this.$notify({
                          type: 'warning', 
                          message: this.$t('notifications.addNoAsset') + this.errorTitle
                      })
          return
        }
        
        if (this.loading) {
          this.$notify({
                          type: 'warning', 
                          message: this.$t('notifications.loading') + this.errorTitle
                      })
          return 
        }

        if (data && !data.checkedPatterns.length) {
          this.$notify({
              type: 'warning', 
              message: this.$t('notifications.addNoPattern') + this.errorTitle
          })  
          return
        } 

        let canRun = true
        let btsData = this.$store.getItem(constants.storeKeys.backtestPatterns)
        if (!btsData || (btsData && (btsData.backtests === undefined || btsData.backtests === []))) {
          canRun = this.addPattern()
        } 

        if (canRun) {        
          this.setBacktestsTable()
          this.cardKey++
          this.runBacktests()     
        }
      },

      setBacktestsTable(createNew=false) {
        let assetsPatterns = helper.getAssetsPatternsPickerData(this.$store)
        let bpData = this.$store.getItem(constants.storeKeys.backtestPatterns)
        let oldTableData = []
        if (bpData) {
            oldTableData = helper.getStoredBacktests(bpData)
        }
        let newTableData = oldTableData

        if (createNew) {
          if (assetsPatterns) {
            // create new rows
            newTableData = []

            assetsPatterns.checkedAssets.forEach(asset => {
                assetsPatterns.checkedPatterns.forEach(pattern => {
                    let row = new Map()     // order of properties is guaranteed so we can store only (language independent) values
                    let clNr = 0

                    row.set('btId', -1)
                    row.set('assetId', asset.id)
                    row.set('patternId', pattern.id)
                    row.set(this.columns[clNr++].toLowerCase(), null)    // Name
                    row.set(this.columns[clNr++].toLowerCase(), assetsPatterns.range && assetsPatterns.range.from 
                                                                ? helper.formatDate(helper.formatDateOnly(assetsPatterns.range.from))
                                                                : null)    // From
                    row.set(this.columns[clNr++].toLowerCase(), assetsPatterns.range && assetsPatterns.range.to
                                                                ? helper.formatDate(helper.formatDateOnly(assetsPatterns.range.to))
                                                                : null)    // To
                    row.set(this.columns[clNr++].toLowerCase(), assetsPatterns.timeframe)    // Time frame                    
                    row.set(this.columns[clNr++].toLowerCase(), asset.symbol)    // Asset                    
                    row.set(this.columns[clNr++].toLowerCase(), pattern.name)    // Pattern

                    if (this.strategy) {   
                        this.updateRow(row, clNr)                            
                    }                                 

                    newTableData.push(row)
                })
            })
          }
        } else {
            newTableData.forEach(row => {
                let clNr = 4    // starting from Asset column (for the if)

                if (assetsPatterns.range && !assetsPatterns.range.to) {
                    // set null To dates to today
                    row.set(this.columns[clNr-2].toLowerCase(), helper.formatDate(new Date())) // To
                }
            })
        }

        helper.updateStoreBacktests(this.$store, 'backtests', newTableData, constants.storeKeys.backtestPatterns) 
      },
      updateRow(row, clNr) {
        row.set(this.columns[clNr++].toLowerCase(), this.strategy.initialCapital ? `${this.strategy.initialCapital} ${constants.defaultUnit}` : null)    // Initial capital
        row.set(this.columns[clNr++].toLowerCase(), this.strategy.analyze ? `${this.strategy.analyze} ${helper.pluralize(this.strategy.analyze, constants.translationKeys.patterns + '.bar')}` : null)    // Analyze
        row.set(this.columns[clNr++].toLowerCase(), this.strategy.profit_take.value ? `${this.strategy.profit_take.value} ${this.strategy.profit_take.unit}` : null)    // Profit Target
        row.set(this.columns[clNr++].toLowerCase(), this.strategy.stoploss.value ? `${this.strategy.stoploss.value} ${this.strategy.stoploss.unit}` : null)    // Stop Loss
        row.set(this.columns[clNr++].toLowerCase(), this.strategy.trendFilter && this.strategy.ma_filter_period ? `${this.strategy.ma_filter_period} ${constants.defaultUnit}` : null)    // Trend filter (moving average)
        row.set(this.columns[clNr++].toLowerCase(), this.strategy.direction)    // Direction
        row.set('fixed_amount', this.strategy.fixed_amount)    // Risk
      },

      runBacktests() { 
        this.loading = true
        let backtestsAll = helper.getStoredBacktests(this.$store.getItem(constants.storeKeys.backtestPatterns))

        // run all backtests showed in Patterns table
        let backtests2Run = []
        backtestsAll.forEach(bt => backtests2Run.push(helper.mapStrategyFromRow(bt)))

        this.$http
        .post(constants.urls.patternLab.backtestPatterns.results, backtests2Run)
        .then(_ => this.setCheckBacktestsInterval())
        .catch(error => {
          this.loading = false
          console.log(error);

          if (error.message === constants.strings.errors.networkError) {
            helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.errorTitle)
          } else {
            this.$notify({
                          type: 'warning', 
                          message: this.$t('notifications.couldntRunBacktests') + this.errorTitle
                        })
          }
        })        
      },

      toggleSidebar() {
        if (this.$sidebar.showSidebar) {
          this.$sidebar.displaySidebar(false);
        }
      }
    },

    mounted() {
      this.initData()     
      this.cardKey++
    },

    watch: {
      loading(val) {
        helper.updateStore(this.$store, 'loading', val, constants.storeKeys.backtestPatterns) 
      },
      strategy: {
        handler(val){
          let val2store = JSON.parse(JSON.stringify(val))
          val2store.direction = Object.values(this.$t('research.patternLab.backtestPatterns.entryRules.directions')).indexOf(val.direction)
          helper.updateStore(this.$store, 'strategy', val2store, constants.storeKeys.backtestPatterns) 
        },
        deep: true
      }
    }
  }  
</script>
<style>
.label {
  float: left;
  width: 40%;
  padding-top: 5px;
}

.input {
  float: left;
  width: 60%;
}

.loader {
  width: 80px; 
  height: 80px;  
  position: absolute; 
}

.loader.noData {
  top: 20%; 
  left: 40%;    
}

.loader.data {
  top: 40%; 
  left: 42.5%;
}
</style>