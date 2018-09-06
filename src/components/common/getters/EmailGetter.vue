<template>
  <span class="email-getter" :title="isTitled && (email || id)">
    {{email || id}}
  </span>
</template>

<script>
import { actions, getters, mutations } from '@/store/types'
import { mapActions, mapGetters } from 'vuex'
import api from '../../../api'
import get from 'lodash/get'

export default {
  data () {
    return {
      accountId: '',
      balanceId: '',
      email: '',
      storeUnsubscribe: null
    }
  },

  props: {
    address: {
      type: String,
      default: ''
    },
    balance: {
      type: String,
      default: ''
    },
    isTitled: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters({ emailAddressBook: getters.GET_EMAIL_ADDRESS_BOOK }),

    id () {
      return this.accountId || this.balanceId
    }
  },

  async created () {
    this.storeUnsubscribe = this.storeSubscribe()
    await this.updateAddressses()
    this.updateEmail()
  },

  beforeDestroy () {
    this.storeUnsubscribe()
  },

  watch: {
    address () {
      this.updateEmail()
    },
    balance () {
      this.updateAddressses()
      this.updateEmail()
    }
  },

  methods: {
    ...mapActions({
      requestEmailByAddress: actions.REQUEST_EMAIL_BY_ADDRESS
    }),

    storeSubscribe () {
      return this.$store.subscribe(mutation => {
        const expectedMutation = mutations.PUSH_EMAIL_TO_ADDRESS_BOOK

        if (mutation.type === expectedMutation) {
          if (get(mutation, 'payload.address') === this.accountId) {
            this.email = get(mutation, 'payload.email')
          }
        }
      })
    },

    async updateAddressses () {
      const accountId = this.address
      const balanceId = this.balance
      if (accountId) {
        this.accountId = accountId
        return
      }
      if (balanceId) {
        this.balanceId = balanceId
        this.accountId = await api.balances.getAccountIdByBalanceId(balanceId)
        return
      }
      throw new Error('You should provide either account or balance id')
    },

    async updateEmail () {
      if (!this.email) {
        this.requestEmailByAddress(this.accountId)
      }
    }
  }
}
</script>

<style scoped>

</style>
