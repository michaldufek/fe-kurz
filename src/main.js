/*
 =========================================================
 * Vue Black Dashboard - v1.1.0
 =========================================================

 * Product Page: https://www.creative-tim.com/product/black-dashboard
 * Copyright 2018 Creative Tim (http://www.creative-tim.com)

 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 */
import Vue from "vue";
import VueRouter from "vue-router";
import RouterPrefetch from 'vue-router-prefetch'
import App from "./App";
// TIP: change to import router from "./router/starterRouter"; to start with a clean layout
import router from "./router/index";
import VueSimpleAlert from "vue-simple-alert";

import BlackDashboard from "./plugins/blackDashboard";
import i18n from "./i18n"

import './registerServiceWorker'
import helper from '@/custom/assets/js/helper';
import constants from '@/custom/assets/js/constants';
import auth from '@/custom/assets/js/auth'
import Axios from 'axios'
// workaround for strange axios TypeError: ..get(...).then(...).catch(...).finally is not a function
const promiseFinally = require('promise.prototype.finally');
promiseFinally.shim();

Vue.use(BlackDashboard);
Vue.use(VueRouter);
Vue.use(RouterPrefetch);
Vue.use(VueSimpleAlert);

// global filter on the Vue instance
Vue.filter(helper.roundToFixed.name, helper.roundToFixed)
Vue.filter(helper.chartUpdateTsText.name, helper.chartUpdateTsText)

auth.setCSRFToken()

// axios get routine with automatic offline detection and fabrication
// const getRoutine = (url) => new Promise ((resolve, reject) => {
//   let response = {}
//   Axios
//   .get(url)
//   .then(resp => response = resp)
//   .catch(error => {
//     if (url) {
//       response = {
//         data: null
//       }
//     }

//     if (true) {
//       console.log('Fabricating data for ' + url + '... (' + error + ')')
//     } else {  // cannot fabricate data
//       reject(error)
//     }
//   })
//   .finally(() => resolve(response))
// })
const getOfflineRoutine = url => new Promise ((resolve, __) => {
  let data = null
  if (url.includes(constants.urls.patternLab.asset)) {
    data = {
              results: [{
                id: 0, 
                symbol: 'symbol',
                name: 'name'
              },
              {
                id: 1, 
                symbol: 'symbol2',
                name: 'name2'
              }]
            }
  } else if (url.includes(constants.urls.patternLab.pattern)) {
    data = [{
              id: 0,
              name: 'pattern'
            },
            {
              id: 1,
              name: 'pattern2'
            }]
  }

  resolve({
    data: data
  })
})
const getOnlineRoutine = (url, config) => new Promise ((resolve, reject) => {
  let response = {}
  Axios
  .get(url, config)
  .then(resp => response = resp)
  .catch(error => reject(error))
  .finally(() => resolve(response))
})
const postOnlineRoutine = (url, data, config) => new Promise ((resolve, reject) => {
  let response = {}
  Axios
  .post(url, data, config)
  .then(resp => response = resp)
  .catch(error => reject(error))
  .finally(() => resolve(response))
})
const putOnlineRoutine = (url, data, config) => new Promise ((resolve, reject) => {
  let response = {}
  Axios
  .put(url, data, config)
  .then(resp => response = resp)
  .catch(error => reject(error))
  .finally(() => resolve(response))
})
const patchOnlineRoutine = (url, data, config) => new Promise ((resolve, reject) => {
  let response = {}
  Axios
  .patch(url, data, config)
  .then(resp => response = resp)
  .catch(error => reject(error))
  .finally(() => resolve(response))
})
const deleteOnlineRoutine = (url, config) => new Promise ((resolve, reject) => {
  let response = {}
  Axios
  .delete(url, config)
  .then(resp => response = resp)
  .catch(error => reject(error))
  .finally(() => resolve(response))
})
const offline = false
Vue.prototype.$http = {
  get(url, config) {
    if (offline) {
      console.log('Offline. Fabricating data for ' + url + ' ...')
      var getRoutine = getOfflineRoutine
    } else {
      getRoutine = getOnlineRoutine
    }

    return getRoutine(url, config)
  },
  post(url, data, config) {
    return postOnlineRoutine(url, data, config)
  },
  put(url, data, config) {
    return putOnlineRoutine(url, data, config)
  },
  patch(url, data, config) {
    return patchOnlineRoutine(url, data, config)
  },
  delete(url, config) {
    return deleteOnlineRoutine(url, config)
  }
}

Vue.prototype.$store = {
  setItem(key, value) {
    if (value instanceof Array || value instanceof Object) {
      value = JSON.stringify(value)
    }
    localStorage.setItem(key, value)
  },
  getItem(key) {
    return JSON.parse(localStorage.getItem(key))    
  },
  removeItem(key) {
    localStorage.removeItem(key)
  }
}

/* eslint-disable no-new */
new Vue({
  router,
  i18n,
  render: h => h(App)
}).$mount("#app");