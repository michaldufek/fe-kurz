<template>
    <div>        
        <fancy-table :title="$t(tradesKey + '.title')"
                    :showTitle="false"
                    :apiUrls="patternResults"
                    :noDataText="noDataText"
                    :columns="$t(tradesKey + '.columns')"
                    :rowsCreator="rowsCreator"
                    :sortable="true"
                    :filterable="true"
                    :key="tableKey">
        </fancy-table>

        <p v-if="warningText" style="color: yellow; text-align: center">{{warningText}}</p>        
    </div>
</template>
<script>
import FancyTable from '@/custom/components/Tables/FancyTable';  
import constants from '@/custom/assets/js/constants';
import helper from '@/custom/assets/js/helper';


export default {
    components: {
        FancyTable
    },

    data() {
        return {
            perfResultsKey: constants.translationKeys.performanceResults,
            tradesKey: constants.translationKeys.trades,

            loading: true,
            noDataText: '',
            warningText: '',
            tableKey: 0
        }
    },
    
    computed: {
        patternResults() {
            return !this.loading ? [ constants.urls.patternLab.backtestPatterns.results ] : []
        }
    },
    
    methods: {
        initData() {            
            let data = this.$store.getItem(constants.storeKeys.backtestPatterns)
            if (data) {
                this.loading = data.loading
                this.tableKey++
            } else {
                this.loading = false
            }
        },  
        
        rowsCreator(data) {
            let columns = this.$t(this.tradesKey + '.columns')
            let rows = []
            
            data.forEach(datum => {
                let base = helper.getBacktestPatternsTableBase(datum, this.$store, this.$t(constants.translationKeys.patterns + '.columns'))

                if (datum.error) {
                    this.warningText += `${this.$t(this.perfResultsKey + '.problemsPrefix')} '${base.name}' ${this.$t(this.perfResultsKey + '.problemsSuffix')}: ${datum.msg} `
                } else {
                    helper.createTradesRow(rows, datum, base)
                }
            })

            if (!rows.length && this.warningText) { // all pattern results has error
                this.noDataText = this.warningText
                this.warningText = null
            }

            return rows
        }
    },

    mounted() {
        this.initData()
    }
}
</script>
<style scoped>

</style>