<template>
  <span class="account-type-getter" v-if="accountType">{{ accountType }}</span>
</template>

<script>
  import { ACCOUNT_TYPES_VERBOSE } from '@/constants'
  import api from '@/api'

  export default {
    props: ['accountId'],
    data: _ => ({
      account: null
    }),
    async created () {
      await this.getAccount()
    },
    computed: {
      accountType () {
        if (!this.account) return null
        return ACCOUNT_TYPES_VERBOSE[this.account.accountTypeI]
      }
    },
    methods: {
      async getAccount () {
        this.account = (await api.accounts.get(this.accountId)).data
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>
