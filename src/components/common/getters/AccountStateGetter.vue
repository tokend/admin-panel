<template>
  <span class="account-state-getter">
    <template v-if="accountState">
      {{ accountState }}
    </template>
    <template v-else>
      Loading...
    </template>
  </span>
</template>

<script>
import { ApiCallerFactory } from '@/api-caller-factory'
import config from '@/config'

export default {
  props: {
    accountId: { type: String, required: true },
  },

  data: _ => ({
    account: null,
  }),

  computed: {
    accountState () {
      if (!this.account) return null
      return this.account.role.id === +config.ACCOUNT_ROLES.blocked
        ? 'Blocked'
        : 'Active'
    },
  },

  async created () {
    await this.getAccount()
  },

  methods: {
    async getAccount () {
      const { data } = await ApiCallerFactory
        .createCallerInstance()
        .getWithSignature(`/v3/accounts/${this.accountId}`)
      this.account = data
    },
  },
}
</script>
