import { getters, actions, mutations } from '../types'
import { Sdk } from '@/sdk'

const emailBooks = {
  state: {
    addressBook: {},
    busyAddresses: new Set(),
  },

  actions: {
    async [actions.REQUEST_EMAIL_BY_ADDRESS] (context, payload) {
      const address = payload
      const state = context.state

      if (state.busyAddresses.has(address)) {
        return
      }

      state.busyAddresses.add(address)
      try {
        const email = await Sdk.horizon.public.getEmailByAccountId(address)
        context.commit(mutations.PUSH_EMAIL_TO_ADDRESS_BOOK, { address, email })
      } catch (error) {
        throw error
      }
      state.busyAddresses.delete(address)
    },
  },

  mutations: {
    [mutations.PUSH_EMAIL_TO_ADDRESS_BOOK] (state, payload) {
      state.addressBook[payload.address] = payload.email
    },
  },

  getters: {
    [getters.GET_EMAIL_ADDRESS_BOOK] (state) {
      return state.addressBook
    },
  },
}

export { emailBooks }
