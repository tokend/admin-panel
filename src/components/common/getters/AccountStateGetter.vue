<template>
  <span class="account-state-getter" v-if="accountState">{{ accountState }}</span>
</template>

<script>
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
      accountState () {
        if (!this.account) return null
        return this.account.isBlocked ? 'Blocked' : 'Active'
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
