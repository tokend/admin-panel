<template>
  <span class="account-state-getter">
    <template v-if="accountState">
      {{ accountState }}
    </template>
    <template v-else>
      {{ "account-state-getter.load-acc-state" | globalize }}
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
        ? 'Blocked'
        : 'Active'
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
