<template>
  <span
    class="email-getter"
    :title="isTitled && (email || accountId || balanceId)"
  >
    <template v-if="isMasterAccount">
      {{ "email-getter.master-acc" | globalize }}
    </template>

    <template v-else-if="isLoading">
      {{ "email-getter.loading" | globalize }}
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
import { api } from '@/api'

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
    isLoading: false,
  }),

  computed: {
    isMasterAccount () {
      return this.accountId === config.MASTER_ACCOUNT
    },
  },

  async created () {
    await this.init()
  },

  methods: {
    async init () {
      if (this.isMasterAccount) {
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
        const { data } = await api.getWithSignature('/identities', {
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
        const endpoint = `/v3/balances/${this.balanceId}`
        const { data } = await api.getWithSignature(endpoint)
        return data.owner.id
      } else {
        return ''
      }
    },
  },
}
</script>
