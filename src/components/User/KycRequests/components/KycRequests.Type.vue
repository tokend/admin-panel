<template>
  <span class="quote-fiat-currency">
    <template v-if="kycType">
    {{ kycType }}
    </template>
  </span>
</template>
<script>
  import accounts from '@/api/accounts'
  import { ACCOUNT_TYPES } from '@/constants'

  const KYC_TYPE = {
    new: 'New',
    update: 'Update'
  }

  export default {
    props: ['accountId'],
    data: _ => ({
      account: null,
      kycType: null
    }),
    methods: {
      async getAccount () {
        const account = await accounts.get(this.accountId)
        return account.data
      }
    },
    async created () {
      this.account = await this.getAccount()
      this.kycType = this.account.accountTypeI === ACCOUNT_TYPES.notVerified ? KYC_TYPE.new : KYC_TYPE.update
    }
  }
</script>
<style scoped lang="scss">
</style>
