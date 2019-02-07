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
    try {
      const { data } = await Sdk.horizon.public.getAccountIdByEmail(email)
      return data.accountId
    } catch (error) {
      if (error.httpStatus === 404) {
        return ''
      } else {
        throw error
      }
    }
  }
}
