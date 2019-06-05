import { ApiCallerFactory } from '@/api-caller-factory'

export default {
  async getAccountIdByEmail (email) {
    if (!email) return ''

    try {
      const { data } = await ApiCallerFactory
        .createCallerInstance()
        .get('/identities', {
          filter: { email },
          page: { limit: 1 },
        })

      return ((data || [])[0] || {}).address
    } catch (error) {
      if (error.httpStatus === 404) {
        return ''
      } else {
        throw error
      }
    }
  },
  async getEmailByAccountId (accountId) {
    try {
      const { data } = await ApiCallerFactory
        .createCallerInstance()
        .get('/identities', {
          filter: {
            address: accountId,
          },
          page: {
            limit: 1,
          },
        })
      return ((data || [])[0] || {}).email
    } catch (error) {
      if (error.httpStatus === 404) {
        return ''
      } else {
        throw error
      }
    }
  },
}
