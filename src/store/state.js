export const STORAGE_KEY = 'vuex'

const initialState = () => {
  return {
    timestamp: null,
    auth: {
      isLoggedIn: false,
    },
    user: {
      name: '',
      address: '', // user address (accountId the user logged in with)
      keys: { // signing keys
        seed: '',
        accountId: '',
      },
      wallet: {
        id: '',
      },
    },
    message: {
      type: '', // info or error
      text: '',
    },
    isModalOpen: false,
  }
}

const newState = initialState()

// Check session storage for our key and retrieve the data, if it exists,
// otherwise use defaults.
if (sessionStorage.getItem(STORAGE_KEY)) {
  const oldState = JSON.parse(sessionStorage.getItem(STORAGE_KEY))
  const isExpired = Date.now() - oldState.timestamp > 13 * 1000
  if (!isExpired) {
    newState.auth = oldState.auth
    newState.user = oldState.user
  }
}

export const state = newState
