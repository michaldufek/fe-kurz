<template>
<div>

    <div class="row">
        <!-- select backtest -->
        <span style="float: left; margin: 8px 15px 30px 30px">{{ $t(storeKey + '.selectBacktest') }}</span>
        <base-dropdown class="dd" 
                        menu-classes="dropdown-black" 
                        title-classes="btn btn-secondary"
                        :title="selectedBacktest ? selectedBacktest.name : null"
                        style="width: 20%">
            <ul style="list-style-type: none;">
                <li v-for="bt in btNamesFiltered" :key="bt.id">            
                    <a class="dropdown-item" 
                        @click="selectBacktest(bt)" 
                        href="#">
                        {{ bt.name }}
                    </a>
                </li>
            </ul>
        </base-dropdown>    
    </div>

    <div class="row">
        <!-- parameters checkboxes       -->
        <card class="col-lg-3 col-12 container">
            <h4>{{ $t(storeKey + '.parameters') }}</h4>
            <base-checkbox v-model="profitTarget.checked">
                {{ $t(storeKey + '.profitTarget') }}
            </base-checkbox>
            <base-checkbox v-model="stopLoss.checked">
                {{ $t(storeKey + '.stopLoss') }}
            </base-checkbox>
        </card>

        <!-- date pickers -->
        <card class="col-lg-3 col-12 container">
            <h4>{{ $t(storeKey + '.period') }}</h4>
            <div class="controls">
                <table class="table tablesorter">
                    <tbody>
                        <tr>
                            <!-- <slot :row="item"> -->
                            <td class="fullpicker" style="border-top: 0px;">
                                {{ $t('research.from') }}<br>
                                <datepicker v-model="period.from" 
                                            :clear-button="true" 
                                            :format="dateFormat" 
                                            :placeholder="$t('research.pickDate')" />
                            </td>
                            <!-- </slot> -->
                        </tr>
                        <tr>
                            <!-- <slot :row="item"> -->
                            <td class="fullpicker" style="border-top: 0px;">
                                {{ $t('research.to') }}<br>
                                <datepicker v-model="period.to" 
                                            :clear-button="true" 
                                            :format="dateFormat" 
                                            :placeholder="$t('research.pickDate')" />
                            </td>
                            <!-- </slot> -->
                        </tr>
                    </tbody>
                </table>
            </div>
        </card>

        <!-- Profit Target range -->
        <card v-if="profitTarget.checked" class="col-lg-3 col-md-12 container">
            <h4>{{ $t(storeKey + '.profitTarget') + ' ' + $t(storeKey + '.range') }}</h4>

            <table>
                <tr>
                    <td style="width: 50%">
                        <p>{{ $t('research.from') }}</p>
                    </td>
                    <td>
                        <base-input alternative
                                    type="text"
                                    v-model="profitTarget.from"
                                    :placeholder="$t('number')">
                        </base-input>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>{{ $t('research.to') }}</p>
                    </td>
                    <td>
                        <base-input alternative
                                    type="text"
                                    v-model="profitTarget.to"
                                    :placeholder="$t('number')">
                        </base-input>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>{{ $t(storeKey + '.step') }}</p>
                    </td>
                    <td>
                        <base-input alternative
                                    type="text"
                                    v-model="profitTarget.step"
                                    :placeholder="$t('number')">
                        </base-input>
                    </td>
                </tr>
            </table>
        </card>

        <!-- Stop Loss range -->
        <card v-if="stopLoss.checked" class="col-lg-3 col-md-12 container">
            <h4>{{ $t(storeKey + '.stopLoss') + ' ' + $t(storeKey + '.range') }}</h4>

            <table>
                <tr>
                    <td style="width: 50%">
                        <p>{{ $t('research.from') }}</p>
                    </td>
                    <td>
                        <base-input alternative
                                    type="text"
                                    v-model="stopLoss.from"
                                    :placeholder="$t('number')">
                        </base-input>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>{{ $t('research.to') }}</p>
                    </td>
                    <td>
                        <base-input alternative
                                    type="text"
                                    v-model="stopLoss.to"
                                    :placeholder="$t('number')">
                        </base-input>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>{{ $t(storeKey + '.step') }}</p>
                    </td>
                    <td>
                        <base-input alternative
                                    type="text"
                                    v-model="stopLoss.step"
                                    :placeholder="$t('number')">
                        </base-input>
                    </td>
                </tr>
            </table>
        </card>

        <!-- estimated time of run -->

    </div>
    <!-- run button -->
    <div class="row">
    <div class="col-12 flex-stretch" style="margin-bottom:1em; text-align:center;">
        <div class="flex-middle">
            <h4 :class="[ warnEstimated ? 'warning' : 'noWarning' ]">{{ $t(storeKey + '.estimatedTime') + ' ' + estimated + ' .' }}</h4>
            <base-button native-type="submit" type="secondary" @click="runClick" style="margin-right: auto; margin-left:auto;">{{ runText }}</base-button>
        </div>
    </div>
    </div>

    <div class="row">
        <!-- results table -->
        <div class="col-lg-8 col-md-12">
            <fancy-table :title="$t(storeKey + '.results.title')"
                        :showTitle="true"
                        :columns="$t(storeKey + '.results.columns')">
                        <!-- :interval="tableInterval" > -->
            </fancy-table>
            <!-- save button -->
            <base-button native-type="submit" type="secondary" @click="saveClick">{{ $t('research.save') }}</base-button>
        </div>

        <!-- results chart -->
        <div class="col-lg-3 col-md-12 container">
            <fancy-chart :title="$t(storeKey + '.results.chart')" />
        </div>
    </div>

</div>
</template>
<script>
import Datepicker from 'vuejs-datepicker';
import FancyTable from '@/custom/components/Tables/FancyTable';
import FancyChart from '@/custom/components/Charts/FancyChart';

import helper from '@/custom/assets/js/helper';
// import constants from '@/custom/assets/js/constants';


export default {
    components: {  
      Datepicker,
      FancyTable,
      FancyChart 
    },

    data() {
        return {
            storeKey: 'research.optimization.parameterSweep',

            backtestsNames: [],
            selectedBacktest: null,
            profitTarget: {
                checked: true,
                from: null,
                to: null,
                step: null
            },
            stopLoss: {
                checked: true,
                from: null,
                to: null,
                step: null
            },
            period: {
                from: null,
                to: null
            },

            estimated: '5.5 hours',
            warnEstimated: false,
            running: false,

            updateKey: 0
        }
    },

    computed: {
        btNamesFiltered() {
            return this.selectedBacktest ? this.backtestsNames.filter(bt => bt.id !== this.selectedBacktest.id) : this.backtestsNames
        },

        dateFormat() {
            return "yyyy-MM-dd"
        },

        runText() {
            return this.running ? this.$t(this.storeKey + '.stop') : this.$t(this.storeKey + '.run')
            // return this.running ? this.$t('research.stop') : this.$t(this.storeKey + '.run')
        },

        // tableInterval() {
        //     return constants.intervals.featEngReload
        // }
    },

    methods: {
        initData() {
            ({ backtestsNames:this.backtestsNames, selectedBacktest:this.selectedBacktest, updateKey:this.updateKey } = helper.getBacktestsNames(this.$store, this.storeKey, this.updateKey))

            let splitted = this.estimated.split(' ')
            this.warnEstimated = this.estimated && splitted[0] > 5 && splitted[1] === 'hours'
        },

        runClick() {
            if (this.running) {
                this.stop()
            } else {
                if (this.warnEstimated) {
                    this.$confirm(this.$t(this.storeKey + '.estimatedTime') + ' ' + this.$t(this.storeKey + '.confirmEstimated'))
                    .then(() => {
                        this.run()
                    })
                    .catch(() => {})

                    return
                }
                
                this.run()
            }
        },
        saveClick() {},

        run() {
            this.running = true

            // let data = {}
            // if (this.period.from) {
            //     data['start_date'] = this.period.from
            // }
            // if (this.period.to) {
            //     data['finish_date'] = this.period.to
            // }
            // if (this.profitTarget.checked) {
            //     if (this.profitTarget.from) {
            //         data['profit_take_start'] = this.profitTarget.from
            //     }
            //     if (this.profitTarget.to) {
            //         data['profit_take_stop'] = this.profitTarget.to
            //     }
            //     if (this.profitTarget.step) {
            //         data['profit_take_step'] = this.profitTarget.step
            //     }
            //     // "profit_take_unit": "USD",
            // }
            // if (this.stopLoss.checked) {
            //     if (this.stopLoss.from) {
            //         data['stop_loss_start'] = this.stopLoss.from
            //     }
            //     if (this.stopLoss.to) {
            //         data['stop_loss_stop'] = this.stopLoss.to
            //     }
            //     if (this.stopLoss.step) {
            //         data['stop_loss_step'] = this.stopLoss.step
            //     }
            //     // "stop_loss_unit": "USD"
            // }
            // // "origin_result": 0,

            // this.$http
            // .post(constants.urls.featEng.sweepRequest, data)
            // .then(_ => this.running = true)
            // .catch(error => {
            //     console.log(error);
            //     if (error.message === constants.strings.errors.networkError) {
            //         helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', this.errorTitle)
            //     }
            // })
        },
        stop() {
            this.running = false
        }
    },

    mounted() {
        this.initData()
    },

    watch: {
      selectedBacktest(val) {        
        helper.updateStore(this.$store, 'selectedBacktest', val, this.storeKey)
      }
    },
}
</script>
<style scoped>
.warning {
    text-align: center;
    color: #66ffba;
}

.noWarning {
    text-align: center;
    color: white
}
</style>