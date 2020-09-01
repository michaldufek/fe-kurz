<template>
  <div class="row">
    <!-- <card class="card"> to-do: must be in one card -->
      <div class="col-lg-6 col-md-12">
        <card class="card">
          <table class="table tablesorter">
            <thead>
            <tr>
              <!-- <slot name="columns"> -->
                <h4 class="card-title">{{$t('research.wareHouse.premiumStrategies')}}</h4>
              <!-- </slot> -->
            </tr>
            </thead>
            <tbody>
            <tr v-for="strategyName in premiumStrategies">
              <!-- <slot :row="item"> -->
                <td style="border-top: 0px; margin-top: 10px;">
                  {{strategyName}}
                </td>
                <td style="border-top: 0px;">
                  <base-button type="secondary" fill style="float:right; margin-left: 10px">
                    {{$t('research.wareHouse.remove')}}
                  </base-button>
                  <base-button type="secondary" fill style="float:right;">
                    {{$t('research.wareHouse.select')}}
                  </base-button>
                </td>
                <!-- to-do: export to Portfolio manager/Designed portfolio -->
                <!-- to-do: v-if="strategies.enableLive" -->                        
                <!-- v-if="strategies.enableStore" -->
              <!-- </slot> -->
            </tr>
            </tbody>
          </table>
        </card>
      </div>

      <div class="col-lg-6 col-md-12">
        <card class="card">
          <table class="table tablesorter">
            <thead>
            <tr>
              <!-- <slot name="columns"> -->
                <h4 class="card-title">{{$t('research.wareHouse.myStrategies')}}</h4>
              <!-- </slot> -->
            </tr>
            </thead>
            <tbody>
              <DualRingLoader v-if="loading" :color="'#54f1d2'" style="margin-left: 400px" />
              <tr v-else v-for="strategy in myStrategies">
                <!-- <slot :row="item"> -->
                  <td style="border-top: 0px; margin-top: 10px;">
                    {{strategy.name}}
                  </td>
                  <td style="border-top: 0px;">
                    <base-button @click="remove(strategy.id)" type="secondary" fill style="float:right; margin-left: 10px">
                      {{$t('research.wareHouse.remove')}}
                    </base-button>
                    <p style="float:right">&nbsp;&nbsp;&nbsp;</p>
                    <base-button @click="select(strategy.original_result_id)" type="secondary" fill style="float:right;">
                      {{$t('research.wareHouse.select')}}
                    </base-button>
                  </td>
                  <!-- to-do: export to Portfolio manager/Designed portfolio -->
                  <!-- to-do: v-if="strategies.enableLive" -->                        
                  <!-- v-if="strategies.enableStore" -->
                <!-- </slot> -->
              </tr>
            </tbody>
          </table>
        </card>
      </div>
    <!-- </card> -->
  </div>
</template>
<script>
  import { BaseButton } from "@/components";
  import DualRingLoader from '@bit/joshk.vue-spinners-css.dual-ring-loader';
  import constants from '@/custom/assets/js/constants'
  import helper from '@/custom/assets/js/helper';

  var samplePortfolioNames = ["S1 with very very long title", "S2 with very very long title", "S3 with very very long title", "S4 with very very long title"];
  

  export default {
    components: {
      BaseButton,
      DualRingLoader
    },
    data() {
      return {   
        warehouseKey: 'sidebar.wareHouse',
        loading: false,

        premiumStrategies: samplePortfolioNames,  
        myStrategies: []
      }
    },

    methods: {
      getMyStrategies() {
        this.loading = true

        this.myStrategies = []
        this.$http
        .get(constants.urls.datawarehouse.results)
        .then(response => response.data.forEach(datum => {
          if (!datum.in_portfolio) {
            let idSuffix = `(${datum.original_result_id})`        
            this.myStrategies.push({ 
              id: datum.id, 
              original_result_id: datum.original_result_id,
              name: `${datum.name ? datum.name : helper.getDefaultPrName(datum.original_result_id)} ${datum.name.includes(idSuffix) ? '' : idSuffix}`
            })
          }
        }))
        .catch(error => {
          console.log(error)
          if (error.message === constants.strings.errors.networkError) {
            helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.$t(this.warehouseKey))
          }
        })
        .finally(() => this.loading = false)
      },

      remove(id) {
        this.loading = true

        this.$http
        .delete(constants.urls.datawarehouse.result + id)
        .catch(error => {
          console.log(error)
          if (error.message === constants.strings.errors.networkError) {
            helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', `${this.$t(this.warehouseKey)} ${this.$t('research.wareHouse.remove')}`)
          }
        })
        .finally(() => {
          this.getMyStrategies()
          this.loading = false   
        })
      },

      select(id) {   
        this.loading = true

        // add to portfolio
        this.$http
        .patch(constants.urls.datawarehouse.result + helper.encodeRouteParams([ id, constants.urls.patternLab.abbreviation ]), { in_portfolio: true })
        .catch(error => {
            console.log(error)
            if (error.message === constants.strings.errors.networkError) {
                helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', `${this.$t(this.warehouseKey)} ${this.$t('research.wareHouse.select')}`)
            }
        })
        .finally(() => {
          this.getMyStrategies()
          this.loading = false   
        })
      }
    },

    mounted() {
      this.getMyStrategies()
    }
  };
</script>
<style>
.wh-btn {
  box-shadow: 0px 0px 10px black;
}

.btnOver {
  box-shadow: 0px 0px 10px white;
}
</style>