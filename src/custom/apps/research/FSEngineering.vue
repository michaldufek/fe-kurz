<template>
<div>

    <div class="row">
        <!-- select backtest -->
        <span>{{ $t(storeKey + '.selectBacktest') }}</span>
        <base-dropdown class="dd" 
                        menu-classes="dropdown-black" 
                        title-classes="btn btn-secondary"
                        :title="selectedBacktest ? selectedBacktest.name : null"
                        style="width: auto">
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

    <div class="row" style="margin">
        <!-- available models checkboxes       -->
        <card class="col-lg-3 col-12 container">
            <h4>{{ $t(storeKey + '.models') }}</h4>
            <base-checkbox v-for="model in models" :key="models.model">
                {{ $t(storeKey + model) }}
            </base-checkbox>     
        </card>
        
        <!-- date pickers -->
        <card class="col-lg-3 col-12 container">
            <h4>{{ $t('research.period') }}</h4>
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

        
        <!-- modeling results -->
        <card class="col-lg-3 col-12 container">
            <h4>{{ $t(storeKey + '.modelResults') }}</h4>
            <!-- <div>
                <b-table striped hover :results="results"></b-table>
            </div> -->
        </card>

        <!-- run button  -->
         <div>
            <base-button native-type="submit" type="secondary" @click="runClick" style="margin-right: auto; margin-left:auto;">{{ runText }}</base-button>
        </div>
    </div>

    <!-- Results block-->   

    <div class="row">
        <!-- equity curve -->
        <div class="col-md">
            <fancy-chart :title="$t(storeKey + '.equityCurve')"
                         :showTitle='true'  
                        :apiUrls="[tsModelEqUrl]">
            </fancy-chart>
        </div>

         <!-- drawdown curve -->
        <div class="col-md">
            <fancy-chart :title="$t(storeKey + '.drawDown')"
                         :showTitle='true'  
                        :apiUrls="[tsModelDDUrl]">
            </fancy-chart>
        </div>
          
        <!-- save button  -->
        <div>
            <base-button native-type="submit" type="secondary" @click="saveClick">{{ $t('research.save') }}</base-button>
        </div>
    </div>

</div>

</template>
<script>
import Datepicker from 'vuejs-datepicker';
import FancyTable from '@/custom/components/Tables/FancyTable';
import FancyChart from '@/custom/components/Charts/FancyChart';
import FancyCard from '@/custom/components/Cards/FancyCard';


import helper from '@/custom/assets/js/helper';
import constants from '@/custom/assets/js/constants';


export default {
    components: {  
      Datepicker,
      FancyTable,
      FancyChart,
      FancyCard 
    },

    props: {
        title: {
            type: String,
            description: "Chart title"
        },
        apiUrlDD: {
            type: Array,
            default: () => [],
            description: "URL to drawdown API"
        }
    },
    data() {
        return {
            storeKey: 'research.fsengineering',

            backtestsNames: [],
            selectedBacktest: null,
            models:['.basic', '.hmm', '.hmm2', '.svjd', '.svjd2', '.cot'],         
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
            updateKey: 0,
            // results: ['AR_In', 'AR_Out', 'AR_Out1']
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

        tsModelEqUrl() {
            return constants.urls.chart['MF Report']
        },
        tsModelDDUrl() {
            return constants.urls.chart['UVXY Report']
        }
    },

    methods: {
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

        },
        stop() {
            this.running = false
        },
    },

    mounted() {
        
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

.container {
    padding-right: auto;
    padding-left: auto;
    margin-right: 2%;
    margin-left: 2%;
}
</style>