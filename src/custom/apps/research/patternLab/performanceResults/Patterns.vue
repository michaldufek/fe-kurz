<template>

        <fancy-table :title="$t(patternsKey + '.title')"
                     :showTitle="false"
                     :data="tableData"
                     :columns="columns"
                     :editable="true"
                     :saveable="true"
                     :allowSave="allowSave"
                     :savedRows="savedRows"
                     @edited="edited" 
                     @saved="saved" 
                     :key="tableKey" />

</template>
<script>
import FancyTable from '@/custom/components/Tables/FancyTable';  
import constants from '@/custom/assets/js/constants'
import helper from '@/custom/assets/js/helper';


export default {
    components: {
        FancyTable
    },

    data() {
        return {
            patternsKey: constants.translationKeys.patterns,

            tableData: null,
            columns: this.$t(constants.translationKeys.patterns + '.columns'),
            allowSave: false,
            savedRows: [],

            tableKey: 0
        }
    },

    methods: {
        initData() { 
            let backtestsIDs = []
            let unsavedBacktestsIDs = []

            // get data from store
            let data = this.$store.getItem(constants.storeKeys.backtestPatterns)
            if (data) {
                this.tableData = helper.getStoredBacktests(data)
                this.allowSave = data.allowSave
                backtestsIDs = this.tableData.map(bt => bt.get('btId'))
                unsavedBacktestsIDs = data.unsavedBacktestsIDs
            }
            
            // get data from server
            this.$http
            .get(constants.urls.datawarehouse.results)
            .then(response => { 
                response.data.forEach(datum => {
                    if (backtestsIDs.includes(datum.original_result_id) && !unsavedBacktestsIDs.includes(datum.original_result_id)) {
                        this.savedRows.push(datum.original_result_id)
                    }
                })
            })
            .catch(error => {
                console.log(error)
                if (error.message === constants.strings.errors.networkError) {
                    helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.$t(this.patternsKey + '.title'))
                }
            })
            .finally(_ => {})
        },        

        // FancyTable emited event
        edited(data) {
            // check if new value is valid
            let assetsPatterns = helper.getAssetsPatternsPickerData(this.$store)
            let clNr = 0
            let btId = this.tableData[data.position[0]].get('btId')

            switch(data.position[1]) {
                case this.columns[clNr++]:  // Name                    
                    data.value = data.value + (btId && btId !== -1 ? ` (${btId})` : '')
                    break
                case this.columns[clNr++]:   // From
                case this.columns[clNr++]:   // To
                    if (isNaN(new Date(data.value).getMonth())) {
                        return
                    }
                    break;
                case this.columns[clNr++]:   // Time frame
                    if (helper.convertTimeframe(data.value) === -1) {
                        return
                    }
                    break
                case this.columns[clNr++]:   // Asset
                    if (!assetsPatterns.selectedAssets.map(sa => sa.symbol).includes(data.value)) {
                        return
                    }
                    break
                case this.columns[clNr++]:   // Pattern
                    if (!assetsPatterns.selectedPatterns.map(sa => sa.name).includes(data.value)) {
                        return
                    }
                    break
                case this.columns[clNr++]:   // Initial capital
                    if (isNaN(Number(data.value))) {
                        return
                    }
                    data.value = `${data.value} ${constants.defaultUnit}`
                    break
                case this.columns[clNr++]:   // Analyze
                    if (isNaN(Number(data.value))) {
                        return
                    }
                    data.value = `${data.value} ${helper.pluralize(data.value, constants.translationKeys.patterns + '.bar')}`
                    break
                case this.columns[clNr++]:   // Profit Target
                    if (isNaN(Number(data.value))) {
                        return
                    }
                    let unit = this.tableData[data.position[0]].get(this.columns[clNr-1].toLowerCase())
                    let unitSplitted = unit ? unit.split(' ') : []
                    data.value = `${data.value} ${unitSplitted.length ? unitSplitted[1] : constants.defaultUnit}`
                    break
                case this.columns[clNr++]:   // Stop Loss
                    if (isNaN(Number(data.value))) {
                        return
                    }
                    unit = this.tableData[data.position[0]].get(this.columns[clNr-1].toLowerCase())
                    unitSplitted = unit ? unit.split(' ') : []
                    data.value = `${data.value} ${unitSplitted.length ? unitSplitted[1] : constants.defaultUnit}`
                    break
                case this.columns[clNr++]:   // Trend filter (moving average)
                    if (isNaN(Number(data.value))) {
                        return
                    }
                    data.value = `${data.value} ${constants.defaultUnit}`
                    break
                case this.columns[clNr++]:   // Direction
                    if (!Object.values(this.$t('research.patternLab.backtestPatterns.entryRules.directions')).includes(data.value)) {
                        return
                    }
                    break
                default:
                    return
            }

            this.tableData[data.position[0]].set(data.position[1].toLowerCase(), data.value)   // write edited/changed value to the table
            helper.updateStoreBacktests(this.$store, 'backtests', this.tableData, constants.storeKeys.backtestPatterns)            

            this.savedRows.splice(this.savedRows.indexOf(btId), 1)  // remove from savedRows
            helper.updateStore(this.$store, 'unsavedBacktestsIDs', this.$store.getItem(constants.storeKeys.backtestPatterns).unsavedBacktestsIDs.concat([ btId ]), constants.storeKeys.backtestPatterns)

            this.tableKey++
        },

        saved(row) {
            this.loading = true

            // change saved to true
            this.$http
            .patch(constants.urls.patternLab.backtestPatterns.results + '/' + row.btId, { ...helper.mapStrategyFromRow(row, false), saved: true })
            .then(_ => { 
                this.savedRows.push(row.btId) 
                let unsavedBacktestsIDs = this.$store.getItem(constants.storeKeys.backtestPatterns).unsavedBacktestsIDs
                unsavedBacktestsIDs.splice(unsavedBacktestsIDs.indexOf(row.btId), 1)  // remove from unsavedBacktestsIDs
                helper.updateStore(this.$store, 'unsavedBacktestsIDs', unsavedBacktestsIDs, constants.storeKeys.backtestPatterns) 

                // change name of previously stored bt
                this.$http
                .patch(constants.urls.datawarehouse.result + helper.encodeRouteParams([ row.btId, constants.urls.patternLab.abbreviation ]), { name: row[this.columns[0].toLowerCase()] })
                .catch(error => {
                    console.log(error)
                    if (error.message === constants.strings.errors.networkError) {
                        helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', `${this.$t(this.patternsKey + '.title')} ${this.$t('research.saveName')}`)
                    }
                })
            })
            .catch(error => {
                console.log(error)
                if (error.message === constants.strings.errors.networkError) {
                    helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', `${this.$t(this.patternsKey + '.title')} ${this.$t('research.save')}`)
                }
            })
            .finally(() => this.loading = false)
        }
    },

    mounted() {
        this.initData()
    },

    watch: {
      savedRows: {
        handler(val){
          helper.updateStore(this.$store, 'savedBacktestsIDs', val, constants.storeKeys.backtestPatterns) 
        },
        deep: true
      }
    }
}
</script>
<style scoped>
</style>