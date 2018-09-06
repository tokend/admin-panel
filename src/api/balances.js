import config from '../config'
import store from '../store'
import server from '../utils/server'

export default {
  getBalance (balanceId) {
    return server.sdkServer.balances()
      .balanceId(balanceId)
      .callWithSignature(store.getters.keypair)
  },

  getUserBalances (accountId) {
    return server.sdkServer.balances()
      .forAccount(accountId)
      .callWithSignature(store.getters.keypair)
      .then(r => {
        return r.records
      }).catch(err => {
        console.error(err)
        let msg = ''
        if (err.response && err.response.status === 404) {
          msg = 'User not found'
        } else {
          msg = 'Can not get user details. Try again later'
        }
        Promise.reject(msg)
      })
  },

  getCommissionBalance (asset) {
    const commissionAccount = config.COMMISSION_ACCOUNT
    return server.sdkServer.accounts()
      .accountId(commissionAccount)
      .callWithSignature(store.getters.keypair)
      .then(accountResult => {
        let blcBalance = {}
        accountResult.balances.forEach((el) => {
          if (el.asset === asset) {
            blcBalance = el
          }
        })
        return blcBalance
      })
  },

  getCommissionBalances () {
    const commissionAccount = config.COMMISSION_ACCOUNT
    return server.sdkServer.accounts()
      .accountId(commissionAccount)
      .callWithSignature(store.getters.keypair)
      .then(accountResult => {
        const balances = []
        accountResult.balances.forEach((el) => {
          balances.push(el)
        })
        return balances
      })
  },

  getBalances (accountId) {
    return server.sdkServer.accounts()
      .accountId(accountId)
      .callWithSignature(store.getters.keypair)
      .then(accountResult => {
        const balances = []
        accountResult.balances.forEach((el) => {
          balances.push(el)
        })
        return balances
      })
  },

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
