<template>
  <card class="card">
    <audio id="connectionLost" src="media/connectionLost.mp3" preload="auto"></audio>
    <h4 v-if="showTitle" slot="header" class="card-title">{{title}}</h4>
    <div>
      <section v-if="noData">
        <h5>{{ noDataText ? noDataText : $t('noData') }}</h5>
      </section>
      <section v-else-if="isError">
        <p>{{ $t('errors.dataError') }}</p>
      </section>
      <section v-else>
        <DualRingLoader v-if="loading" :color="'#54f1d2'" :class="[finishedLoadings ? dataClass : noDataClass, loaderClass]"/>
        <base-table :data="data.length ? data : tableData"
                    :titles="titles"
                    :columns="columns"
                    :checkboxColumns="checkboxColumns"
                    @checked="checkedEmit"
                    thead-classes="text-primary"
                    :sortable="sortable"
                    :filterable="filterable"
                    :editable="editable"
                    :clickable="clickable"
                    :saveable="saveable"
                    :allowSave="allowSave"
                    :savedRows="savedRows"
                    @edited="edited"
                    @filtered="filtered"
                    @selected="selected"
                    @saved="saved" >
        </base-table>
      </section>
    </div>
  </card>
</template>
<script>
import BaseTable from './BaseTable.vue';
import DualRingLoader from '@bit/joshk.vue-spinners-css.dual-ring-loader';

import constants from '@/custom/assets/js/constants';
import helper from '@/custom/assets/js/helper';


export default {
  name: 'fancy-table',
  components: {
    BaseTable,
    DualRingLoader    
  },
  props: {
    title: {
      type: String,
      description: "Table title"
    },
    noDataText: {
      type: String,
      description: "Text to show when no data"
    },
    showTitle: {
      type: Boolean,
      default: true,
      description: "Whether to show table title"
    },
    data: {
      type: Array,
      default: () => [],
      description: "Table data"
    },
    apiUrls: {
      type: Array,
      default: () => [],
      description: "URLs to API data sources"
    },
    authorize: {
      type: Boolean,
      description: "Whether connection to apiUrls must be authorized"
    },
    rowsCreator: {
      type: Function,
      default: responseData => {
        return responseData
      },
      description: "How to create rows values (of shape [#rows, #columns]) from response data"
    },
    aggregator: {
      type: Function,
      default: (oldRows, newRows, weight) => {
        return helper.weightedAverageAggregator(oldRows, newRows, weight)
      },
      description: "How to aggregate created rows from all sources (result of shape [#oldRows + #newRows, #columns])"
    },    
    titles: {
      type: Object,
      default: () => {},
      description: "Table data values descriptions"
    },
    columns: {
      type: Array,
      default: () => [],
      description: "Table columns"
    },
    checkboxColumns: {
      type: Array,
      default: () => [],
      description: "Columns that are checkboxes"
    },
    // interval: {
    //   type: Number,
    //   default: () => constants.intervals.dataReload,
    //   description: "Interval to reaload data"
    // },
    sortable: {
      type: Boolean,
      description: "Whether columns can be sorted by header click"
    },
    filterable: {
      type: Boolean,
      description: "Whether columns can be filtered by header double-click"
    },
    editable: {
      type: Boolean,
      description: "Whether values can be directly edited by double-click"
    },
    clickable: {
      type: Boolean,
      description: "Whether rows can be double-clicked for some action"
    },
    saveable: {
      type: Boolean,
      description: "Whether rows have Save button at last column (to do emit Save action)"
    },
    allowSave: {
      type: Boolean,
      description: "Whether rows can use Save button functionality" // ie. backtest was run and row has result ID
    },
    savedRows: {
      type: Array,
      default: () => [],
      description: "Table rows that are already saved"
    }
  },

  data() {
    return {
      error: false,
      loading: false,
      tableData: [],
      finishedLoadings: 0,
      
      // css classes
      dataClass: 'data',      
      noDataClass: 'noData',
      loaderClass: 'loader'
    }
  },

  computed: {
    noData() {
      return !this.loading && (!this.data || !this.data.length) && !this.tableData.length
    },
    isError() {
      return this.error
    }
  },

  methods: {
    initData() {
      if (this.data && this.data.length) {
        return 
      }

      this.loadData();
        
      setInterval(() => { 
        this.loadData();
      }, constants.intervals.dataReload ); //this.interval
    },

    loadData() {
      this.finishedLoadings = 0
      let errorLoadings = 0
      if (this.apiUrls && this.apiUrls.length > 0) {
        this.loading = true
        this.error = false
      }

      const loadRoutine = () => new Promise ((resolve, reject) => {           
        let responses = []

        if (!this.apiUrls) {
          resolve(responses)
        } else {
          this.apiUrls.forEach(apiUrl => {
            this.$http
            .get(apiUrl, this.authorize ? this.$store.getItem('headers') : null)
            .then(response => {
              if (!this.finishedLoadings) {
                this.tableData = []
              }

              responses.push(response)          
            })
            .catch(error => {
              console.log(error);
              if (++errorLoadings === this.apiUrls.length) {
                this.error = true
                reject()
              }

              if (error.message === constants.strings.errors.networkError) {
                helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.$t('notifications.beConnectionLost') + '(' + this.title + ' ' + this.$t('table') + ')')
              }
            })
            .finally(() => {
              if (++this.finishedLoadings === this.apiUrls.length) {
                this.loading = false
                resolve(responses)
              }
            });
          })
        }
      })

      loadRoutine()
      .then((responses) => {
        let eqOutsSum = 0
        responses.forEach(response => eqOutsSum += (response.data.equity ? response.data.equity[response.data.equity.length - 1] : 0))

        responses.forEach(response => {
          let newTableData = [];

          this.rowsCreator(response.data).forEach(rowValues => {
            let row = {}
            let clNr = 0

            // add keys to values (ie.column names)
            this.columns.forEach(column => {
              row[column.toLowerCase()] = clNr > rowValues.length - 1 ? null : rowValues[clNr]
              clNr++
            })

            newTableData.push(row);
          });

          // aggregation
          let weight = response.data.equity ? response.data.equity[response.data.equity.length - 1] / eqOutsSum : 1
          this.tableData = this.aggregator(this.tableData, newTableData, weight).slice(0, constants.maxRows)
          let td = this.tableData
        })
      })
    },

    // BaseTable emited event
    edited(data) {
      this.$emit('edited', data)
    },
    checkedEmit(data) {
      this.$emit('checked', data)
    },
    filtered(data) {
      this.$emit('filtered', data)      
    },
    selected(data) {
      this.$emit('selected', data)
    },
    saved(data) {
      this.$emit('saved', data)
    }
  },

  mounted() {
    this.initData()
  }
};
</script>
<style>
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