<template>
  <div class="wrapper">
    <audio id="connectionLost" src="media/connectionLost.mp3" preload="auto"></audio>
    <div class="formblocks">

      <!-- symbol/name search -->
      <div class="formblock">
      <p>{{$t('research.stockPickingLab.filters.symbolName')}}</p>
      <base-input alternative
                  type="text"
                  style="float: left;  margin-right: 20px"
                  v-model="symbolSearch"
                  :placeholder="$t('research.stockPickingLab.filters.text')"
                  @keyup.enter="symbolSearchEnter">
      </base-input>
      
      <!-- currencies  -->
      <!-- <img :src="notEqualSrc(selectedCurrencyNot)" 
           @click="selectCurrencyNot" 
           :title="$t('research.stockPickingLab.filters.change') + ' ' + $t('research.stockPickingLab.filters.currency').toLowerCase() + (!selectedCurrencyNot ? ' ' + $t('research.stockPickingLab.filters.not') : '') + ' ' + $t('research.stockPickingLab.filters.equal')" 
           class="notEqual"
           onMouseOver="this.classList.add('mouseOver');"
           onMouseOut="this.classList.remove('mouseOver')">
      <base-dropdown v-if="showCurrency" 
                     class="dd" 
                     menu-classes="dropdown-black" 
                     title-classes="btn btn-secondary" 
                     :title="currenciesTitle">
        <ul style="list-style-type: none;">
          <li v-for="currency in currencies.filter(el => el !== selectedCurrency)">            
            <a class="dropdown-item" 
               @click="selectCurrency(currency)" 
               href="#" 
               :title="currencyTitle(currency)">
              {{currency}}
            </a>
          </li>
        </ul>
      </base-dropdown>       -->

      <!-- exchanges -->
      <img :src="notEqualSrc(selectedExchangeNot)"
           @click="selectExchangeNot" 
           :title="$t('research.stockPickingLab.filters.change') + ' ' + $t('research.stockPickingLab.filters.exchange').toLowerCase() + (!selectedExchangeNot ? ' ' + $t('research.stockPickingLab.filters.not') : '') + ' ' + $t('research.stockPickingLab.filters.equal')" 
           class="notEqual"
           onMouseOver="this.classList.add('mouseOver')"
           onMouseOut="this.classList.remove('mouseOver')">

      </div>
      <div class="formblock">
      <base-dropdown v-if="showExchange" 
                     class="dd" 
                     menu-classes="dropdown-black" 
                     title-classes="btn btn-secondary" 
                     :title="exchangesTitle">
        <ul style="list-style-type: none;">
          <li v-for="exchange in exchanges.filter(el => el !== selectedExchange)">
            <a class="dropdown-item" 
               @click="selectExchange(exchange)" 
               href="#"
               :title="exchangeTitle(exchange)">
               {{exchange}}
            </a>
          </li>
        </ul>
      </base-dropdown>

      <!-- index -->
      <base-checkbox v-if="showIndex" class="chb" v-model="index">{{$t('research.stockPickingLab.filters.index')}}</base-checkbox>

      <!-- dividend -->
      <base-checkbox v-if="showDividend" class="chb" v-model="dividend">{{$t('research.stockPickingLab.filters.dividend')}}</base-checkbox>      

      <!-- sectors -->
      <img :src="notEqualSrc(selectedSectorNot)"
           @click="selectSectorNot" 
           :title="$t('research.stockPickingLab.filters.change') + ' ' + $t('research.stockPickingLab.filters.sector').toLowerCase() + (!selectedSectorNot ? ' ' + $t('research.stockPickingLab.filters.not') : '') + ' ' + $t('research.stockPickingLab.filters.equal')" 
           class="notEqual"
           onMouseOver="this.classList.add('mouseOver')"
           onMouseOut="this.classList.remove('mouseOver')">
      </div>
      <div class="formblock">
      <base-dropdown v-if="showSector" 
                     class="dd" 
                     menu-classes="dropdown-black" 
                     title-classes="btn btn-secondary" 
                     :title="sectorsTitle">
        <ul style="list-style-type: none;">
          <li v-for="sector in sectors.filter(el => el !== selectedSector)">
            <a class="dropdown-item" 
               @click="selectSector(sector)" 
               href="#"
               :title="sectorTitle(sector)">
               {{$t('research.stockPickingLab.filters.' + (sector === 'all' ? sector : 'sectors.' + sector))}}
            </a>
          </li>
        </ul>
      </base-dropdown>
      
      <!-- market price -->
      <div class="formblock formblock--centered ">
        <p>{{$t('research.stockPickingLab.filters.marketPrice')}}</p>
        <base-input alternative
                    type="text"
                    style="float: left;  margin-right: 10px"
                    v-model="marketPriceGte"
                    :placeholder="$t('number')"
                    @keyup.enter="marketPriceGteEnter">
        </base-input>
        <p>{{$t('research.stockPickingLab.filters.and')}}</p>
        <base-input alternative
                    type="text"
                    style="float: left;"
                    v-model="marketPriceLte"
                    :placeholder="$t('number')"
                    @keyup.enter="marketPriceLteEnter">
        </base-input>
      </div>
      </div>
      <div class="formblock">
      <!-- watchlist -->
      <img :src="watchlistSrc" 
           style="float: right; border-radius: 10rem;"
           @click="watchlistDeActivate" 
           :title="watchlistActive ? $t('research.stockPickingLab.filters.watchlistDeactivate') : $t('research.stockPickingLab.filters.watchlistActivate')" 
           class="watchlist"
           onMouseOver="this.classList.add('mouseOver')"
           onMouseOut="this.classList.remove('mouseOver')">
     </div>
    </div>

    <!-- pagination -->
    <div style="clear:both;"></div>
    <div style="float: left;margin-top: 20px;">
      <nav v-if="nrOfPages > 1" aria-label="Page navigation">
        <ul class="pagination justify-content-center">
          <li v-for="page in pages" 
              :class="[ { 'active': (!isNaN(Number(page)) && Number(page) === activePage), 'disabled': (page === '...') }, 'page-item' ]">
            <a class="page-link" @click="selectPage(page)" href="#">{{ page }}</a>
          </li>
        </ul>
      </nav>
      <DualRingLoader v-if="loading" :color="'#54f1d2'" style="width: 80px; height: 80px; position: absolute; top: 40%; left: 45%;" />
      <div style="list-style-type: none;">
        <div v-for="stockData in stocksData">
          <stock-card :symbol="stockData.symbol"                      
                      :name="stockData.name"
                      :rank="stockData.rank"
                      :stats="stockData.statsData">
          </stock-card>
        </div>
      </div>
      <nav v-if="nrOfPages > 1" aria-label="Page navigation">
        <ul class="pagination justify-content-center">
          <li v-for="page in pages" 
              :class="[ { 'active': (!isNaN(Number(page)) && Number(page) === activePage), 'disabled': (page === '...') }, 'page-item' ]">
            <a class="page-link" @click="selectPage(page)" href="#">{{ page }}</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>
<script>
  import { BaseRadio } from "@/components";
  import DualRingLoader from '@bit/joshk.vue-spinners-css.dual-ring-loader';
  import StockCard from '@/custom/components/Cards/StockCard.vue';
  
  import constants from '@/custom/assets/js/constants';
  import helper from '@/custom/assets/js/helper';
  

  export default {
    name: "filters",
    components: {
      BaseRadio,
      DualRingLoader,
      StockCard
    },

    data() {
      return {
        stocksData: [],
        loading: false,
        error: false,
        loadStocksDataTimer: null,
        activePage: 1,
        nrOfPages: 1,

        // filters
        symbolSearch: null,
        // selectedCurrency: null,
        // selectedCurrencyNot: false,
        selectedExchange: null,
        selectedExchangeNot: false,
        selectedSector: null,      
        selectedSectorNot: false,      
        index: false,
        dividend: false,
        marketPriceGte: null,
        marketPriceLte: null,
        watchlistActive: false
      }
    },

    methods: {
      notEqualSrc(notEqual) {
        return notEqual ? require('@/custom/assets/img/not-equal.png') : require('@/custom/assets/img/equal.png')
      },

      // initializing
      initSelectors() {
        // if (this.selectedCurrency && !('currency' in localStorage)) {
        //   localStorage.setItem('currency', this.selectedCurrency)
        // } else {
        //   this.selectedCurrency = localStorage.currency
        // }
        // if (!('currencyNot' in localStorage)) {
        //   localStorage.setItem('currencyNot', this.selectedCurrencyNot)
        // }
        // this.selectedCurrencyNot = JSON.parse(localStorage.currencyNot)

        if (this.selectedExchange && !('exchange' in localStorage)) {
          localStorage.setItem('exchange', this.selectedExchange)
        } else {
          this.selectedExchange = localStorage.exchange
        }
        if (!('exchangeNot' in localStorage)) {
          localStorage.setItem('exchangeNot', this.selectedExchangeNot)
        }
        this.selectedExchangeNot = JSON.parse(localStorage.exchangeNot)

        if (this.selectedSector && !('sector' in localStorage)) {
          localStorage.setItem('sector', this.selectedSector)
        } else {
          this.selectedSector = localStorage.sector
        }
        if (!('sectorNot' in localStorage)) {
          localStorage.setItem('sectorNot', this.selectedSectorNot)
        }
        this.selectedSectorNot = JSON.parse(localStorage.sectorNot)

        if (!('index' in localStorage)) {
          localStorage.setItem('index', this.index)
        } else {
          this.index = JSON.parse(localStorage.index)
        }

        if (!('dividend' in localStorage)) {
          localStorage.setItem('dividend', this.dividend)
        } else {
          this.dividend = JSON.parse(localStorage.dividend)
        }        

        if ('watchlistActive' in localStorage) {
          this.watchlistActive = JSON.parse(localStorage.watchlistActive)
        }        
      },

      initData(resetPage=true) {
        if (resetPage) {
          this.activePage = 1
        }

        this.loadStocksData();
        
        if (this.loadStocksDataTimer) {
          clearInterval(this.loadStocksDataTimer);
        }
        
        this.loadStocksDataTimer = setInterval(() => { 
          this.loadStocksData();
        }, constants.intervals.dataReload );
      },

      // data loading
      loadStocksData() {
        this.stocksData = []
        this.loading = true
        this.error = false

        this.$http
        .get(constants.urls.tickerSP.base + helper.encodeQueryData(this.getQueryData()))
        .then(response => {
          this.nrOfPages = Math.ceil(response.data.count / constants.maxRows)

          let i = ((this.activePage - 1) * constants.maxRows) + 1
          response.data.results.forEach(result => {
            this.stocksData.push({
              symbol: result.symbol,              
              name: result.info && result.info.shortName ? result.info.shortName : null,
              rank: i++,
              statsData: [
                result.compute ? Number(result.compute.cagr) + ' %' : null,
                result.compute ? Number(result.compute.sharpe_ratio) + ' &nbsp;&nbsp;' : null,
                result.compute ? Number(result.compute.stddev) + ' &nbsp;&nbsp;' : null,                
                result.compute ? Number(result.compute.recovery_dd_time) + ' &nbsp;&nbsp;' : null,
                result.compute ? Number(result.compute.max_dd) + ' %' : null,
                result.compute ? Number(result.compute.scorep) * 100 + ' %' : null
              ]
            });
          }); 
        })
        .catch(error => {
          console.log(error);
          this.error = true

          if (error.message === constants.strings.errors.networkError) {
            helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.$t('notifications.beConnectionLost') + '(' + this.$t('sidebar.stockPickingLab') + ')')
          }
        })
        .finally(() => this.loading = false);
      },

      getQueryData() {
        let data = {}

        if (this.watchlistActive && 'watchlist' in localStorage) {
          let watchlist = JSON.parse(localStorage.watchlist)
          data['symbol__in'] = watchlist.join(',')
        }

        data['page'] = this.activePage
        data['ordering'] = 'score_pcento'
        // data['index'] = this.index
        data['search'] = this.symbolSearch
        data['info__regularMarketPrice__gte'] = this.marketPriceGte
        data['info__regularMarketPrice__lte'] = this.marketPriceLte
        data["sp500"] = "true"
        if (this.dividend) {          
          data['info__dividendDate__is_null'] = false
        }

        // if (this.selectedCurrencyNot) {
        //   data['info__currency__exclude'] = this.selectedCurrency
        // } else {
        //   data['info__currency'] = this.selectedCurrency
        // }
        if (this.selectedExchangeNot) {
          data['info__exchange__exclude'] = this.selectedExchange
        } else {
          data['info__exchange'] = this.selectedExchange
        }
        if (this.selectedSectorNot) {
          data['sector__name__exclude'] = this.selectedSector
        } else {
          data['sector__name'] = this.selectedSector
        }
        
        return data
      },

      // dropdowns selections
      // selectCurrency(currency) {
      //   if (currency === this.$t('research.stockPickingLab.filters.all')) {
      //     this.selectedCurrency = null
      //     localStorage.removeItem('currency')

      //     this.selectedCurrencyNot = false
      //     localStorage.setItem('currencyNot', this.selectedCurrencyNot)
      //   } else {
      //     this.selectedCurrency = currency
      //     localStorage.setItem('currency', currency)
      //   }

      //   this.initData()
      // },
      // selectCurrencyNot() {
      //   this.selectedCurrencyNot = !this.selectedCurrencyNot
      //   localStorage.setItem('currencyNot', this.selectedCurrencyNot)

      //   if (this.selectedCurrency) {
      //     this.initData()
      //   }
      // },
      // currencyTitle(currency) {
      //   return currency === this.$t('research.stockPickingLab.filters.all') 
      //          ? this.$t('research.stockPickingLab.filters.clearSelection') 
      //          : this.$t('research.stockPickingLab.filters.currency') 
      //             + (this.selectedCurrencyNot ? ' ' + this.$t('research.stockPickingLab.filters.not') : '') 
      //             + ' ' + this.$t('research.stockPickingLab.filters.equal')
      // },      

      selectExchange(exchange) {
        if (exchange === this.$t('research.stockPickingLab.filters.all')) {
          this.selectedExchange = null
          localStorage.removeItem('exchange')

          this.selectedExchangeNot = false          
          localStorage.setItem('exchangeNot', this.selectedExchangeNot)
        } else {
          this.selectedExchange = exchange
          localStorage.setItem('exchange', exchange)
        }
        if (this.selectedExchangeNot !== exchange) {
          this.selectedExchangeNot = null
        }

        this.initData()
      },
      selectExchangeNot() {
        this.selectedExchangeNot = !this.selectedExchangeNot
        localStorage.setItem('exchangeNot', this.selectedExchangeNot)

        if (this.selectedExchange) {
          this.initData()
        }
      },
      exchangeTitle(exchange) {
        return exchange === this.$t('research.stockPickingLab.filters.all') 
               ? this.$t('research.stockPickingLab.filters.clearSelection') 
               : this.$t('research.stockPickingLab.filters.exchange') 
                  + (this.selectedExchangeNot ? ' ' + this.$t('research.stockPickingLab.filters.not') : '') 
                  + ' ' + this.$t('research.stockPickingLab.filters.equal')
      },      

      selectSector(sector) {
        if (sector === constants.strings.all) {
          this.selectedSector = null
          localStorage.removeItem('sector')

          this.selectedSectorNot = false
          localStorage.setItem('sectorNot', this.selectedSectorNot)          
        } else {
          this.selectedSector = sector
          localStorage.setItem('sector', sector)
        }
        if (this.selectedSectorNot !== sector) {
          this.selectedSectorNot = null
        }

        this.initData()
      },
      selectSectorNot() {
        this.selectedSectorNot = !this.selectedSectorNot
        localStorage.setItem('sectorNot', this.selectedSectorNot)

        if (this.selectedSector) {
          this.initData()
        }
      },
      sectorTitle(sector) {
        return sector === constants.strings.all
               ? this.$t('research.stockPickingLab.filters.clearSelection') 
               : this.$t('research.stockPickingLab.filters.sector') 
                  + (this.selectedSectorNot ? ' ' + this.$t('research.stockPickingLab.filters.not') : '') 
                  + ' ' + this.$t('research.stockPickingLab.filters.equal')
      },    

      symbolSearchEnter() {
        this.initData()
      },
      
      marketPriceGteEnter() {
        if (this.marketPriceLte && this.marketPriceGte > this.marketPriceLte) {
          this.marketPriceGte = this.marketPriceLte
        }

        this.initData()
      },
      marketPriceLteEnter() {
        if (this.marketPriceGte && this.marketPriceLte < this.marketPriceGte) {
          this.marketPriceLte = this.marketPriceGte
        }   
        
        this.initData()
      },

      watchlistDeActivate() {
        this.watchlistActive = !this.watchlistActive
        this.initData()
      },

      selectPage(page) {
        if (page === this.$t('paging.previous')) {
          this.activePage--
        } else if (page === this.$t('paging.next')) {
          this.activePage++
        } else {
          this.activePage = page
        }
      }
    }, 

    computed: {
      watchlistSrc() {
        return this.watchlistActive ? require('@/custom/assets/img/favorite-on.png') : require('@/custom/assets/img/favorite-off.png')
      },

      // showCurrency() {
      //   if (!('currencyEnabled' in localStorage)) {
      //     localStorage.setItem('currencyEnabled', true)
      //   } 
      //   return JSON.parse(localStorage.currencyEnabled)
      // },
      showExchange() {
        if (!('exchangeEnabled' in localStorage)) {
          localStorage.setItem('exchangeEnabled', true)
        } 
        return JSON.parse(localStorage.exchangeEnabled)
      },
      showIndex() {
        if (!('indexEnabled' in localStorage)) {
          localStorage.setItem('indexEnabled', true)
        } 
        return JSON.parse(localStorage.indexEnabled)
      },
      showDividend() {
        if (!('dividendEnabled' in localStorage)) {
          localStorage.setItem('dividendEnabled', true)
        } 
        return JSON.parse(localStorage.dividendEnabled)
      },
      showSector() {
        if (!('sectorEnabled' in localStorage)) {
          localStorage.setItem('sectorEnabled', true)
        } 
        return JSON.parse(localStorage.sectorEnabled)
      },

      // currencies() {
      //   let currencies = []
      //   if (this.selectedCurrency) {
      //     currencies = [this.$t('research.stockPickingLab.filters.all')]
      //   }
      //   return currencies.concat(this.$t('research.stockPickingLab.filters.currencies'))
      // },
      // currenciesTitle() {
      //   return this.selectedCurrency ? this.selectedCurrency : this.$t('research.stockPickingLab.filters.currency')                
      // },
      exchanges() {
        let exchanges = []
        if (this.selectedExchange) {
          exchanges = [this.$t('research.stockPickingLab.filters.all')]
        }
        return exchanges.concat(this.$t('research.stockPickingLab.filters.exchanges'))
      },
      exchangesTitle() {
        return this.selectedExchange ? this.selectedExchange : this.$t('research.stockPickingLab.filters.exchange')                
      },
      riskProfileTitle() {
        return this.selectedRiskProfile 
                ? (this.selectedRiskProfileNot ? '!= ' : '') + this.selectedRiskProfile
                : this.$t('research.stockPickingLab.filters.riskProfile') 
               
      },
      sectors() {
        let sectors = []
        if (this.selectedSector) {
          sectors = [constants.strings.all]
        }
        return sectors.concat(Object.keys(this.$t('research.stockPickingLab.filters.sectors')))
      },
      sectorsTitle() {
        return this.selectedSector ? this.selectedSector : this.$t('research.stockPickingLab.filters.sector')                
      },

      pages() {
        let pages = []

        if (this.activePage !== 1) {
          pages = pages.concat([ this.$t('paging.previous') ])
        }

        pages = pages.concat([ 1 ])
        if (this.activePage > 3) {
          pages = pages.concat([ constants.strings.etc ])
        }
        if (this.activePage !== 1 && this.activePage !== this.nrOfPages) {
          if (this.activePage !== 2) {
            pages = pages.concat([ this.activePage - 1 ])
          }
          pages = pages.concat([ this.activePage ])
          if (this.activePage !== this.nrOfPages - 1) {
            pages = pages.concat([ this.activePage + 1 ])
          }
        }
        if (this.activePage < this.nrOfPages - 2) {
          pages = pages.concat([ constants.strings.etc ])
        } 

        pages = pages.concat([ this.nrOfPages ])  
        if (this.activePage !== this.nrOfPages) {
          pages = pages.concat([ this.$t('paging.next') ])
        }

        return pages
      }
    },

    mounted() {
      this.initSelectors()
      this.initData();
    },

    watch: {
      index(val) {
        localStorage.index = val
      },
      dividend(val) {
        localStorage.dividend = val
        this.initData()
      },
      activePage(val) {
        this.initData(false)
      },
      watchlistActive(val) {
        localStorage.watchlistActive = val        
      }
    }
  };
</script>
<style>
img.notEqual {
  float: left;   
  margin-right: 10px;
  
  border-radius: 10rem;
}

img.watchlist {
  box-shadow: 0px 0px 10px #1d8cf8;
}

img.mouseOver {
  box-shadow: 0px 0px 20px red;
}
</style>