import { STORAGE_KEY } from './state'

function isLocalStorageNameSupported () {
  const testKey = 'test'
  const storage = window.sessionStorage
  try {
    storage.setItem(testKey, '1')
    storage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}

const localStoragePlugin = store => {
  if (!isLocalStorageNameSupported()) return

  store.subscribe((mutation, state) => {
    state.timestamp = Date.now()
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))

    if (mutation.type === 'CLEAR_ALL_DATA') {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  })
}

// TODO: setup env
// export default process.env.NODE_ENV !== 'production' ? [localStoragePlugin] : [localStoragePlugin]
export default [localStoragePlugin]
