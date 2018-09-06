const state = {
  token: '',
  isRequired: false,
  initiator: ''
}

const getters = {
  tfaIsRequired: state => state.isRequired,
  tfaToken: state => state.token,
  tfaInitiator: state => state.initiator
}

const actions = {
  'CLOSE_TFA' ({ commit, state }) {
    state.token = ''
    state.isRequired = false
    commit('CLOSE_MODAL')
  }
}

const mutations = {
  'REQUIRE_TFA' (state, payload) {
    state.isRequired = true
    state.token = payload.token
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
