import { ServerCallBuilder } from './ServerCallBuilder'
import { Sdk } from '@/sdk'

const ScopedServerCallBuilder = ServerCallBuilder.makeScope()
  .registerResource('details')

export default {
  getEmailsByAddresses (addresses) {
    return new ScopedServerCallBuilder()
      .details()
      .post({ addresses })
      .then((response) => ((response || {}).body || {}).users)
  },

  getEmailByAddress (address) {
    return this.getEmailsByAddresses([address])
      .then(({ [address]: result }) => {
        return result ? result.email : ''
      })
  },

  async getAccountIdByEmail (email) {
    const response = await Sdk.api.users.getPage({ email: email })
    const resultArray = response.data.filter(item => item.email === email)
    return resultArray[0].id
  }
}
