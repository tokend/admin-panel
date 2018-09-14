/* Vue */
import Vue from 'vue'
import router from './router'
import store from './store'
import VueResource from 'vue-resource'
Vue.use(VueResource)
import { Crypto } from 'webcrypto-liner/src/crypto.ts'
import asmCrypto from 'asmcrypto.js'

import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'
import ravenConfig from './raven_config'

/* filters */
import {
  filterAccountType,
  filterDateWithTime,
  localizeIssuanceRequestState,
  adminSignerType,
  getAdminSignerTypeLabel
} from './components/App/filters/filters'

if (process.env.NODE_ENV === 'production') {
  Vue.config.devtools = false
  Vue.config.debug = false
  Vue.config.silent = true
  Vue.config.productionTip = false
}

// NOTE: temporarily disabled
// Sentry integration
if (false && process.env.SENTRY_DSN) {
  Raven.config(process.env.SENTRY_DSN, ravenConfig)
    .addPlugin(RavenVue, Vue)
    .install()
  // wrap console.error to capture exceptions
  const logger = console.error
  console.error = (...args) => {
    Raven.captureException(...args)
    logger(...args)
  }
}

/* adding polyfill to allow encryption on safari */
if (window.crypto && !window.crypto.subtle) {
  window.polyCrypto = new Crypto()
  window.asmCrypto = asmCrypto
} else if (!window.crypto) {
  window.crypto = new Crypto()
}

Object.isEmpty = function (obj) {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false
    }
  }

  return JSON.stringify(obj) === JSON.stringify({})
}

/* App sass */
import './assets/style/app.scss'

/* App component */
import App from './components/App/App.vue'

/* Create and Mount our Vue instance */
new Vue({
  // Attach the Vue instance to the window,
  // so it's available globally.
  created: function () {
    window.vue = this
  },
  router,
  store,
  template: '<App/>',
  components: { App }
}).$mount('#app')

import moment from 'moment'
import StellarBase from 'tokend-js-sdk'
import { Validator } from 'vee-validate'

Validator.installDateTimeValidators(moment)
Validator.extend('accountId', {
  getMessage: field => 'The ' + field + ' invalid.',
  validate: value => StellarBase.Keypair.isValidPublicKey(value)
})

/* Vue plugins */
import Auth from './auth'
import api from './api'
import params from './config'
import VeeValidate from 'vee-validate'

Vue.use(Auth)
Vue.use(params)
Vue.use(VeeValidate)
Vue.use(api)

/* Vue filters */

Vue.filter('accountType', filterAccountType)
Vue.filter('dateTime', filterDateWithTime)
Vue.filter('localizeIssuanceRequestState', localizeIssuanceRequestState)
Vue.filter('adminSignerType', adminSignerType)
Vue.filter('getAdminSignerTypeLabel', getAdminSignerTypeLabel)
