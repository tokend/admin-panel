<template>
  <div class="trades-index">
    <h2>Trades</h2>

    <div class="trades-index__filters-wrp">
      <trade-filters v-model="filters" />
    </div>

    <template v-if="filters.pair">
      <div class="trades-index__chart-wrp">
        <price-chart :filters="filters" />
      </div>

      <div class="trades-index__book-wrp">
        <order-book :filters="filters" />
      </div>
    </template>

    <template v-else>
      <p class="text">
        Select pair
      </p>
    </template>
  </div>
</template>

<script>
import TradeFilters from './components/TradeFilters'
import PriceChart from './components/PriceChart'
import OrderBook from './components/OrderBook'

export default {
  components: {
    TradeFilters,
    PriceChart,
    OrderBook
  },

  data () {
    return {
      filters: {
        pair: ''
      }
    }
  }
}
</script>

<style scoped>
.trades-index__filters-wrp {
  margin-bottom: 4rem;
}

.trades-index__chart-wrp {
  margin-bottom: 4rem;
}
</style>
