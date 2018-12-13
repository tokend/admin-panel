import server from '../utils/server'
import { ServerCallBuilder } from './ServerCallBuilder'
import { Sdk } from '@/sdk'

const ScopedServerCallBuilder = ServerCallBuilder.makeScope()
  .registerResource('details')

// user_id
// details

export default {
  getEmailsByAddresses (addresses) {
    return new ScopedServerCallBuilder()
      .details()
      .post({ addresses })
      .then((response) => ((response || {}).body || {}).users)
  },

  getEmailByAddress (address) {
    return this.getEmailsByAddresses([address])
      .then((response) => response[address].email)
  },

  async getAccountIdByEmail (email) {
    const response = await Sdk.api.users.getPage({ email: email })
    const resultArray = response.data.filter(item => item.email === email)
    return resultArray[0].id
  },
  // legacy

  getUserIdByEmail (email) {
    return server.get('/user_id', false, { email: email })
      .then(r => {
        return r.account_id
      })
  }
}
