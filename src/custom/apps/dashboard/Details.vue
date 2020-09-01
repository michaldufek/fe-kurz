<template>
  <div>
    <ul style="list-style-type: none;">
      <li v-for="strategyData in strategiesData">
        <strategy-card :title="strategyData.title"
                       :apiUrl="strategyData.apiUrl">
        </strategy-card>
      </li>
    </ul>
  </div> 
</template>
<script>
  import StrategyCard from '@/custom/components/Cards/StrategyCard.vue';
  import constants from '@/custom/assets/js/constants';

  export default {
    components: {
      StrategyCard
    },

    data() {
      return {
        strategiesData: [],
        connected: false,
        email: ''
      };
    },

    methods: {
      initStrategies() { 
        let data = this.$store.getItem(constants.translationKeys.IBLogin)
        if (data) {
          this.email = data.email
          this.checkGWrunning()   // no need to set interval because only live portfolio should be here
        } else {
          this.setStrategies()
        }
      },

      checkGWrunning() {
        this.$http
        .get(constants.urls.liveDepl.gateway.status + this.email)
        .then(response => {
          if ('error' in response.data) {
            helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', `${this.$t('sidebar.details')} ${this.$t('login.IB.status')} - ${response.data.error}`)
          } else {
            this.connected = response.data.status
          }
        })
        .catch(error => {
          console.log(error)
          if (error.message === constants.strings.errors.networkError) {
            helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', `${this.$t('sidebar.details')} ${this.$t('login.IB.status')}`)
          }
        })
        .finally(() => {
          this.setStrategies()
        })
      },

      setStrategies() {        
        this.strategiesData = []

        if (this.connected) {
          this.strategiesData.push({
            title: "Live Report",
            apiUrl: constants.urls.liveDepl.report + this.email
          })
        }
        else {
          for (const [key, value] of Object.entries(constants.urls.chart)) {
            this.strategiesData.push({
              title: key,
              apiUrl: value
            })
          }
        }
      }
    },

    mounted() {
      this.initStrategies();
    }
  }
</script>
<style>
</style>