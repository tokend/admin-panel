import store from '../store'
import server from '../utils/server'

export default {
  addGAuth () {
    return server.post('/tfa', { username: store.state.user.name }, true, true)
  },

  getTfaBackends () {
    const wId = encodeURIComponent(store.state.user.wallet.id)
    return server.get(`/tfa?wallet_id=${wId}`, true, null, true)
  },

  enableGAuth (id) {
    return server.patch(`/tfa/${id}`, { wallet_id: store.state.user.wallet.id, priority: 10 }, true, true)
  },

  verifyTfaCode (code, token) {
    return server.get('/tfa/verify', false, { code: code, token: token }, true)
  }
}
