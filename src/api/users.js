import { Sdk } from '@/sdk'

export default {

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
