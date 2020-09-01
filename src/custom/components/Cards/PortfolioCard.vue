<template>
  <div class="row">
    <!-- <card class="card">  -->
      <!-- to-do: must be in one card -->
      <div class="col-lg-8 col-md-12 flex-stretch">
        <card class="card">
          <table class="table tablesorter">
            <thead>
              <tr>
                <!-- <slot name="columns"> -->
                  <h4 class="card-title">{{title}}</h4>
                <!-- </slot> -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="strategy in strategies">
                <!-- <slot :row="item"> -->
                  <td style="border-top: 0px; margin-top: 10px;">
                    {{strategy.name}}
                  </td>
                  <td style="border-top: 0px;">
                    <base-button v-if="!enableStop" @click="goLive(strategy.id)" type="secondary" style="float:right; margin-left: 10px" fill>{{$t('research.portfolioManager.live')}}</base-button>
                    <base-button v-if="!enableStop" @click="store(strategy.id)" type="secondary" style="float:right;" fill>{{$t('research.portfolioManager.store')}}</base-button>
                    <base-button v-if="enableStop" @click="stop(strategy.id)" type="secondary" style="float:right;" fill>{{$t('research.stop')}}</base-button>
                  </td>
                <!-- </slot> -->
              </tr>
            </tbody>
          </table>
        </card>
      </div>

      <div class="col-lg-4 col-md-12">
        <fancy-table :title="title + ' ' + $t('research.portfolioManager.statsTable.title').toLowerCase()"
                     :showTitle="false"
                     :apiUrls="strategiesUrls"
                     :rowsCreator="rowsCreator"
                     :titles="$t('terms.perfStats')"
                     :columns="$t('research.portfolioManager.statsTable.columns')">
        </fancy-table>
      </div>
    <!-- </card> -->
  </div>
</template>
<script>
import { BaseButton } from "@/components";
import FancyTable from '@/custom/components/Tables/FancyTable';

import constants from '@/custom/assets/js/constants';
import helper from '@/custom/assets/js/helper';


export default {
  name: "portfolio-card",
  components: {
    BaseButton,
    FancyTable
  },

  props: {
    title: {
      type: String,
      description: "Portfolio title"
    },
    strategies: {
      type: Array,
      default: () => {
        return [ {} ]
      },
      description: "Array of strategies names with their API urls and IDs"
    },
    enableStop: {
      type: Boolean,
      description: "Whether only Stop button is showed"
    }
  },

  computed: {
    strategiesUrls() {
      // get all strategies urls only
      let urls = []
      this.strategies.forEach(strat => urls.push(strat.url))
      return urls
    }
  },

  methods: {
    goLive(id) {
      this.$emit('wentLive', id)
    },
    store(id) {
      this.$emit('stored', id)
    },
    stop(id) {
      this.$emit('stoped', id)
    },

    rowsCreator(responseData) {
      return [
        [ 
          this.$t('cagr') + ": " + responseData.cagr + ' %', 
          this.$t('research.portfolioManager.statsTable.rows.beta') + ": " + 43 
        ],
        [ 
          this.$t('sr') + ": " + responseData.sharpe + ' &nbsp;&nbsp;', 
          this.$t('research.portfolioManager.statsTable.rows.alfa') + ": " + 43 
        ],        
        [
          this.$t('maxDD') + ": " + responseData.maxdd + ' %',
        ],
        [
          this.$t('equityOuts') + ": " + responseData.equity[responseData.equity.length - 1] + ' $',
        ]
      ]
    }    
  }
}
</script>
<style>
</style>