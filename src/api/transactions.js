import { Transaction } from 'tokend-js-sdk'
import store from '../store'
import server from '../utils/server'
import config from '../config'

export default {
  parsePendingTransaction (item) {
    item.transaction = new Transaction(item.tx_envelope)
    item.updated_at = item.updated_at.split('.')[0].replace('T', ' ')
    item.created_at = item.created_at.split('.')[0].replace('T', ' ')
    switch (item.state) {
      case 1:
        item.state_string = 'Pending'
        break
      case 2:
        item.state_string = 'Success'
        break
      case 3:
        item.state_string = 'Rejected'
        break
      case 4:
        item.state_string = 'Failed'
        break
    }
    return item
  },

  getPendingTransactionById (id) {
    return server.sdkServer.transactions()
      .for
      .pending({})
      .transaction(id)
      .callWithSignature(store.getters.keypair)
      .then((result) => {
        return this.parsePendingTransaction(result)
      })
  },

  getPendingTransactionList (state, signed, accountId) {
    const master = config.MASTER_ACCOUNT
    let signedBy, notSignedBy
    if (signed === true) {
      signedBy = accountId
    } else {
      notSignedBy = accountId
    }

    const kp = store.getters.keypair
    let pendingTransactions = null
    pendingTransactions = server.sdkServer.transactions().forAccount(master).pending({ state, signedBy, notSignedBy })

    return pendingTransactions.callWithSignature(kp)
  },

  approvePendingTransaction (tx) {
    tx.sign(store.getters.keypair)
    return server.sdkServer.submitTransaction(tx)
  },

  deletePendingTransaction (txHash) {
    return server.sdkServer.deletePendingTransaction(txHash, store.getters.keypair)
  },

  rejectPendingTransaction (txHash) {
    return server.sdkServer.rejectPendingTransaction(txHash, store.getters.keypair)
  },

  getOperationsByAccountId (accountId, completedOnly = false) {
    const request = server.sdkServer.operations()
      .forAccount(accountId)
      .order('desc')
      .limit(store.getters.pageLimit)
    request.url.addQuery('completed_only', completedOnly)
    return request.callWithSignature(store.getters.keypair)
  },

  getOperationById (id) {
    return server.sdkServer.operations()
      .operation(id)
      .callWithSignature(store.getters.keypair)
  },

  getParticipants (participants, accountId) {
    const data = {
      participants: JSON.parse(JSON.stringify(participants)),
      for_account: accountId
    }

    Object.keys(data.participants).forEach(k => {
      data.participants[k].forEach(p => {
        delete p.effects
      })
    })

    return server.post('/participants', data, true)
  }
}
