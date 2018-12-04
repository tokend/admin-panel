import store from '../store'
import server from '../utils/server'

export default {
  getAsset (balanceId) {
    return server.sdkServer.balances().balanceId(balanceId).callWithSignature(store.getters.keypair)
  },

  getBalanceByAccountId (accountId, asset) {
    return server.sdkServer.balances()
      .forAccount(accountId)
      .forAsset(asset)
      .callWithSignature(store.getters.keypair)
      .then(accountResult => {
        let balance = {}
        accountResult.records.forEach((el) => {
          if (el.asset === asset) {
            balance = el
          }
        })
        if (balance.balance_id) {
          return balance.balance_id
        } else {
          return Promise.reject('Error: no balance id found')
        }
      })
  },

  getAccountIdByBalanceId (balanceId) {
    return server.sdkServer
      .balances()
      .account(balanceId)
      .callWithSignature(store.getters.keypair)
      .then(response => response.account_id)
  }
}
