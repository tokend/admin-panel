<template>
  <div class="fees-balances">
    <template v-if="isLoaded">
      <h2>Collected fees management</h2>

      <div class="fees-balances__withdraw-form-wrp">
        <collected-fees-withdraw
          :ref="REFS.withdrawalForm"
          @submitted="updateCollectedFees"
        />
      </div>

      <div class="fees-balances__list-wrp">
        <collected-fees-list
          :ref="REFS.collectedFeesList"
          @on-item-clicked="passToWithdrawalForm($event)" />
      </div>

      <div class="fees-balances__withdrawals-wrp">
        <collected-fees-withdrawals
          :ref="REFS.collectedFeesWithdrawals"
        />
      </div>
    </template>

    <template v-else>
      <div class="app-list">
        <div class="app-list__li-like">
          <template v-if="isLoadFailed">
            <p class="danger">
              An error occurred. Please try again later
            </p>
          </template>

          <template v-else>
            <p>Loading...</p>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import CollectedFeesList from './components/CollectedFeesList'
import CollectedFeesWithdraw from './components/CollectedFeesWithdraw'
import CollectedFeesWithdrawals from './components/CollectedFeesWithdrawals'

import { mapActions } from 'vuex'
import { ErrorHandler } from '@/utils/ErrorHandler'

const REFS = {
  withdrawalForm: 'withdrawalForm',
  collectedFeesList: 'collectedFeesList',
  collectedFeesWithdrawals: 'collectedFeesWithdrawals',
}

export default {
  components: {
    CollectedFeesList,
    CollectedFeesWithdraw,
    CollectedFeesWithdrawals,
  },

  data () {
    return {
      isLoaded: false,
      isLoadFailed: false,
      REFS,
    }
  },

  async created () {
    try {
      await this.loadAssets()
      this.isLoaded = true
    } catch (e) {
      this.isLoadFailed = true
      ErrorHandler.processWithoutFeedback(e)
    }
  },

  methods: {
    ...mapActions({
      loadAssets: 'LOAD_ASSETS',
    }),

    passToWithdrawalForm (payload) {
      this.$refs[REFS.withdrawalForm].setForm({
        balanceId: payload.balanceId,
        amount: payload.amount,
      })
      this.scrollTop()
    },

    updateCollectedFees () {
      this.$refs[REFS.collectedFeesList].loadList()
      this.$refs[REFS.collectedFeesWithdrawals].reloadWithdrawalsThrottled()
    },

    scrollTop () {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    },
  },
}
</script>

<style lang="scss">
.fees-balances__withdraw-form-wrp {
  max-width: 48rem;
}

.fees-balances__list-wrp {
  margin-top: 5rem;
}

.fees-balances__withdrawals-wrp {
  margin-top: 5rem;
}
</style>
