const state = {
  showLoader: false
}

const getters = {
  showLoader: state => state.showLoader
}

const mutations = {
  'OPEN_LOADER' (state) { state.showLoader = true },
  'CLOSE_LOADER' (state) { state.showLoader = false }
}

export default {
  state,
  getters,
  mutations
}
