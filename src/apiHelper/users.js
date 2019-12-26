import { api } from '@/api'
import { base } from '@tokend/js-sdk'

export default {
  async getAccountIdByEmail (email) {
    if (!email) return ''

    try {
      const { data } = await api.get('/identities', {
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
    if (!accountId) return ''

    try {
      const { data } = await api.get('/identities', {
        filter: { address: accountId },
        page: { limit: 1 },
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

  async getAccountIdBy (emailOrAccountId) {
    const value = emailOrAccountId

    if (base.Keypair.isValidPublicKey(value)) {
      return value
    } else {
      try {
        const address = await this.getAccountIdByEmail(value)
        return address || value
      } catch (error) {
        return value
      }
    }
  },
}
