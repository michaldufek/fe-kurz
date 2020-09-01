<template>
  <div class="row">
    <img src="../assets/img/logo2020.png" class="logo" :alt="$t('siteTitle')" style="height: 25%;width: 25%;margin-top: 80px;margin-right: -300px;margin-left: 200px;"/>

    <SlideYUpTransition>
        
        <!-- login -->
        <card type="secondary"
                header-classes="bg-white pb-5"
                body-classes="p-0 px-lg-5 py-lg-5"
                class="modal-sm animated landingCard"
                :class="{ shake: isShaking }"
                v-if="cards.showLogin.value">
            <DualRingLoader v-if="loading" :color="'#54f1d2'" :class="'loader'" style="top: 150px" />
            <template>
            <!--    <div class="text-muted text-center mb-3">
                    {{$t('login.signIn') + " " + $t('login.with')}}
                </div>-->
<!--                <div class="btn-wrapper text-center">
                    <base-button type="secondary" style="width: 40%;">
                        <img src="../assets/img/google-logo-oldschool.png" style="margin-left: -10px">-->
                        <!-- slot="icon" -->
<!--                        &nbsp;&nbsp;Google
                    </base-button>                
                </div>-->
            </template>
            <br/>
            <template>
                <div class="text-center text-muted mb-4">
                    <small>{{$t('login.signInCredentials')}}</small>
                </div>
                <form role="form">
                    <base-input alternative
                                class="mb-3"
                                :placeholder="$t('login.emailExample')"
                                addon-left-icon="ni ni-email-83"
                                v-model="email"
                                @keyup.enter="logIn">
                    </base-input>
                    <base-input alternative
                                type="password"
                                :placeholder="$t('login.password')"
                                addon-left-icon="ni ni-lock-circle-open"
                                v-model="pass"
                                @keyup.enter="logIn">
                    </base-input>
                    <div class="text-center">
                        <p :class="[ error ? errorClass : noErrorClass , msgClass ]">{{message}}</p>                    
                        <base-button v-if="error" style="color: #00f2c3" type="link" @click="resetPass">{{$t('login.resetPass')}}</base-button>
                    </div>
                    <base-checkbox v-model="remember">
                        {{$t('login.remember')}}
                    </base-checkbox>
                    <div class="text-center">
                        <base-button type="secondary" class="my-4" @click="logIn">{{$t('login.signIn')}}</base-button>
                        <small><p style="color: gray;">{{$t('login.lookingTo')}} <a href="#" @click="openRegisterModal">{{$t('login.createAccount')}}</a></p></small>
                    </div>
                </form>
            </template>
        </card>

        <!-- register -->
        <card type="secondary"
                header-classes="bg-white pb-5"
                body-classes="p-0 px-lg-5 py-lg-5"
                class="modal-sm animated landingCard"
                :class="{ shake: isShaking }"
                v-if="cards.showRegister.value">
            <DualRingLoader v-if="loading" :color="'#54f1d2'" :class="'loader'" style="top: 75px" />
            <template>
                <div class="text-center text-muted mb-4">
                    {{$t('login.register') + " " + $t('login.with')}}
                </div>
                <form role="form">
                    <base-input alternative
                                class="mb-3"
                                :placeholder="$t('login.emailExample')"
                                addon-left-icon="ni ni-email-83"
                                v-model="email"
                                @keyup.enter="register">
                    </base-input>
                    <base-input alternative
                                type="password"
                                :placeholder="$t('login.password')"
                                addon-left-icon="ni ni-lock-circle-open"
                                v-model="pass1"
                                @keyup.enter="register">
                    </base-input>
                    <base-input alternative
                                type="password"
                                :placeholder="$t('login.passwordAgain')"
                                addon-left-icon="ni ni-lock-circle-open"
                                v-model="pass2"
                                @keyup.enter="register">
                    </base-input>
                    <div class="text-center">
                        <p :class="[ error ? errorClass : noErrorClass , msgClass ]">{{message}}</p>                    
                        <base-button type="secondary" class="my-4" @click="register">{{$t('login.register')}}</base-button>
                        <small><p style="color: gray;">{{$t('login.alreadyAccount')}} <a href="#" @click="openLoginModal">{{$t('login.login')}}</a></p></small>
                    </div>
                </form>
            </template>
        </card>

        <!-- resetPass -->
        <card type="secondary"
                header-classes="bg-white pb-5"
                body-classes="p-0 px-lg-5 py-lg-5"
                class="modal-sm animated landingCard"
                :class="{ shake: isShaking }"
                v-if="cards.showResetPass.value">
            <DualRingLoader v-if="loading" :color="'#54f1d2'" :class="'loader'" style="top: 50px" />
            <template>
                <div class="text-center text-muted mb-4">
                    {{$t('login.resetPass') + " " + $t('login.with')}}
                </div>
                <form role="form">                    
                    <base-input alternative
                                type="password"
                                :placeholder="$t('login.password')"
                                addon-left-icon="ni ni-lock-circle-open"
                                v-model="pass1"
                                @keyup.enter="resetPassComplete">
                    </base-input>
                    <base-input alternative
                                type="password"
                                :placeholder="$t('login.passwordAgain')"
                                addon-left-icon="ni ni-lock-circle-open"
                                v-model="pass2"
                                @keyup.enter="resetPassComplete">
                    </base-input>
                    <div class="text-center">
                        <p :class="[ error ? errorClass : noErrorClass , msgClass ]">{{message}}</p>                    
                        <base-button type="secondary" class="my-4" @click="resetPassComplete">{{$t('login.resetPass')}}</base-button>
                        <div class="text-center">
                            <p v-if="error" style="color: gray;">{{$t('login.lookingTo')}} <a href="#" @click="openRegisterModal">{{$t('login.createAccount')}}</a></p>
                            <p style="color: gray;"><a href="#" @click="openLoginModal">{{$t('login.login')}}</a></p>
                        </div>                                         
                    </div>
                </form>
            </template>
        </card>

        <!-- Verify Register -->
        <card type="secondary"
                header-classes="bg-white pb-5"
                body-classes="p-0 px-lg-5 py-lg-5"
                class="modal-sm animated landingCard"
                :class="{ shake: isShaking }"
                v-if="cards.showVerifyRegister.value">
            <DualRingLoader v-if="loading" :color="'#54f1d2'" :class="'loader'" />
            <template>
                <form role="form">                    
                    <div class="text-center">
                        <h4 :class="[ error ? errorClass : noErrorClass , msgClass ]">{{message}}</h4>   
                        <p v-if="error" style="color: gray;">{{$t('login.lookingTo')}} <a href="#" @click="openRegisterModal">{{$t('login.createAccount')}}</a></p>           
                        <p style="color: gray;"><a href="#" @click="openLoginModal">{{$t('login.login')}}</a></p>
                    </div>
                </form>
            </template>
        </card>
    </SlideYUpTransition>
  </div>
</template>
<script>
import { SlideYUpTransition } from "vue2-transitions";
import DualRingLoader from '@bit/joshk.vue-spinners-css.dual-ring-loader';
import auth from '@/custom/assets/js/auth'
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
        cards: {
            showLogin: { value: false },
            showRegister: { value: false },
            showResetPass: { value: false },
            showVerifyRegister: { value: false }
        },
        loading: false,

        email: '',
        pass: '',
        pass1: '',
        pass2: '',
        remember: true,
        error: false,
        message: '',
        isShaking: false,

        // css classes
        msgClass: 'message',
        noErrorClass: 'noError',
        errorClass: 'error'
      };
    },
    methods: {
        init() {
            if (!('remember' in localStorage)) {
                localStorage.setItem('remember', true)
            } 
            this.remember = JSON.parse(localStorage.remember)

            auth.setCSRFToken()

            if (process.env.NODE_ENV !== 'production') {
                console.log('In Dev Mode')
            }
        },

        logIn () {
            this.loading = true
            auth.login(this.email, this.pass, () => this.loading = false, (loggedIn, err) => {
                this.error = !loggedIn
                if (!loggedIn) {                    
                    this.shakeModal()
                    this.message = err
                } else {
                    auth.setCSRFToken()
                    this.$store.setItem('headers', {
                        headers: {
                            "Authorization": `Basic ${window.btoa(`${this.email}:${this.pass}`)}`
                        }
                    })
                    helper.updateStore(this.$store, 'email', this.email, 'login')
                    
                    this.$router.replace(this.$route.query.redirect || '/')
                }
            })
        },
        resetPass () {
            this.loading = true
            auth.resetPass(this.email, () => this.loading = false, (resetted, msg) => {
                this.error = !resetted
                if (!resetted) {
                    this.shakeModal()
                }
                this.message = msg
            })
        },
        resetPassComplete() {
            this.loading = true
            auth.verifyReset(this.$route.params.uid, this.$route.params.token, this.pass1, this.pass2, () => this.loading = false, (success, msg) => {
                this.error = !success
                if (!success) {
                    this.shakeModal()
                }
                this.message = msg
            })
        },
        register () {
            this.loading = true
            auth.register(this.email, this.pass1, this.pass2, () => this.loading = false, (registered, msg) => {
                this.error = !registered
                if (!registered) {
                    this.shakeModal()                    
                }
                this.message = msg
            })
        },

        shakeModal(){
            this.isShaking = true
            setTimeout(() => { 
                this.isShaking = false
            }, constants.intervals.shake );
            this.pass = ''
        },
        
        openLoginModal(){
            this.openModal(this.cards.showLogin)
        },
        openResetPassModal(){
            this.openModal(this.cards.showResetPass)
        },
        openRegisterModal(){
            this.openModal(this.cards.showRegister)
        },
        openVerifyRegisterModal(success){
            let msg = ''

            if (success) {
                msg = this.$i18n.t('login.registerSuccess')
            } else {
                this.shakeModal()
                msg = this.$i18n.t('login.registerFail')
            }
            
            this.openModal(this.cards.showVerifyRegister, msg, !success)
        },
        openResetPassModal(){
            this.openModal(this.cards.showResetPass)
        },
        openModal(card, msg, err){
            for (var otherCard in this.cards) {
                if (this.cards.hasOwnProperty(otherCard)) {           
                    this.cards[otherCard].value = false
                }
            }

            this.error = err ? err : false
            this.message = msg
            this.email = ''
            this.pass1 = ''
            this.pass2 = ''

            setTimeout(() => {
                card.value = true  
            }, constants.intervals.loginShow );
        }
    },
    mounted() {
        this.init()

        if ("key" in this.$route.params) {
            this.loading = true
            auth.verifyRegister(this.$route.params.key, (success) => {  
                this.openVerifyRegisterModal(success)
            }, () => this.loading = false)
        } else if ("uid" in this.$route.params && "token" in this.$route.params) {
            this.openResetPassModal()
        } else {
            auth.logout()
            this.$router.replace(this.$route.query.redirect || '/login')
            this.openLoginModal();
        }
    },
    watch: {
        remember(val) {
            localStorage.setItem('remember', val)
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
}
</style>
