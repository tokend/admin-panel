<template>
  <div class="withdrawals-index">
    <h2>{{ "withdrawal-list.header" | globalize }}</h2>

    <div class="withdrawals-index__list-wrp">
      <withdrawal-list />
    </div>
  </div>
</template>

<script>
import WithdrawalList from './components/WithdrawalList'

export default {
  components: {
    WithdrawalList,
  },
}
</script>
