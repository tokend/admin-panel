import store from '../store'
import keyServer from '../utils/keyServer'

export default {
  addGAuth () {
    return keyServer.post('/tfa', { username: store.state.user.name })
  },

  getTfaBackends () {
    return keyServer.get(`/tfa`, { wallet_id: store.state.user.wallet.id }, true)
  },

  enableGAuth (id) {
    return keyServer.patch(`/tfa/${id}`, { wallet_id: store.state.user.wallet.id, priority: 10 })
  },

  verifyTfaCode (code, token) {
    console.log('verifyTfaCode')
    return keyServer.get('/tfa/verify', { code: code, token: token }, false)
  }
}
