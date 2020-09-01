<template>
  <div class="row flex-stretch">

    <div class="col-lg-3 col-md-12 killflex container">
      <assets-patterns-picker :title="$t('research.patternLab.alerts.title')"
                              :btnText="$t('research.patternLab.alerts.addAlert')" 
                              :class="killflex"
                              :showDatePickers="false"
                              @btnClicked="addAlert" />
    </div>

    <div class="col-lg-9 col-md-12" style="text-align: center">
      <DualRingLoader v-if="loading" :color="'#54f1d2'" />
      <fancy-table v-else 
                  :title="$t(alertsKey + '.title')"
                  :showTitle="false"
                  :apiUrls="alertsUrl"
                  :authorize="true"
                  :rowsCreator="rowsCreator"
                  :columns="columns"
                  :checkboxColumns="$t(alertsKey + '.checkboxColumns')"
                  @checked="checkedEmit"
                  :sortable="true"
                  :filterable="true"
                  :key="tableKey" />
    </div>

  </div>
</template>
<script>
  import FancyTable from '@/custom/components/Tables/FancyTable';
  import AssetsPatternsPicker from '@/custom/components/AssetsPatternsPicker'
  import DualRingLoader from '@bit/joshk.vue-spinners-css.dual-ring-loader';

  import constants from '@/custom/assets/js/constants';
  import helper from '@/custom/assets/js/helper';
  
  
  export default {
    components: {
      AssetsPatternsPicker,
      FancyTable,
      DualRingLoader
    },

    data() {
      return {     
        errorTitle: ' (' + this.$t('research.alerts.title') + ').',   
        alertsKey: 'research.patternLab.alerts',

        assetsPatterns: null,
        loading: false,
        alerts: [],

        tableKey: 0
      }
    },

    computed: {        
      alertsUrl() {
        return [ constants.urls.patternLab.alerts ]
      },
      columns() {
        return this.$t(this.alertsKey + '.columns').concat(this.$t(this.alertsKey + '.checkboxColumns'))
      }
    },

    methods: {
      initData() {
        this.assetsPatterns = helper.getAssetsPatternsPickerData(this.$store)
      },

      // emited events
      addAlert() {
        this.alerts = []
        this.assetsPatterns = helper.getAssetsPatternsPickerData(this.$store)        

        if (this.assetsPatterns) {
          this.assetsPatterns.checkedAssets.forEach(asset => 
            this.assetsPatterns.checkedPatterns.forEach(pattern =>
              this.$http
              .post(constants.urls.patternLab.alerts, { pattern: pattern.id, ticker: asset.id }, this.$store.getItem('headers'))
              .then(response => this.alerts.push(response.data))
              .catch(error => {
                console.log(error);
                if (error.message === constants.strings.errors.networkError) {
                  helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.errorTitle)
                }
              })
          ))
        }

        this.loading = true
        this.setCheckAlertsInterval()
      },
      checkedEmit(row) {
        if (!this.alerts.length) {
          this.$http
          .get(constants.urls.patternLab.alerts, this.$store.getItem('headers'))
          .then(response => response.data.forEach(datum => this.alerts.push(datum)))
          .catch(error => {
            console.log(error);
            if (error.message === constants.strings.errors.networkError) {
              helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.errorTitle)
            }
          })
          .finally(() => this.putAlert(row))
        } else {
          this.putAlert(row)
        }
      },
      putAlert(row) {
        let rowAlerts = this.alerts.filter(alert => alert.pattern === this.getIdByName(this.assetsPatterns ? this.assetsPatterns.selectedPatterns : [], (pattern) => pattern.name, row[this.columns[0].toLowerCase()]) 
                      && alert.ticker === this.getIdByName(this.assetsPatterns ? this.assetsPatterns.selectedAssets : [], (asset) => asset.symbol, row[this.columns[1].toLowerCase()]))

        if (rowAlerts.length) {
          this.$http
          .put(constants.urls.patternLab.alert + rowAlerts[0].id, { app: row[this.columns[3].toLowerCase()], email: row[this.columns[2].toLowerCase()] }, this.$store.getItem('headers'))
          .catch(error => {
            console.log(error);
            if (error.message === constants.strings.errors.networkError) {
              helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.errorTitle)
            }
          })
        } else {
          console.log(`${this.$t('serverIncontinency')}: Couldn't find changed alert on server!`)
        }
      },

      setCheckAlertsInterval() {
        let interval = setInterval(() => { 
          this.checkAlerts(interval)
        }, constants.intervals.seconds3 )        
      },
      checkAlerts(interval) {
        let idsDone = []

        this.$http
        .get(constants.urls.patternLab.alerts, this.$store.getItem('headers'))
        .then(response => response.data.forEach(datum => {
          if (this.alerts.map(alert => alert.id).includes(datum.id)) {
            idsDone.push(datum.id)       
          }   
        }))
        .catch(error => {
          console.log(error);
          if (error.message === constants.strings.errors.networkError) {
            helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.errorTitle)
          }
        })
        .finally(() => {
          if (idsDone.length === this.alerts.length) {
            this.loading = false
            clearInterval(interval)
            this.tableKey++
          }
        })
      },
      
      rowsCreator(data) {
        let rows = []

        data.forEach(datum => {
          let pattern = this.assetsPatterns ? this.getItemById(this.assetsPatterns.selectedPatterns, datum.pattern) : null
          let asset = this.assetsPatterns ? this.getItemById(this.assetsPatterns.selectedAssets, datum.ticker) : null

          if (pattern && asset) {
            rows.push([
              pattern.name,        // Pattern
              asset.symbol,       // Asset
              datum.email,  // Email notification
              datum.app     // App notification
            ])
          }
        })

        return rows
      },

      getItemById(items, id) {
        let itemsFiltered = items.filter(item => item.id === id)
        return itemsFiltered.length ? itemsFiltered[0] : null
      },
      getIdByName(items, nameSelector, name) {
        let itemsFiltered = items.filter(item => nameSelector(item) === name)
        return itemsFiltered.length ? itemsFiltered[0].id : null
      }
    },

    mounted() {
      this.initData()
    }
  }  
</script>
<style>
</style>]