/* Vue */
import Vue from 'vue'
import router from './router'
import store from './store'
import VueResource from 'vue-resource'

/* App sass */
import './assets/style/app.scss'

/* App component */
import App from './components/App/App.vue'

/* Vue plugins */
import Auth from './auth'
import params from './config'
import Vuelidate from 'vuelidate'
import moment from 'moment'

import { i18n } from '@/i18n'

/* Error tracker util */
import { ErrorTracker } from '@/utils/ErrorTracker'
import log from 'loglevel'

/* Vue filters */
import {
  filterDateWithTime,
  localizeIssuanceRequestState,
  cropAddress,
  roleIdToString,
  assetTypeToString,
  pollTypeToString,
  lowerCase,
  formatVersion,
  globalize,
  formatDate,
  yesNoFilter,
  assetRequestStatesFilter,
  assetRequestTypesFilter,
  assetPoliciesVerboseFilter,
  stellarAssetTypesFilter,
  limitsRequestStatesStrFilter,
  roleTypeVerboseFilter,
  idDocumentsVerboseFilter,
  localizedSaleTypesFilter,
} from './components/App/filters/filters'

async function init () {
  i18n.onLanguageChanged(lang => {
    moment.locale(lang)
  })

  await i18n.init()

  Vue.filter('globalize', globalize)

  /* Logger module */
  Vue.use(VueResource)

  if (process.env.NODE_ENV === 'production') {
    Vue.config.devtools = false
    Vue.config.debug = false
    Vue.config.silent = true
    Vue.config.productionTip = false
  }

  Object.isEmpty = function (obj) {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false
      }
    }

    return JSON.stringify(obj) === JSON.stringify({})
  }

  /* Init Sentry */
  ErrorTracker.init(params)

  /* Create and Mount our Vue instance */
  new Vue({
    components: { App },
    // Attach the Vue instance to the window,
    // so it's available globally.
    created: function () {
      window.vue = this
    },
    router,
    store,
    template: '<App/>',
  }).$mount('#app')
  Vue.use(Auth)
  Vue.use(params)
  Vue.use(Vuelidate)

  Vue.filter('dateTime', filterDateWithTime)
  Vue.filter('localizeIssuanceRequestState', localizeIssuanceRequestState)
  Vue.filter('cropAddress', cropAddress)
  Vue.filter('roleIdToString', roleIdToString)
  Vue.filter('assetTypeToString', assetTypeToString)
  Vue.filter('pollTypeToString', pollTypeToString)
  Vue.filter('lowerCase', lowerCase)
  Vue.filter('formatVersion', formatVersion)
  Vue.filter('formatDate', formatDate)
  log.setDefaultLevel(params.LOG_LEVEL)
  Vue.filter('yesNoFilter', yesNoFilter)
  Vue.filter('assetRequestStatesFilter', assetRequestStatesFilter)
  Vue.filter('assetRequestTypesFilter', assetRequestTypesFilter)
  Vue.filter('assetPoliciesVerboseFilter', assetPoliciesVerboseFilter)
  Vue.filter('stellarAssetTypesFilter', stellarAssetTypesFilter)
  Vue.filter('limitsRequestStatesStrFilter', limitsRequestStatesStrFilter)
  Vue.filter('roleTypeVerboseFilter', roleTypeVerboseFilter)
  Vue.filter('idDocumentsVerboseFilter', idDocumentsVerboseFilter)
  Vue.filter('localizedSaleTypesFilter', localizedSaleTypesFilter)
}

init()
