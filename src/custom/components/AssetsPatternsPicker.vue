<template>
    <card>
    <div class=" row xl-flex">
        <audio id="connectionLost" src="media/connectionLost.mp3" preload="auto"></audio>

        <div class="col-12 col-xl-2"  style="min-width: 80px;" v-if="showDatePickers">
            <!-- timeframe dropdown -->
            <div :style="'position: relative; left: ' + tfLeftPos + 'px; z-index: 1' + (tfLeftPos === defaultTfLeftPos ? '' : '; top: 10px')">
                <base-dropdown class="dd" 
                               menu-classes="dropdown-black" 
                               title-classes="btn btn-secondary"
                               :title="timeframe">
                    <ul style="list-style-type: none;">
                        <li v-for="tframe in $t('research.patternLab.timeframes').filter(el => el !== timeframe)">            
                            <a class="dropdown-item" 
                               @click="selectTimeframe(tframe)" 
                               href="#">
                               {{ tframe }}
                            </a>
                        </li>
                    </ul>
                </base-dropdown>
            </div>

            <!-- date pickers -->
            <div class="col-xs-3" :style="'position: relative' + (tfLeftPos === defaultTfLeftPos ? '' : '')">
                <div class="controls">
                    <div>
                        <!-- <slot :row="item"> -->
                        <div>{{ $t('research.from') }}<datepicker v-model="range.from" 
                                        :disabled-dates="disabledDatesFrom" 
                                        :clear-button="true" 
                                        :format="dateFormat" 
                                        :placeholder="$t('research.pickDate')" />
                        </div>
                        <!-- </slot> -->
                    </div>
                    <div>
                        <!-- <slot :row="item"> -->
                        <div>{{ $t('research.to') }}<datepicker v-model="range.to" 
                                        :disabled-dates="disabledDatesTo" 
                                        :clear-button="true" 
                                        :format="dateFormat" 
                                        :placeholder="$t('research.pickDate')" />
                        </div>
                        <!-- </slot> -->
                    </div>
                </div>
            </div>
        </div>

        <!-- assets -->
        <div class="col-12 col-xl-5" style="text-align: center;">
            <label>{{ $t('research.patternLab.assets') }}</label>
            <Dropdown :options="assets"
                      :disabled="false"
                      name="ddAssets"
                      :maxItem="maxItems"
                      :placeholder="$t('research.patternLab.type2search')"
                      @filter="getAssets"
                      @selected="ddSelectAsset">
            </Dropdown>
            <base-table :data="selectedAssets" :columns="[ 'symbol', 'name' ]">
                <template slot="columns">
                    <th></th>
                    <th></th>
                </template>  
                <template slot-scope="{row}">
                    <div class="regrow">
                        <td style="border: none">
                            <input v-if="oneAssetLimit" type="radio" :id="row.id" :value="row" v-model="checkedAsset">
                            <input v-else type="checkbox" :id="row.id" :value="row" v-model="checkedAssets">
                        </td>
                        <td style="border: none; color:white;margin: 0 1em; display: inline-block;">{{row.symbol}}</td>
                        <td style="border: none; border-left: 1px; text-align: left">{{row.name}}</td>
                    </div>
                    <td class="td-actions text-right" style="border: none">                        
                        <base-button size="sm" icon @click="removeAsset(row)" style="height: 1rem;width: 1rem;min-width: 1rem;font-size: 0.5rem;">
                            <i class="tim-icons icon-simple-remove"></i>
                        </base-button>
                    </td>
                </template>    
            </base-table>
        </div>

        <!-- patterns -->
        <div class="col-12 col-xl-5" style="text-align: center;">
            <label>{{ $t('research.patternLab.patterns') }}</label>
            <Dropdown :options="patterns"
                      :disabled="false"
                      name="ddPatterns"
                      :maxItem="maxItems"
                      :placeholder="$t('research.patternLab.type2search')"
                      @filter="getPatterns"
                      @selected="ddSelectPattern">
            </Dropdown>
            <ul style="list-style-type: none; text-align: left; margin-top: 15px; padding-left: 0px">
                <li v-if="selectedPatterns.length" :title="checkedAllPatterns ? $t('research.patternLab.uncheckAll') : $t('research.patternLab.checkAll')">   
                    <input type="checkbox" @click="checkAllPatterns" v-model="checkedAllPatterns">
                </li>
                <li v-for="selectedPattern in selectedPatterns">   
                    <input type="checkbox" :id="selectedPattern.id" :value="selectedPattern" v-model="checkedPatterns">
                    <label :for="selectedPattern.id" style="margin-left: 10px">{{ selectedPattern.name }}</label>
                </li>
            </ul> 
        </div>

        </div>
        <!-- Add button -->
        <!-- <div class="button-wrap"> -->
        <div :style="'position: relative; left: ' + tfLeftPos + 'px; z-index: 1' + (tfLeftPos === defaultTfLeftPos ? '' : '; top: 10px')">
            <base-button native-type="submit" type="secondary" @click="btnClick">{{ btnText }}</base-button>
        </div>
    </card>
</template>
<script>
import Datepicker from 'vuejs-datepicker';
import Dropdown from 'vue-simple-search-dropdown';
import { BaseTable } from '@/components'

import constants from '@/custom/assets/js/constants';
import helper from '@/custom/assets/js/helper';


export default {
    name: 'assets-patterns-picker',
    components: {  
      Datepicker,   
      Dropdown,
      BaseTable   
    },
    props: {
        title: {
            type: String,
            description: "Title used in errors"
        },
        oneAssetLimit: {
            type: Boolean,
            description: "Whether only one asset can be checked"
        },
        showDatePickers: {
            type: Boolean,
            default: true,
            description: "Whether datepickers (and timeFrame dropdown) section should be showed"
        },
        tfLeftPos: {
            type: Number,
            default: 0,
            description: "Position of timeFrame dropdown from left in pixels"
        },
        btnText: {
            type: String,
            description: "Text of main submit button"
        }
    },

    data() {
        return {
            defaultTfLeftPos: 0,
            timeframe: this.$t('research.patternLab.timeframes')[0],

            // datepickers
            range: {
                from: null,
                to: null
            },

            // assets
            disabledDatesAsset: null,            
            selectedAssets: [],
            checkedAssets: [],
            checkedAsset: null, // only used when oneAssetLimit is true
            assets: [],

            // patterns
            selectedPatterns: [],
            checkedPatterns: [],
            checkedAllPatterns: false,
            patterns: []
        }
    },

    computed: {
        dateFormat() {
            return "yyyy-MM-dd"
        },
        disabledDatesFrom() {
            return {
                from: this.disabledDatesAsset 
                      ? (this.range.to ? new Date(Math.min(this.range.to, this.disabledDatesAsset.from)) 
                      : this.disabledDatesAsset.from) : this.range.to,
                to: this.disabledDatesAsset ? this.disabledDatesAsset.to : null
            }
        },
        disabledDatesTo() {
            return {
                from: this.disabledDatesAsset ? this.disabledDatesAsset.from : null,
                to: this.disabledDatesAsset 
                    ? (this.range.from ? new Date(Math.max(this.range.from, this.disabledDatesAsset.to)) 
                    : this.disabledDatesAsset.to) : this.range.from
            }
        },
        maxItems() {
            return constants.maxRows
        },
    },

    methods: {
        initData() {
            let data = helper.getAssetsPatternsPickerData(this.$store)
            if (data) {
                ({ timeframe:this.timeframe, selectedAssets:this.selectedAssets, checkedAssets:this.checkedAssets, 
                   checkedAsset:this.checkedAsset, selectedPatterns:this.selectedPatterns, checkedPatterns:this.checkedPatterns, 
                   checkedAllPatterns:this.checkedAllPatterns } 
                = data)
                this.range = { 
                    from: helper.deformatDate(data.range.from),
                    to: helper.deformatDate(data.range.to)
                }
            }
        },

        selectTimeframe(timeframe) {
            this.timeframe = timeframe
            helper.updateStore(this.$store, 'timeframe', this.$t('research.patternLab.timeframes').indexOf(this.timeframe))
            this.$emit('timeframeChanged')
        },

        // selecting asset/patterns
        ddSelectAsset(asset) {
            if (!('id' in asset)) {
                return
            }

            this.ddSelect(asset, asset => asset.id, this.selectedAssets)

            if (this.oneAssetLimit) {
                this.checkedAsset = asset
            } else {
                this.ddSelect(asset, asset => asset.id, this.checkedAssets)
            }
        },
        ddSelectPattern(pattern) {
            if (!('id' in pattern)) {
                return
            }

            this.ddSelect(pattern, pattern => pattern.id, this.selectedPatterns)
            this.ddSelect(pattern, pattern => pattern.id, this.checkedPatterns)

            if (this.checkedAllPatterns) {  // works only in debug - why?
                this.checkedAllPatterns = false
            } else if (this.checkedPatterns.length === this.selectedPatterns.length) {
                this.checkedAllPatterns = true
            }
        },
        ddSelect(item, itemKeySelector, selectedItems) {
            if (!selectedItems.map(itemKeySelector).includes(itemKeySelector(item))) {
                selectedItems.push(item)
            }
        },

        removeAsset(asset) {
            this.selectedAssets.splice(this.selectedAssets.map(sa => sa.symbol).indexOf(asset.symbol), 1);

            // remove also checked asset
            if (this.oneAssetLimit) {
                if (this.checkedAsset && this.checkedAsset.id === asset.id) {
                    if (this.selectedAssets.length) {
                        this.checkedAsset = this.selectedAssets[0]
                    } else {
                        this.checkedAsset = null                    
                    }
                }
            } else if (this.checkedAssets.map(a => a.symbol).includes(asset.symbol)) {                
                this.checkedAssets.splice(this.checkedAssets.map(a => a.symbol).indexOf(asset.symbol), 1)                
            }

            // if only checked asset was removed
            if (!this.checkedAssets.length && this.selectedAssets.length) {
                this.checkedAssets.push(this.selectedAssets[0])                
            }
        },
        updateDisabledDatesAsset() {
            this.disabledDatesAsset = null
            let fromChanged = false
            let toChanged = false
            let checkedAssets = this.oneAssetLimit ? (this.checkedAsset ? [ this.checkedAsset ] : []) : this.checkedAssets

            checkedAssets.forEach(asset => {
                this.$http
                .get(helper.getPatternLabChartUrl(asset, this.timeframe)) // to-do: cache this result !
                .then(response => {
                    let newFrom = new Date(Math.max(...Object.keys(response.data.Close)))    // maximum asset date !                    
                    let newTo = new Date(Math.min(...Object.keys(response.data.Close)))       // minimum asset date !

                    this.disabledDatesAsset = {
                        from: new Date(this.disabledDatesAsset ? Math.min(this.disabledDatesAsset.from, newFrom) : newFrom),
                        to: new Date(this.disabledDatesAsset ? Math.max(this.disabledDatesAsset.to, newTo) : newTo)
                    }
                })
                .catch(error => {
                    console.log(error);
                    
                    if (error.message === constants.strings.errors.networkError) {
                        helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.$t('notifications.beConnectionLost') + '(' + this.$t('sidebar.patternLab') + ')')
                    }
                })
                .finally(() => {
                    if (this.range.from && (this.range.from < this.disabledDatesAsset.to || this.range.from > this.disabledDatesAsset.from)) {
                        this.range.from = this.disabledDatesAsset.to

                        if (!fromChanged) {
                            this.$notify({
                                type: 'warning', 
                                message: this.$t('notifications.fromChanged') + ' (' + this.$t('sidebar.patternLab') + ' ' + this.$t('research.patternLab.chart.title') + ').'
                            })
                            fromChanged = true
                        }
                    }
                    if (this.range.to && (this.range.to > this.disabledDatesAsset.from || this.range.to < this.disabledDatesAsset.to)) {
                        this.range.to = this.disabledDatesAsset.from

                        if (!toChanged) {
                            this.$notify({
                                type: 'warning', 
                                message: this.$t('notifications.toChanged') + ' (' + this.$t('sidebar.patternLab') + ' ' + this.$t('research.patternLab.chart.title') + ').'
                            })
                            toChanged = true
                        }
                    }
                })
            })
        },
        getAssets(query) {
            // to-do: eliminate component's bug - redudant call for selected item
            if (query) {
                this.$http
                .get(constants.urls.patternLab.asset + query)
                .then(response => {
                    this.assets = response.data.results
                                .filter(result => !this.selectedAssets.map(sa => sa.symbol).includes(result.symbol))
                                .map(result => {                                     
                                    return {
                                        id: result.id, 
                                        symbol: result.symbol,
                                        name: result.name ? result.name : result.symbol
                                    }
                                })
                })
                .catch(error => {
                    console.log(error);
                    
                    if (error.message === constants.strings.errors.networkError) {
                        helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.$t('notifications.beConnectionLost') + '(' + this.$t('sidebar.patternLab') + ')')
                    }
                })
                .finally(() => {})
            }
        },

        checkAllPatterns() {
            if (this.checkedAllPatterns) {
                this.checkedPatterns = []
            } else {          
                this.checkedPatterns = this.selectedPatterns          
            }
        },
        getPatterns(query) {
            // to-do: eliminate component's bug - redudant call for selected item        
            if (query) {
                this.$http
                .get(constants.urls.patternLab.pattern + query)
                .then(response => {
                    this.patterns = response.data.filter(result => !this.selectedPatterns.map(sp => sp.name).includes(result.name))
                })
                .catch(error => {
                    console.log(error);
                    
                    if (error.message === constants.strings.errors.networkError) {
                        helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.$t('notifications.beConnectionLost') + '(' + this.$t('sidebar.patternLab') + ')')
                    }
                })
                .finally(() => {})
            }
        },

        btnClick() {
            if ((!this.oneAssetLimit && !this.checkedAssets.length) || (this.oneAssetLimit && !this.checkedAsset)) {
                this.$notify({
                    type: 'warning', 
                    message: this.$t('notifications.addNoAsset') + ' (' + this.$t('sidebar.patternLab') + ' ' + this.title + ').'
                })    

                return
            }
            
            if (!this.checkedPatterns.length) {
                this.$notify({
                    type: 'warning', 
                    message: this.$t('notifications.addNoPattern') + ' (' + this.$t('sidebar.patternLab') + ' ' + this.title + ').'
                })  
            }

            this.$emit('btnClicked')
        }
    },

    mounted() {
      this.initData()
    },

    watch: {
        range: {
            handler(val){
                helper.updateStore(this.$store, 'range', { from: helper.formatDate(val.from, ''), to: helper.formatDate(val.to, '') }) 
            },
            deep: true
        },

        // assets
        selectedAssets(value) {
            helper.updateStore(this.$store, 'selectedAssets', value)            
        },
        checkedAssets(value) {
            helper.updateStore(this.$store, 'checkedAssets', value) 
            this.updateDisabledDatesAsset()
        },
        checkedAsset(value) {
            helper.updateStore(this.$store, 'checkedAsset', value) 
            this.updateDisabledDatesAsset()
        },

        // patterns
        selectedPatterns(value) {
            helper.updateStore(this.$store, 'selectedPatterns', value)            
        },
        checkedPatterns(value) {
            helper.updateStore(this.$store, 'checkedPatterns', value)            
        },
        checkedAllPatterns(value) {
            helper.updateStore(this.$store, 'checkedAllPatterns', value)            
        }
    }
}
</script>
<style>

</style>