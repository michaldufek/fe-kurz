<template>
  <div>
    <div class="row">
      <div class="col-md-4">
        <card>
          <h5 class="title">{{$t('settings.metrics')}}</h5>
          <ul style="list-style-type: none; padding-left: 0px;">
            <!-- <li >
              <base-checkbox v-model="currency">{{$t('research.stockPickingLab.filters.currency')}}</base-checkbox>
            </li> -->
            <li >
              <base-checkbox v-model="exchange">{{$t('research.stockPickingLab.filters.exchange')}}</base-checkbox>
            </li>
            <li >
              <base-checkbox v-model="index">{{$t('research.stockPickingLab.filters.index')}}</base-checkbox>
            </li>
            <li >
              <base-checkbox v-model="dividend">{{$t('research.stockPickingLab.filters.dividend')}}</base-checkbox>
            </li>
            <li >
              <base-checkbox v-model="sector">{{$t('research.stockPickingLab.filters.sector')}}</base-checkbox>
            </li>
          </ul>
        </card>
      </div>            

      <div class="col-md-4">
        <card>
          <h5 class="title">{{$t('settings.general')}}</h5>
          <p style="float: left; margin-right: 10px; margin-top: 8px;">{{$t('settings.language')}}:</p>
          <base-dropdown style="float: left; margin-right: 10px"
                        menu-classes="dropdown-black" 
                        title-classes="btn btn-secondary" 
                        :title="$root.$i18n.locale">
            <ul style="list-style-type: none;">
              <li v-for="lang in langs.filter(l => l !== $root.$i18n.locale)">            
                <a class="dropdown-item" 
                  @click="selectLocale(lang)" 
                  href="#">
                  {{ lang }}
                </a>
              </li>
            </ul>
          </base-dropdown>   
        </card>
      </div>
    </div>
    <base-button @click="clearSettings" style="margin-left: 20px;" type="secondary" fill>{{$t('settings.clearAll')}}</base-button>        
  </div>
</template>
<script>
  export default {
    components: {
    },
    methods: {
      init() {
        // if (!('currencyEnabled' in localStorage)) {
        //   localStorage.setItem('currencyEnabled', true)
        // } 
        // this.currency = JSON.parse(localStorage.currencyEnabled)

        if (!('exchangeEnabled' in localStorage)) {
          localStorage.setItem('exchangeEnabled', true)
        }
        this.exchange = JSON.parse(localStorage.exchangeEnabled)
        
        if (!('indexEnabled' in localStorage)) {
          localStorage.setItem('indexEnabled', true)
        }
        this.index = JSON.parse(localStorage.indexEnabled)
        
        if (!('dividendEnabled' in localStorage)) {
          localStorage.setItem('dividendEnabled', true)
        }
        this.dividend = JSON.parse(localStorage.dividendEnabled)

        if (!('sectorEnabled' in localStorage)) {
          localStorage.setItem('sectorEnabled', true)
        }
        this.sector = JSON.parse(localStorage.sectorEnabled)
      },

      clearSettings() {
        let token = localStorage.token
        let headers = localStorage.headers
        localStorage.clear()
        localStorage.setItem('token', token)
        localStorage.setItem('headers', headers)

        this.$notify({type: 'success', message: this.$t('notifications.settingsCleared')})        
        this.init()
      },

      selectLocale(lang) {
        this.$root.$i18n.locale = lang
        localStorage.locale = lang
      }
    },
    data () {
      return {
        // currency: true,
        exchange: true,
        index: true,
        dividend: true,
        sector: true,

        langs: [ 'en', 'cs' ]
      }
    },
    mounted() {
      this.init()
    },
    watch: {
      // currency(val) {
      //   localStorage.currencyEnabled = val
      // },
      exchange(val) {
        localStorage.exchangeEnabled = val
      },
      index(val) {
        localStorage.indexEnabled = val
      },
      dividend(val) {
        localStorage.dividendEnabled = val
      },
      sector(val) {
        localStorage.sectorEnabled = val
      }
    }
  }
</script>
<style>
</style>
