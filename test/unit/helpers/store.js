import Vuex from 'vuex'

export const setDefaultStore = () => {
  const getters = {
    showLoader: () => false,
    tfaInitiator: () => ''
  }

  const actions = {
    SET_ERROR: (state, msg) => {
      console.log('set error', msg)
    },
    SET_INFO: (state, msg) => {
      console.log('set info', msg)
    }
  }

  const mutations = {
    OPEN_LOADER: () => {
      console.log('open loader')
    },
    CLOSE_LOADER: () => {
      console.log('close loader')
    }
  }

  return new Vuex.Store({
    actions,
    getters,
    mutations
  })
}
