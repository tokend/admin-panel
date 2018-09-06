<template>
  <div class="order-book">
    <div class="order-book__orders-wrp">
      <order-table class="order-book__table"
        :list="book.bids"
        :pair="filters.pair"
        is-rtl="true"
        is-bids="true"
      />

      <order-table class="order-book__table"
        :list="book.asks"
        :pair="filters.pair"
      />
    </div>

    <div class="order-book__history-wrp">
      <history-table :list="book.history" :pair="filters.pair" />
    </div>
  </div>
</template>

<script>
import api from '@/api'
import OrderTable from './OrderBook.Table'
import HistoryTable from './OrderBook.History'
import { AssetPair } from '../../models/AssetPair'

export default {
  components: {
    OrderTable,
    HistoryTable
  },

  data () {
    return {
      book: {
        bids: [],
        asks: [],
        history: []
      },
      isLoaded: false,
      isFailed: false
    }
  },

  props: ['filters'],

  created () {
    this.getBook()
  },

  watch: {
    'filters.pair' () { this.getBook() }
  },

  methods: {
    async getBook () {
      this.isLoaded = false
      const pair = new AssetPair(this.filters.pair)
      const params = { baseAsset: pair.base, quoteAsset: pair.quote }
      try {
        this.book.bids = (await api.orderBooks.getBids(params)).data
        this.book.asks = (await api.orderBooks.getAsks(params)).data
        this.book.history = (await api.orderBooks.getHistory(params)).data
        this.isLoaded = true
      } catch (error) {
        error.showMessage('Failed to get order book. Please try again later')
        this.isFailed = true
      }
    }
  }
}
</script>

<style scoped lang="scss">
.order-book__orders-wrp {
  display: flex;
  flex-direction: row;

  & > .order-book__table {
    flex: 1;
  }

  & > .order-book__table + .order-book__table {
    margin-left: 4rem;
  }
}

.order-book__history-wrp {
  margin-top: 4rem;
}
</style>
