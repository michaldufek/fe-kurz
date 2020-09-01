/* globals localStorage */
import axios from '@/../node_modules/axios';
import i18n from "@/i18n"
import Cookies from 'js-cookie'
import constants from '@/custom/assets/js/constants';


const loginRoutine = (email, pass) => new Promise ((resolve, reject) => {
  axios({url: constants.urls.auth + '/login/', data: { "email": email, "password": pass }, method: 'POST' })
  .then(resp => {
    const token = resp.data.key
    localStorage.setItem('token', token) // store the token in localstorage
    resolve(resp)
  })
  .catch(err => {
    localStorage.removeItem('token') // if the request fails, remove any possible user token if possible
    reject(err)
  })
});

const loginFacebookRoutine = (token, code) => new Promise ((resolve, reject) => {
  axios({url: constants.urls.auth + '/facebook/', data: { "access_token": token, "code": code }, method: 'POST' })
  .then(resp => {
    const token = resp.data.token
    localStorage.setItem('token', token) // store the token in localstorage
    resolve(resp)
  })
  .catch(err => {
    localStorage.removeItem('token') // if the request fails, remove any possible user token if possible
    reject(err)
  })
});

const loginTwitterRoutine = (token, secret) => new Promise ((resolve, reject) => {
  axios({url: constants.urls.auth + '/twitter/', data: { "access_token": token, "token_secret": secret }, method: 'POST' })
  .then(resp => {
    const token = resp.data.token
    localStorage.setItem('token', token) // store the token in localstorage
    resolve(resp)
  })
  .catch(err => {
    localStorage.removeItem('token') // if the request fails, remove any possible user token if possible
    reject(err)
  })
});

const logoutRoutine = () => new Promise ((resolve, reject) => {
  localStorage.removeItem('token')

  axios({url: constants.urls.auth + '/logout/', method: 'POST' })
  .then(resp => {
    resolve(resp)
  })
  .catch(err => {
    reject(err)
  })
});

const resetPassRoutine = email => new Promise ((resolve, reject) => {
  axios({url: constants.urls.auth + '/password/reset/', data: { "email": email }, method: 'POST' })
  .then(resp => {
    resolve(resp)
  })
  .catch(err => {
    reject(err)
  })
});

const registerRoutine = (email, pass1, pass2) => new Promise ((resolve, reject) => {
  axios({url: constants.urls.auth + '/registration/', data: { "email": email, "password1": pass1, "password2": pass2 }, method: 'POST' })
  .then(resp => {
    resolve(resp)
  })
  .catch(err => {
    reject(err)
  })
});

const verifyRegisterRoutine = key => new Promise ((resolve, reject) => {
  axios({url: constants.urls.auth + '/registration/verify-email/', data: { "key": key }, method: 'POST' })
  .then(resp => {
    resolve(resp)
  })
  .catch(err => {
    reject(err)
  })
});

const verifyResetRoutine = (uid, token, pass1, pass2) => new Promise ((resolve, reject) => {
  axios({url: constants.urls.auth + '/password/reset/confirm/', data: { "new_password1": pass1, "new_password2": pass2, "uid": uid, "token": token }, method: 'POST' })
  .then(resp => {
    resolve(resp)
  })
  .catch(err => {
    reject(err)
  })
});


export default {  
    setCSRFToken() {
      if (process.env.NODE_ENV === 'production') {
        var cokieName = 'csrftoken'
      } else {
        cokieName = '_xsrf'
      }

      let csrfToken = Cookies.get(cokieName)        
      axios.defaults.headers.common = {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': csrfToken
      }
    },
  
    login (email, pass, callbackFinally, callback) {
      if (localStorage.token) {
        if (callback) callback(true)
        return
      }
      
      let ignoreFinally = false

      loginRoutine(email, pass)
      .then(() => {
        if (callback) callback(true)
      })
      .catch(err => {
        if (this.handleError(err, () => this.login(...arguments), callback)) {
          ignoreFinally = true
        }
      })
      .finally(() => {
        if (!ignoreFinally) {
          localStorage.removeItem('reloads')
          callbackFinally()
        }
      })
    },

    loginFacebook (callback) {
      if (localStorage.token) {
        if (callback) callback(true)
        return
      }

      let token = ''
      let code = ''    
      // to-do: get token and code
      loginFacebookRoutine(token, code)
      .then(() => {
        if (callback) callback(true)
      })
      .catch(err => this.handleError(err, () => this.loginFacebook(...arguments), callback))
    },

    loginTwitter (callback) {
      if (localStorage.token) {
        if (callback) callback(true)
        return
      }

      let token = ''
      let secret = ''
      // to-do: get token and secret
      loginTwitterRoutine(token, secret)
      .then(() => {
        if (callback) callback(true)
      })
      .catch(err => this.handleError(err, () => this.loginTwitter(...arguments), callback))
    },
  
    getToken () {
      return localStorage.token
    },
  
    logout (callback) {
      if (this.loggedIn()) {
        logoutRoutine()
        .then(() => {
          if (callback) callback()
        })
      }
    },
  
    loggedIn () {
      return !!localStorage.token
    },

    resetPass (email, callbackFinally, callback) {
      let ignoreFinally = false

      resetPassRoutine(email)
      .then(res => {
        if (callback) callback(true, res.data.detail)
      })
      .catch(err => {
        if (this.handleError(err, () => this.resetPass(...arguments), callback)) {
          ignoreFinally = true
        }
      })
      .finally(() => {
        if (!ignoreFinally) {
          localStorage.removeItem('reloads')
          callbackFinally()
        }
      })
    },

    verifyReset (uid, token, pass1, pass2, callbackFinally, callback) {
      let ignoreFinally = false

      verifyResetRoutine(uid, token, pass1, pass2)
      .then(res => {
        if (callback) callback(true, res.data.detail)
      })
      .catch(err => {
        if (this.handleError(err, () => this.verifyReset(...arguments), callback)) {
          ignoreFinally = true
        }
      })
      .finally(() => {
        if (!ignoreFinally) {
          localStorage.removeItem('reloads')
          callbackFinally()
        }
      })
    },

    register (email, pass1, pass2, callbackFinally, callback) {
      let ignoreFinally = false

      registerRoutine(email, pass1, pass2)
      .then(res => {
        if (callback) callback(true, i18n.t('login.registrationSent'))
      })
      .catch(err => {
        if (this.handleError(err, () => this.register(...arguments), callback)) {
          ignoreFinally = true
        }
      })
      .finally(() => {
        if (!ignoreFinally) {
          localStorage.removeItem('reloads')
          callbackFinally()
        }
      })
    },

    verifyRegister (key, callback, callbackFinally) {
      verifyRegisterRoutine(key)
      .then(res => {
        if (callback) callback(true)
      })
      .catch(err => {
        if (this.handleError(err, () => this.verifyRegister(...arguments), callback)) {
          ignoreFinally = true
        }
      })
      .finally(() => {
        if (!ignoreFinally) {
          localStorage.removeItem('reloads')
          callbackFinally()
        }
      })
    },
    
    handleError(error, callerMethod, callback){
      let errMsg = this.parseError(error)

      if (!('reloads' in localStorage)) {
        localStorage.setItem('reloads', 0)
      }

      if (errMsg.includes(constants.strings.errors.CSRF) && Number(localStorage.reloads) < 5) {
        localStorage.setItem('reloads', Number(localStorage.reloads) + 1)
        console.log(errMsg + i18n.t('login.tryingAgain'))
        callerMethod()
        return true
      } else {
        if (callback) callback(false, errMsg)
      }
    },

    parseError(err, verbose=true) {
      let msg = ''

      if ("email" in err.response.data) {
        if (verbose) {
          msg += i18n.t('login.email') + ': ' 
        }
        msg += err.response.data.email[0] + '\n'
      }
      if ("password" in err.response.data) {
        if (verbose) {
          msg += i18n.t('login.password') + ': ' 
        }
        msg += err.response.data.password[0] + '\n'
      }
      if ("password1" in err.response.data) {
        if (verbose) {
          msg += i18n.t('login.password') + ': ' 
        }
        msg += err.response.data.password1[0] + '\n'
      }
      if ("password2" in err.response.data) {
        if (verbose) {
          msg += i18n.t('login.passwordAgain') + ': ' 
        }
        msg += err.response.data.password2[0] + '\n'
      }
      if ("new_password1" in err.response.data) {
        if (verbose) {
          msg += i18n.t('login.password') + ': ' 
        }
        msg += err.response.data.new_password1[0] + '\n'
      }
      if ("new_password2" in err.response.data) {
        if (verbose) {
          msg += i18n.t('login.passwordAgain') + ': ' 
        }
        msg += err.response.data.new_password2[0] + '\n'
      }
      if ("non_field_errors" in err.response.data) {
        msg += err.response.data.non_field_errors[0] + '\n'
      }
      if ("detail" in err.response.data) {
        if (err.response.data.detail === constants.strings.errors.CSRF) {
	        this.setCSRFToken()
        }

        msg += err.response.data.detail + '\n'
      }
      if (!msg) {
        msg += i18n.t('errors.unknownError')
      }
      
      return msg
    }
  }  
