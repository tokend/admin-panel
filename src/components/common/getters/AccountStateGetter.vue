<template>
  <span class="account-state-getter">
    <template v-if="accountState">
      {{ accountState | globalize }}
    </template>
    <template v-else>
      {{ "account-state-getter.loading" | globalize }}
    </template>
  </span>
</template>

<script>
import { api } from '@/api'
import { mapGetters } from 'vuex'

export default {
  props: {
    accountId: { type: String, required: true },
  },

  data: _ => ({
    account: null,
  }),

  computed: {
    ...mapGetters(['kvAccountRoles']),

    accountState () {
      if (!this.account) return null
      return this.account.role.id === +this.kvAccountRoles.blocked
        ? 'account-state-getter.blocked'
        : 'account-state-getter.active'
    },
  },

  async created () {
    await this.getAccount()
  },

  methods: {
    async getAccount () {
      const endpoint = `/v3/accounts/${this.accountId}`
      const { data } = await api.getWithSignature(endpoint)
      this.account = data
    },
  },
}
</script>
