const state = {
  asset: '',
  isRequired: false,
  initiator: ''
}

const getters = {
  tfaIsRequired: state => state.isRequired,
  tfaAsset: state => state.asset,
  tfaInitiator: state => state.initiator
}

const actions = {
  'CLOSE_TFA' ({ commit, state }) {
    state.asset = ''
    state.isRequired = false
    commit('CLOSE_MODAL')
  }
}

const mutations = {
  'REQUIRE_TFA' (state, payload) {
    state.isRequired = true
    state.asset = payload.asset
    state.initiator = payload.initiator
  },

  'TFA_FORM_DONE' (state) {},

  'TFA_FORM_FALSE' (state) {},

  'TFA_FORM_RESEND' (state) {},

  'TFA_FORM_CLOSE' (state) {}
}

export default {
  state,
  getters,
  actions,
  mutations
}
