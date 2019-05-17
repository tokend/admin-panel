<template>
  <div class="fees-balances">
    <h2>Collected fees management</h2>

    <div class="fees-balances__withdraw-form-wrp">
      <collected-fees-withdraw
        :from-balance-id="toWithdrawalForm.balanceId"
        :withdrawal-amount="toWithdrawalForm.amount"
      />
    </div>

    <div class="fees-balances__list-wrp">
      <collected-fees-list @on-item-clicked="passToWithdrawalForm(balance)" />
    </div>

    <!-- TODO: request list with filters -->
  </div>
</template>

<script>
import CollectedFeesList from './components/CollectedFeesList'
import CollectedFeesWithdraw from './components/CollectedFeesWithdraw'

export default {
  components: {
    CollectedFeesList,
    CollectedFeesWithdraw,
  },

  data () {
    return {
      toWithdrawalForm: {
        balanceId: '',
        amount: '',
      },
    }
  },

  methods: {
    passToWithdrawalForm (balance) {
      this.toWithdrawalForm.balanceId = balance.id
      this.toWithdrawalForm.balanceId = balance.asset.amount
    },
  },
}
</script>

<style lang="scss">
.fees-balances__withdraw-form-wrp {
  max-width: 48rem;
}

.fees-balances__list-wrp {
  margin-top: 4rem;
}
</style>
