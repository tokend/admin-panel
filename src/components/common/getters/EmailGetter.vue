<template>
  <span
    class="email-getter"
    :title="isTitled && (email || accountId || balanceId)"
  >
    <template v-if="isMasterAccount">
      Master
    </template>

    <template v-else-if="isLoading">
      Loading...
    </template>

    <template v-else-if="email">
      {{ email }}
    </template>

    <template v-else-if="accountId || balanceId">
      {{ accountId || balanceId | cropAddress }}
    </template>

    <template v-else>
      &mdash;
    </template>
  </span>
</template>

<script>
import { ApiCallerFactory } from '@/api-caller-factory'

import config from '@/config'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  props: {
    accountId: {
      type: String,
      default: '',
    },
    balanceId: {
      type: String,
      default: '',
    },
    isTitled: {
      type: Boolean,
      default: true,
    },
  },

  data: _ => ({
    email: '',
    isMasterAccount: false,
    isLoading: false,
  }),

  async created () {
    await this.init()
  },

  methods: {
    async init () {
      if (this.accountId === config.MASTER_ACCOUNT) {
        this.isMasterAccount = true
        return
      }

      if (this.accountId || this.balanceId) {
        this.isLoading = true
        await this.loadEmail()
        this.isLoading = false
      }
    },

    async loadEmail () {
      try {
        const accountId = await this.getAccountId()
        const { data } = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/identities', {
            filter: { address: accountId },
            page: { limit: 1 },
          })
        this.email = ((data || [])[0] || {}).email || this.email
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async getAccountId () {
      if (this.accountId) {
        return this.accountId
      } else if (this.balanceId) {
        const { data } = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature(`/v3/balances/${this.balanceId}`)
        return data.owner.id
      } else {
        return ''
      }
    },
  },
}
</script>
