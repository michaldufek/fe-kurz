<template>
  <div>
    <audio id="open" src="media/open.mp3" preload="auto"></audio>
    <audio id="win" src="media/win.mp3" preload="auto"></audio>
    <audio id="lose" src="media/lose.mp3" preload="auto"></audio>
    <audio id="breakEven" src="media/breakEven.mp3" preload="auto"></audio>    
    <!-- <audio id="jumpOnAsset" src="media/jumpOnAsset.mp3" preload="auto"></audio> -->
    <audio id="jumpOnSP500" src="media/jumpOnSP500.mp3" preload="auto"></audio>

    <div class="row">
      <div class="col-12">
        <fancy-chart :title="$t('dashboard.title')"
                     :apiUrls="chartUrls"
                     :key="updateKey" >
        </fancy-chart>
      </div>
    </div>  

    <div class="row" style="margin-top: -25px">
      <div class="col-12">
        <div style="text-align: right">
          <base-button size="sm" icon @click="tradeLog.show = !tradeLog.show" style="height: 1rem;width: 1rem;min-width: 1rem;font-size: 0.5rem; margin-right: -15px; margin-top: -5px">
            <i v-if="tradeLog.show" :title="$t('dashboard.tradeLog.hide') + ' ' + $t('dashboard.tradeLog.title')" class="tim-icons icon-minimal-up" style="width: 25px"></i>
            <i v-if="!tradeLog.show" :title="$t('dashboard.tradeLog.show') + ' ' + $t('dashboard.tradeLog.title')" class="tim-icons icon-minimal-down" style="width: 25px"></i>
          </base-button>       
        </div>
        <div v-if="connected && tradeLog.show" style="background: black; margin-bottom: 10px; margin-top: -20px; margin-left: 15px; white-space: pre; font-size: xx-small; width: 98%; padding: 5px">
          {{ tradeLogParsed }}
        </div>
      </div>
    </div>

     <div class="row">      
      <div class="col-xl-4 col-12">
        <fancy-table :title="$t('dashboard.lastTradesTable.title')"
                     :apiUrls="statsUrls"
                     :rowsCreator="tradesRowsCreator"
                     :aggregator="tradesAggregator"
                     :titles="$t('terms.tradeTypes')"
                     :columns="$t('dashboard.lastTradesTable.columns')"
                     :key="updateKey" >
        </fancy-table>
      </div>

      <div class="col-xl-4 col-12">  
        <fancy-table :title="$t('dashboard.pendingOrdersTable.title')"
                     :apiUrls="statsUrls"
                     :rowsCreator="ordersRowsCreator"
                     :aggregator="ordersAggregator"
                     :titles="$t('terms.tradeTypes')"
                     :columns="$t('dashboard.pendingOrdersTable.columns')"
                     :key="updateKey" >
        </fancy-table>
      </div>

      <div class="col-xl-4 col-12">
        <fancy-table :title="$t('dashboard.performanceStatistics')"
                     :apiUrls="chartUrls"
                     :rowsCreator="statsRowsCreator"
                     :titles="$t('terms.perfStats')"
                     :columns="$t('dashboard.performanceStatisticsTable.columns')"
                     :key="updateKey" >
        </fancy-table>

        <div v-if="connected" style="float: right;">
          <DualRingLoader v-if="loading" :color="'#54f1d2'" style="width: 80px; height: 80px;margin-right: 50px;margin-bottom: -35px;" />
          <base-button type="secondary" class="my-4" @click="liquidate">{{$t('dashboard.liquidate')}}</base-button>
          <p :class="[ error ? errorClass : noErrorClass , msgClass ]">{{message}}</p>
        </div>        
      </div>
    </div> 
    
  </div>
</template>
<script>
  import FancyChart from '@/custom/components/Charts/FancyChart';
  import FancyTable from '@/custom/components/Tables/FancyTable';
  import DualRingLoader from '@bit/joshk.vue-spinners-css.dual-ring-loader';

  import helper from '@/custom/assets/js/helper';
  import constants from '@/custom/assets/js/constants';


  export default {
    components: {
      FancyChart,
      FancyTable,
      DualRingLoader
    },

    data() {
      return {
        connected: false,
        email: '',
        error: false,
        message: '',
        loading: false,
        updateKey: 0,

        tradeLog: {
          show: false,
          timer: null,
          text: ''
        },

        chartUrls: [],
        statsUrls: [],
        heardOrders: {
          open: [],
          win: [],
          lose: [],
          breakEven: []
        },
        
        // css classes
        msgClass: 'message',
        noErrorClass: 'noError',
        errorClass: 'error'
      }
    },

    computed: {
      tradeLogParsed() {
        let result = ""
	      this.tradeLog.text.forEach(log => result += `[${log.timestamp}]: ${log.text}\n`)
        return result
      }
    },

    methods: {
      initSoundSignals() {
        setInterval(() => { 
          // this.checkOrdersStatusChange();
        }, constants.intervals.minute );
      },

      initIB() {
        let data = this.$store.getItem(constants.translationKeys.IBLogin)
        if (data) {
          this.email = data.email
          this.checkGWrunning()   // no need to set interval because only live portfolio should be here
        } else {
          this.setApiUrls()
        }
      },

      checkGWrunning() {
        this.loading = true

        this.$http
        .get(constants.urls.liveDepl.gateway.status + this.email)
        .then(response => {
          if ('error' in response.data) {
            helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', `${this.$t('dashboard.title')} ${this.$t('login.IB.status')} - ${response.data.error}`)
          } else {
            this.connected = response.data.status
            if (this.connected) {
              helper.setInterval(this.tradeLog, 'timer', this.getTradeLog)
            }
          }
        })
        .catch(error => {
          console.log(error)
          this.connected = false

          if (error.message === constants.strings.errors.networkError) {
            helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', `${this.$t('dashboard.title')} ${this.$t('login.IB.status')}`)
          }
        })
        .finally(() => {
          this.loading = false
          this.setApiUrls()
        })
      },

      getTradeLog() {
        this.$http
        .get(constants.urls.liveDepl.tradeLog + this.email, this.$store.getItem('headers'))   // authorized because GW doesn't need authorization
        .then(response => {
          if ('error' in response.data) {      // currently not used in trade log response
            this.error = true
          } else {
            this.tradeLog.text = response.data
          }
        })
        .catch(error => {
          console.log(error)

          if (error.message === constants.strings.errors.networkError) {
              helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', `${this.$t('dashboard.title')} - ${this.$t('dashboard.tradeLog.title')}`)
          } else {
            if ('type' in error.response.data) {
              var message = error.response.data.type + ' error'

              if ('message' in error.response.data) {
                  message += ': ' + error.response.data.message
              } else {
                  message += '.'
              }
            } else {
                message = error.message
            }

            this.$notify({
              type: 'warning', 
              message: message
            })
          }
        })
        .finally(() => {})
      },

      setApiUrls() {
        this.chartUrls = []
        this.statsUrls = []

        if (this.connected) {
          this.chartUrls.push(constants.urls.liveDepl.report + this.email)    // todo: must be chart url here!
          this.statsUrls.push(constants.urls.liveDepl.report + this.email)
        }
        else {
          // get just urls from named urls dictionary
          for (const [key, value] of Object.entries(constants.urls['chart'])) {
            this.chartUrls.push(value)
          }
          for (const [key, value] of Object.entries(constants.urls['stats'])) {
            this.statsUrls.push(value)
          }
        }

        this.updateKey++
      },

      liquidate() {
        this.$confirm(this.$t('dashboard.confirmLiquidate'))
        .then(() => {
          this.loading = true

          this.$http
          .post(constants.urls.liveDepl.liquidate, { userid: this.email })
          .then(response => {
            this.error = false
            this.message = response.data.message
            this.updateKey++
          })
          .catch(error => {
            console.log(error)
            this.error = true

            if (error.message === constants.strings.errors.networkError) {
                helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', `${this.$t('dashboard.title')} ${this.$t('dashboard.liquidate')}`)
                this.message = error.message
            }

            if ('type' in error.response.data) {
                this.message = error.response.data.type + ' error'

                if ('message' in error.response.data) {
                    this.message += ': ' + error.response.data.message
                } else {
                    this.message += '.'
                }
            }                
          })
          .finally(() => this.loading = false)
        })
        .catch(_ => {})
      },

      liquidate() {
        this.$confirm(this.$t('dashboard.confirmLiquidate'))
        .then(() => {
          this.loading = true

          this.$http
          .post(constants.urls.liveDepl.liquidate, { userid: this.email })
          .then(response => {
            this.error = false
            this.message = response.data.message
          })
          .catch(error => {
            console.log(error)
            this.error = true

            if (error.message === constants.strings.errors.networkError) {
                helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', `${this.$t('dashboard.title')} ${this.$t('dashboard.liquidate')}`)
                this.message = error.message
            }

            if ('type' in error.response.data) {
                this.message = error.response.data.type + ' error'

                if ('message' in error.response.data) {
                    this.message += ': ' + error.response.data.message
                } else {
                    this.message += '.'
                }
            }                
          })
          .finally(() => this.loading = false)
        })
        .catch(_ => {})
      },

      checkOrdersStatusChange() {
        // to-do: right definitions when to notify (blocker: BE)
        this.$http
        .get(constants.urls.stats["MF Report"])
        .then(response => {
          response.data.openTrades.forEach(openTrade => {
            if (!(openTrade.order.orderId in heardOrders.open) && openTrade.orderStatus === "Submitted") {
              this.notify('open', 'info', this.$t('notifications.open'))
              this.heardOrders.open.push(openTrade.order.orderId)
            } else if (!(openTrade.order.orderId in heardOrders.win) && openTrade.orderStatus === "Filled") {
              this.notify('win', 'success', this.$t('notifications.win'))
              this.heardOrders.win.push(openTrade.order.orderId)
            } else if (!(openTrade.order.orderId in heardOrders.lose) && openTrade.orderStatus === "Cancelled") {
              this.notify('lose', 'warning', this.$t('notifications.lose'))
              this.heardOrders.lose.push(openTrade.order.orderId)
            } else if (!(openTrade.order.orderId in heardOrders.breakEven) && openTrade.orderStatus === "Inactive") {
              this.notify('breakEven', 'info', this.$t('notifications.breakEven'))
              this.heardOrders.breakEven.push(openTrade.order.orderId)
            }
          })
        })
      },      

      notify(audioEl, type, msg) {
        document.getElementById(audioEl).play();

        this.$notify({
          type: type, 
          message: msg
        })
      },

      // fancy-tables props functions
      tradesRowsCreator(responseData) {
        let rows = []

        responseData.openTrades.forEach(openTrade => {
            let row = []

            row.push(helper.formatDateOnly(openTrade.contract.lastTradeDateOrContractMonth)) // date and time
            row.push(openTrade.order.action) // trade type
            row.push(openTrade.order.auxPrice) // result (%)
            // result (usd)

            rows.push(row);
          });

        return rows
      },

      ordersRowsCreator(responseData) {
        let rows = []

        if ('fills' in responseData) {
          responseData.fills.forEach(fill => {
              let row = []

              row.push(helper.formatDate(fill.time)) // date
              row.push(fill.execution.side) // trade type
              // target (usd)
              // stop loss (usd)

              rows.push(row);
          })
        }

        return rows
      },

      statsRowsCreator(responseData) {
        let row = {}
        let rows = [];
        let rowsT = []
        let eqOut = responseData.equity[responseData.equity.length - 1]
        
        // 3 Months
        row[this.$t('dashboard.performanceStatisticsTable.lines')[0].toLowerCase()] = helper.ytd(responseData, 1) + ' %' // YTD
        row[this.$t('dashboard.performanceStatisticsTable.lines')[1].toLowerCase()] = helper.cagr(responseData.equity, 1) + ' %' // CAGR
        row[this.$t('dashboard.performanceStatisticsTable.lines')[2].toLowerCase()] = responseData.sharpe + ' &nbsp;&nbsp;' // Sharpe Ratio // to-do: BE - sharpe for 3m and 12m bases
        row[this.$t('dashboard.performanceStatisticsTable.lines')[3].toLowerCase()] = helper.maxDD(responseData, 1) + ' %' // Max DrawDown
        row[this.$t('dashboard.performanceStatisticsTable.lines')[4].toLowerCase()] = eqOut + ' $' // Equity Outstanding
        rows.push(row) 

        // 12 Months
        row = {}
        row[this.$t('dashboard.performanceStatisticsTable.lines')[0].toLowerCase()] = helper.ytd(responseData, 4) + ' %'
        row[this.$t('dashboard.performanceStatisticsTable.lines')[1].toLowerCase()] = helper.cagr(responseData.equity, 4) + ' %'
        row[this.$t('dashboard.performanceStatisticsTable.lines')[2].toLowerCase()] = responseData.sharpe + ' &nbsp;&nbsp;'
        row[this.$t('dashboard.performanceStatisticsTable.lines')[3].toLowerCase()] = helper.maxDD(responseData, 4) + ' %'
        row[this.$t('dashboard.performanceStatisticsTable.lines')[4].toLowerCase()] = eqOut + ' $'
        rows.push(row)  

        // Since Inception
        row = {}
        row[this.$t('dashboard.performanceStatisticsTable.lines')[0].toLowerCase()] = responseData.ytd + ' %'
        row[this.$t('dashboard.performanceStatisticsTable.lines')[1].toLowerCase()] = responseData.cagr + ' %'
        row[this.$t('dashboard.performanceStatisticsTable.lines')[2].toLowerCase()] = responseData.sharpe + ' &nbsp;&nbsp;'
        row[this.$t('dashboard.performanceStatisticsTable.lines')[3].toLowerCase()] = responseData.maxdd + ' %'
        row[this.$t('dashboard.performanceStatisticsTable.lines')[4].toLowerCase()] = eqOut + ' $'
        rows.push(row)     

        // transposing rows
        this.$t('dashboard.performanceStatisticsTable.lines').forEach(line => {
          var row = []

          row.push(line)
          rows.forEach(origRow => row.push(origRow[line.toLowerCase()]))

          rowsT.push(row);
        });          

        return rowsT
      },

      tradesAggregator(oldRows, newRows) {
        return helper.sortAggregator(oldRows, newRows, this.$t('dashboard.lastTradesTable.columns')[0].toLowerCase())
      },

      ordersAggregator(oldRows, newRows) {
        return helper.sortAggregator(oldRows, newRows, this.$t('dashboard.pendingOrdersTable.columns')[0].toLowerCase())
      }      
    },

    mounted() {
      this.initSoundSignals()
      this.initIB()
    }
  };
</script>
<style>
.message {
    white-space: pre-line;
}

.noError {
    color: gray;    
}

.error {
  color: red !important;
}
</style>
