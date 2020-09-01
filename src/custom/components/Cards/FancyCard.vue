<template>
  <card :class="[ { noDataClass : !statsData.length }, fancyCardClass ]">
    <audio id="connectionLost" src="media/connectionLost.mp3" preload="auto"></audio> <!-- to-do: must be global ! -->    
    <h4 v-if="showTitle" slot="header" class="card-title" style="float: left">{{fullTitle}}</h4>
    <img v-if="watchable" 
         :src="watchlistSrc" 
         slot="header"          
         style="float: right; border-radius: 10rem;"
         @click="watchlistAddRemove" 
         :title="isOnWatchlist ? $t('research.stockPickingLab.watchlistRemove') : $t('research.stockPickingLab.watchlistAdd')" 
         class="watchlist"
         onMouseOver="this.classList.add('mouseOver')"
         onMouseOut="this.classList.remove('mouseOver')">
    <section v-if="noData">
      <p>{{ $t('noData') }}</p>
    </section>
    <section v-else-if="isError">
      <p>{{ $t('errors.dataError') }}</p>
    </section>
    <section v-else>
      <DualRingLoader v-if="loading" :color="'#54f1d2'" :class="[ statsData.length ? dataClass : noDataClass, loaderClass ]"/>
      <div>
        <div v-for="stat in Object.entries(statsData).slice(0, Math.ceil(Object.keys(statsData).length / 2))" 
        class="dataDiv"><p :title="titles ? titles[stat[0].toLowerCase()] : null" style="display: inline-block">{{stat[0]}}:&nbsp;</p>{{stat[1] | roundToFixed}}</div>
        <div v-for="stat in Object.entries(statsData).slice(Math.ceil(Object.keys(statsData).length / 2), Object.keys(statsData).length)" 
             class="dataDiv"><p :title="titles ? titles[stat[0].toLowerCase()] : null" style="display: inline-block">{{stat[0]}}:&nbsp;</p>{{stat[1] | roundToFixed}}</div>
      </div>
    </section>
  </card>
</template>
<script>
import DualRingLoader from '@bit/joshk.vue-spinners-css.dual-ring-loader';
import constants from '@/custom/assets/js/constants';


export default {
  name: 'fancy-card',
  components: {
    DualRingLoader
  },
  props: {
    fullTitle: {
      type: String,
      description: "Card full title"
    },
    title: {
      type: String,
      description: "Card title used mainly for errors"
    },
    showTitle: {
      type: Boolean,
      description: "Whether to show card title"
    },
    watchable: {
      type: Boolean,
      description: "Whether can be added to stocks watchlist"
    },    
    apiUrl: {
      type: String,
      description: "URL to API data source"
    },
    items: {
      type: Array,
      default: () => [],
      description: "Statistics names"
    },  
    values: {
      type: Array,
      default: () => [],
      description: "Items values (of shape [#items])"
    },
    valuesCreator: {
      type: Function,
      default: responseData => {
        return new Array(this.items.length)
      },
      description: "How to create items values (of shape [#items]) from response data if no values"
    },
    titles: {
      type: Object,
      default: () => {},
      description: "Items descriptions"
    }
  },

  data() {
    return {
      error: false,
      loading: false,
      statsData: {},
      isOnWatchlist: false,

      // css classes
      dataClass: 'data',      
      noDataClass: 'noData',
      loaderClass: 'loader',
      fancyCardClass: 'fancyCard'
    }
  },

  computed: {
    noData() {
      return !this.loading && !Object.keys(this.statsData).length
    },
    isError() {
      return this.error
    },

    watchlistSrc() {
      return this.isOnWatchlist ? require('../../assets/img/favorite-on_small.png') : require('../../assets/img/favorite-off_small.png')
    },
  },

  methods: {
    initWatchlist() {
      if (this.onWatchlist()) {
        this.isOnWatchlist = true
      }
    },
    initData() {
      this.loadData();
        
      setInterval(() => { 
        this.loadData();
      }, constants.intervals.dataReload );
    },

    loadData() {
      this.statsData = {}

      if (this.values.length) {
        this.indexValues(this.values)
      } else {
        this.loading = true
        this.error = false      

        this.$http
        .get(this.apiUrl)
        .then(response => {
          this.indexValues(this.valuesCreator(response.data))
        })
        .catch(error => {
          console.log(error);
          this.error = true

          if (error.message === constants.strings.errors.networkError) {
            helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.$t('notifications.beConnectionLost') + '(' + this.title + ' ' + this.$t('card') + ')')
          }
        })
        .finally(() => {
          this.loading = false
        });
      }
    },   

    indexValues(values) {
      let itemNr = 0

      values.forEach(value => {
        // index value by statistic name
        this.statsData[this.items[itemNr]] = value
        itemNr++
      });
    },

    getSymbol() {
      return this.fullTitle ? this.fullTitle.split('. ')[1].split(' (')[0] : null
    },

    getWatchlist() {
      // it can be changed from another StockCard so we always need to pick it up
      return 'watchlist' in localStorage ? JSON.parse(localStorage.watchlist) : []
    },
    setWatchlist(val) {
      localStorage.setItem('watchlist', JSON.stringify(val))
    },
    onWatchlist() {
      return this.getWatchlist().indexOf(this.getSymbol()) >= 0
    },
    watchlistAddRemove() {
      if (!this.watchable) {
        return
      }
      
      let watchlist = this.getWatchlist()

      if (this.onWatchlist()) {        
        watchlist.splice(watchlist.indexOf(this.getSymbol()), 1)
        this.isOnWatchlist = false

        this.setWatchlist(watchlist)
      } else {
        watchlist.push(this.getSymbol())
        this.isOnWatchlist = true

        this.setWatchlist(watchlist)
      }
    }
  },

  mounted() {
    if (this.watchable) {
      this.initWatchlist()
    }
    this.initData();
  }
};
</script>
<style>
.loader {
  width: 80px; 
  height: 80px; 
  position: absolute;
}

.loader.data {   
  top: 40%; 
  left: 45%;
}

.loader.noData {
  top: 10%; 
  left: 42.5%;    
}

.fancyCard.noData {
  height: 100px;    
}

img.watchlist {
  box-shadow: 0px 0px 20px cyan;
}

img.mouseOver {
  box-shadow: 0px 0px 20px red;
}

.dataDiv {
  width: 100%;
  white-space: pre-wrap;
  color:#42b883;
}
@media screen and (max-width: 1024px){
  .dataDiv{
    float: left;
    width: 50%;
    text-align: left;
  }
}
</style>