export const SET_MESSAGE = (state, msg) => {
  if (!msg.text) return

  state.commit('SET_MESSAGE', msg)
  setTimeout(() => {
    state.commit('CLEAN_MESSAGE')
  }, 7000)
}

export const SET_ERROR = ({ dispatch }, text) => {
  dispatch('SET_MESSAGE', { type: 'error', text: text })
}

export const SET_INFO = ({ dispatch }, text) => {
  dispatch('SET_MESSAGE', { type: 'info', text: text })
}

export const LOG_IN = ({ commit, dispatch }) => {
  commit('LOG_IN')
  dispatch('START_IDLE')
}

export const LOG_OUT = ({ commit }) => {
  commit('CLOSE_MODAL')
  commit('STOP_IDLE')
  commit('CLEAR_ALL_DATA')
}
