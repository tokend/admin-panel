<template>
  <div class="fees-balances">
    <h2>Collected fees management</h2>

    <div class="fees-balances__withdraw-form-wrp">
      <collected-fees-withdraw
        :ref="REFS.withdrawalForm"
      />
    </div>

    <div class="fees-balances__list-wrp">
      <collected-fees-list @on-item-clicked="passToWithdrawalForm($event)" />
    </div>

    <div class="fees-balances__withdrawals-wrp">
      <collected-fees-withdrawals />
    </div>

    <!--
      TODO: withdraw only withdrawable assets on balances,
      hide all the others
    -->
  </div>
</template>

<script>
import CollectedFeesList from './components/CollectedFeesList'
import CollectedFeesWithdraw from './components/CollectedFeesWithdraw'
import CollectedFeesWithdrawals from './components/CollectedFeesWithdrawals'

const REFS = {
  withdrawalForm: 'withdrawalForm',
}

export default {
  components: {
    CollectedFeesList,
    CollectedFeesWithdraw,
    CollectedFeesWithdrawals,
  },

  data () {
    return {
      REFS,
    }
  },

  methods: {
    passToWithdrawalForm (payload) {
      this.$refs[REFS.withdrawalForm].setForm({
        balanceId: payload.balanceId,
        amount: payload.amount,
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
