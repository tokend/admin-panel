const forceLogoutDelay = 1.5 * 60
const idleDelay = 15 * 60 * 1000

const state = {
  showIdleForm: false,
  logoutTimer: null,
  idleDelay: idleDelay,
  timestamp: null
}

const getters = {
  showIdleForm: state => state.showIdleForm,
  forceLogoutDelay: state => forceLogoutDelay,
  logoutTimer: state => state.logoutTimer
}

const actions = {
  'START_IDLE' ({ dispatch, commit, state }) {
    function resetTimer () {
      clearTimeout(state.logoutTimer)

      state.logoutTimer = setTimeout(() => { dispatch('SHOW_IDLE_FORM') }, idleDelay)
    }

    resetTimer()

    document.onload = resetTimer
    document.onmousemove = resetTimer
    document.onmousedown = resetTimer
    document.ontouchstart = resetTimer
    document.onclick = resetTimer
    document.onscroll = resetTimer
    document.onkeypress = resetTimer
  },

  'SHOW_IDLE_FORM': ({ commit, state }) => {
    commit('OPEN_MODAL')
    commit('SHOW_IDLE_FORM')
  },

  'CLOSE_IDLE_FORM': ({ commit, dispatch, state }) => {
    state.showIdleForm = false
    commit('CLOSE_MODAL')
    dispatch('START_IDLE')
  }
}

const mutations = {
  'SHOW_IDLE_FORM': (state) => { state.showIdleForm = true },

  'KEEP_SESSION': (state) => {},

  'STOP_IDLE': (state) => {
    clearTimeout(state.logoutTimer)
    state.showIdleForm = false
    state.logoutTimer = null

    document.onload = null
    document.onmousemove = null
    document.onmousedown = null
    document.ontouchstart = null
    document.onclick = null
    document.onscroll = null
    document.onkeypress = null
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

