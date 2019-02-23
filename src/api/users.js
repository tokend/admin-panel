import { ApiCallerFactory } from '@/api-caller-factory'

export default {

  async getAccountIdByEmail (email) {
    try {
      const { data } = await ApiCallerFactory
        .createCallerInstance()
        .get('/identities', {
          filter: { email }
        })
      return ((data || [])[0] || {}).address
    } catch (error) {
      if (error.httpStatus === 404) {
        return ''
      } else {
        throw error
      }
    }
  }
}
