import Vue from 'vue'
import Vuex from 'vuex'
import { state } from './state'
import * as getters from './getters'
import * as actions from './actions'
import * as mutations from './mutations'
import plugins from './plugins'

import idleHandler from './modules/idle_handler'
import loader from './modules/loader'
import tfa from './modules/tfa'
import { emailBooks } from './modules/emailBooks'

Vue.use(Vuex)

const store = new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  plugins,
  modules: {
    idleHandler,
    loader,
    tfa,
    emailBooks
  }
})

export default store
