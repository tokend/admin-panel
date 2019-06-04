export const LOG_IN = ({ commit, dispatch }) => {
  commit('LOG_IN')
  dispatch('START_IDLE')
}

export const LOG_OUT = ({ commit }) => {
  commit('CLOSE_MODAL')
  commit('STOP_IDLE')
  commit('CLEAR_ALL_DATA')
}
