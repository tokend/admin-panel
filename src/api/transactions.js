import store from '../store'
import server from '../utils/server'

export default {
  getOperationsByAccountId (accountId, completedOnly = false) {
    const request = server.sdkServer.operations()
      .forAccount(accountId)
      .order('desc')
      .limit(store.getters.pageLimit)
    request.url.addQuery('completed_only', completedOnly)
    return request.callWithSignature(store.getters.keypair)
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
