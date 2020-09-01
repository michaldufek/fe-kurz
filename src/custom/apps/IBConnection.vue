<template>
    <div>

        <div class="row" style="margin-top: 20px">
            <SlideYUpTransition>

                <card type="secondary"
                    header-classes="bg-white pb-5"
                    body-classes="p-0 px-lg-5 py-lg-5"
                    class="modal-sm animated landingCard"
                    :class="{ shake: isShaking }"
                    v-if="showLogin">
                    <DualRingLoader v-if="loading.status || loading.start || loading.stop" :color="'#54f1d2'" :class="[ connected ? 'loader' : 'loaderDisconnected', 'loader' ]" />
                    <template>
                        <div v-if="!connected" class="text-center text-muted mb-4">
                            {{ `${$t('login.signIn')} ${$t('login.with')} ` }}<b>{{ `${$t('login.IB.title')} ` }}</b>{{ $t('login.IB.credentials') }}
                        </div>
                        <form role="form">
                            <base-input v-if="!connected"
                                        alternative
                                        class="mb-3"
                                        :placeholder="$t('login.username')"
                                        addon-left-icon="ni ni-email-83"
                                        v-model="email"
                                        @keyup.enter="logIn">
                            </base-input>
                            <base-input v-if="!connected"
                                        alternative
                                        type="password"
                                        :placeholder="$t('login.password')"
                                        addon-left-icon="ni ni-lock-circle-open"
                                        v-model="pass"
                                        @keyup.enter="logIn">
                            </base-input>
                            <div class="text-center">
                                <p :class="[ error ? errorClass : noErrorClass , msgClass ]">{{message}}</p>
                            </div>
                            <base-checkbox v-if="!connected" v-model="paper">
                                {{$t('login.IB.paper')}}
                            </base-checkbox>
                            <div class="text-center">
                                <base-button v-if="!connected" type="secondary" class="my-4" @click="logIn">{{$t('login.signIn')}}</base-button>
                                <base-button v-else type="secondary" class="my-4" @click="disconnect">{{$t('login.disconnect')}}</base-button>
                            </div>
                        </form>
                    </template>
                </card>

            </SlideYUpTransition>
        </div>

        <div class="row" v-if="connected" style="margin-top: 20px">
            <ul style="list-style-type: none;">
                <li v-for="log in logsParsed">
                    {{ log }}
                </li>
            </ul>
        </div>

    </div>
</template>
<script>
import { SlideYUpTransition } from "vue2-transitions";
import DualRingLoader from '@bit/joshk.vue-spinners-css.dual-ring-loader';
import '../assets/css/shake.css'

import constants from '@/custom/assets/js/constants'
import helper from '@/custom/assets/js/helper'


export default {
    components: {
        SlideYUpTransition,
        DualRingLoader
    },

    data() {
      return { 
        storeKey: constants.translationKeys.IBLogin,
        logs: [],

        timers: {
            status: null,
            startStatus: null,
            stopStatus: null,
            logs: null
        },
        defaultTimeout: constants.intervals.minute,
        GWTimeoutStartTime: performance.now(),

        loading: {
            status: false,        
            start: false,
            stop: false
        },

        connected: false,
        error: false,
        message: '',
        isShaking: false,

        showLogin: false,
        paper: true,
        email: '',
        pass: '',

        // css classes
        msgClass: 'message',
        noErrorClass: 'noError',
        errorClass: 'error'
      };
    },

    computed: {
        logsParsed() {
            return this.logs.map(log => `[${helper.formatDateTime(log.timestamp)}] ${log.type}: ${log.message}`)
        }
    },

    methods: {
        init() {
            let data = this.$store.getItem(this.storeKey)
            if (data) {
                this.email = data.email
                if (data.loading) {
                    this.loading = data.loading
                    
                    if (this.loading.start) {
                        this.setGWStartStatusInterval(data.remainingGWTimeout)
                    } else if (this.loading.stop) {
                        this.setGWStopStatusInterval(data.remainingGWTimeout)
                    }
                }

                this.setGWStatusInterval()
            }

            this.openLoginModal()
        },

        checkGWrunning() {
            this.loading.status = true

            this.$http
            .get(constants.urls.liveDepl.gateway.status + this.email)
            .then(response => {
                if ('error' in response.data) {
                    this.error = true
                    this.message = response.data.error
                } else {
                    this.connected = response.data.status

                    if (this.connected) {                        
                        this.setGWLogsInterval()

                        if (this.loading.start) {
                            this.loading.start = false
                            this.storeLoading(this.loading)                                 // must store explicitly because redirect is faster than watcher

                            this.$router.replace(this.$route.query.redirect || '/')         // redirect to Dashboard
                        }
                    } else {
                        if (this.loading.stop) {
                            this.loading.stop = false
                            clearInterval(this.timers.stopStatus)
                        }

                        if (this.timers.logs) {
                            clearInterval(this.timers.logs);
                        }
                    }
                }
            })
            .catch(error => {
                console.log(error)
                this.error = true
                this.message = error.message
                this.connected = false
                this.shakeModal()

                if (error.message === constants.strings.errors.networkError) {
                    helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', `${this.$t('login.IB.title')} ${this.$t('login.IB.status')}`)
                }
            })
            .finally(() => this.loading.status = false)
        },

        logIn () {
            if (this.paper) {
                this.startGW()
            } else {
                this.$confirm(this.$t('login.IB.confirmLive'))
                .then(() => {
                    this.startGW()
                })
                .catch(() => {})
            }
        },   
        disconnect() {
            this.stopGW()
        }, 

        startGW() {
            this.loading.start = true

            this.$http
            .post(constants.urls.liveDepl.gateway.start, {
                tradingMode: this.paper ? 'paper' : 'live',
                userid: this.email,
                password: this.pass
            })
            .then(response => {
                this.error = false                
                this.message = response.data.message
                this.pass = ''

                this.setGWStartStatusInterval()
            })
            .catch(error => {
                console.log(error)
                this.error = true
                this.shakeModal()
                this.loading.start = false

                if (error.message === constants.strings.errors.networkError) {
                    helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', `${this.$t('login.IB.title')} ${this.$t('login.IB.login')}`)
                    this.message = error.message
                } else {
                    this.message = error
                }                
            })
        },
        stopGW() {
            this.loading.stop = true

            this.$http
            .post(constants.urls.liveDepl.gateway.stop, { userid: this.email }, this.$store.getItem('headers'))   // authorized because GW doesn't need authorization
            .then(response => {
                this.error = false
                this.message = response.data.message

                this.setGWStopStatusInterval()                
            })
            .catch(error => {
                console.log(error)
                this.error = true
                this.shakeModal()
                this.loading.stop = false

                if (error.message === constants.strings.errors.networkError) {
                    helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', `${this.$t('login.IB.title')} ${this.$t('login.disconnect')}`)
                    this.message = error.message
                } else {
                    this.message = error
                }
            })
        }, 

        setGWTimeout(action, timer, remainingTimeout) {
            setTimeout(() => { 
                this.error = true
                this.message = 'Gateway ' + action + ' timeout.'

                clearInterval(timer)

                if (action == 'start') {
                    this.loading.start = false
                } else if (action == 'stop') {
                    this.loading.stop = false
                }
            }, remainingTimeout && remainingTimeout !== undefined ? remainingTimeout : this.defaultTimeout )

            this.GWTimeoutStartTime = performance.now()
        },      
        
        setGWStatusInterval() {
            helper.setInterval(this.timers, 'status', this.checkGWrunning)
        },
        setGWStartStatusInterval(remainingTimeout=null) {
            helper.setInterval(this.timers, 'startStatus', this.checkGWrunning, constants.intervals.seconds3)
            this.setGWTimeout('start', this.timers.startStatus, remainingTimeout)
        },
        setGWStopStatusInterval(remainingTimeout=null) {
            helper.setInterval(this.timers, 'stopStatus', this.checkGWrunning, constants.intervals.seconds3)
            this.setGWTimeout('stop', this.timers.stopStatus, remainingTimeout)
        },
        setGWLogsInterval() {
            helper.setInterval(this.timers, 'logs', this.getGWLogs)
        },
        destroyTimers() {
            if (this.timers.status) {
                clearInterval(this.timers.status)
            }

            if (this.timers.startStatus) {
                clearInterval(this.timers.startStatus)
            }

            if (this.timers.stopStatus) {
                clearInterval(this.timers.stopStatus)
            }

            helper.updateStore(this.$store, "remainingGWTimeout", this.defaultTimeout - (performance.now() - this.GWTimeoutStartTime), this.storeKey)

            if (this.timers.logs) {
                clearInterval(this.timers.logs)
            }
        },

        getGWLogs() {
            this.loading.status = true

            this.$http
            .get(constants.urls.liveDepl.gateway.logs + this.email, this.$store.getItem('headers'))   // authorized because GW doesn't need authorization
            .then(response => {
                if ('error' in response.data) {      // currently not used in GW Logs response
                    this.error = true
                } else {
                    this.logs = response.data
                }
            })
            .catch(error => {
                console.log(error)
                this.error = true
                this.message = error.message
                this.shakeModal()

                if (error.message === constants.strings.errors.networkError) {
                    helper.notifyAudio(this, document.getElementById('connectionLost'), 'danger', `${this.$t('login.IB.title')} ${this.$t('login.IB.logs')}`)
                }

                if ('type' in error.response.data) {
                    this.message = error.response.data.type + ' error'

                    if ('message' in error.response.data) {
                        this.message += ': ' + error.response.data.message
                    } else {
                        this.message += '.'
                    }
                }
            })
            .finally(() => this.loading.status = false)
        },

        shakeModal(){
            this.isShaking = true
            setTimeout(() => { 
                this.isShaking = false
            }, constants.intervals.shake );
            this.pass = ''
        },
        
        openLoginModal(){
            this.error = false
            this.message = ''
            this.pass = ''

            setTimeout(() => {
                this.showLogin = true  
            }, constants.intervals.loginShow );
        },

        storeLoading(val) {
            let val2store = JSON.parse(JSON.stringify(val))
            helper.updateStore(this.$store, 'loading', val2store, this.storeKey) 
        }
    },

    mounted() {
        this.init()
    },

    beforeDestroy() {
        this.destroyTimers()        
    },    

    watch: {
        email(val) {
            helper.updateStore(this.$store, 'email', val, this.storeKey)            
        },
        loading: {
            handler(val){
                this.storeLoading(val)
            },
            deep: true
        }
    }
}
</script>
<style>
.landingCard {
    margin: auto;
    border-radius: 1rem;
    background: #2f3668;
}

.message {
    white-space: pre-line;
}

.noError {
    color: gray;    
}

.error {
  color: red !important;
}

.loader {
  width: 80px; 
  height: 80px;  
  position: absolute;
  left: 150px;
  top: 10px;
  z-index: 1;
}

.loaderDisconnected {
    top: 60px;
}
</style>