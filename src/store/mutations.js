export const LOG_IN = (state) => {
  state.auth.isLoggedIn = true
}
export const UPDATE_AUTH = (state, auth) => {
  state.auth = auth
}

export const UPDATE_USER = (state, user) => {
  state.user = user
}

export const SET_MESSAGE = (state, msg) => {
  if (typeof msg.text !== 'string') return
  state.message.type = msg.type
  state.message.text = msg.text
}

export const CLEAN_MESSAGE = (state) => {
  state.message.type = ''
  state.message.text = ''
}

// MODALS
export const OPEN_MODAL = (state) => {
  state.isModalOpen = true
}

export const CLOSE_MODAL = (state) => {
  state.isModalOpen = false
}

export const WANT_CLOSE_MODAL = (state) => {}

/**
 * Clear each property, one by one, so reactivity still works.
 *
 * (ie. clear out state.auth.isLoggedIn so Navbar component automatically reacts to logged out state,
 * and the Navbar menu adjusts accordingly)
 *
 * TODO: use a common import of default state to reset these values with.
 */
export const CLEAR_ALL_DATA = (state) => {
  // Auth
  state.auth.isLoggedIn = false

  // User
  state.user.name = ''
  state.user.keys = { seed: '', accountId: '' }
  state.user.wallet = {}
  state.user.signerTypes = []
  state.user.accountCreator = false
  state.user.admin = false

  // Status messages
  state.message = {}
  state.message.info = ''
  state.message.error = ''

  location.reload()
}
