<template>
  <span class="account-type-getter" v-if="accountType">{{ accountType }}</span>
</template>

<script>
  import { ACCOUNT_TYPES_VERBOSE } from '@/constants'
  import { Sdk } from '@/sdk'

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
        const response = await Sdk.horizon.account.get(this.accountId)
        this.account = response.dFata
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>
