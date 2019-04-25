<template>
  <div class="order-book">
    <div class="order-book__orders-wrp">
      <order-table
        class="order-book__table"
        :list="book.bids"
        :pair="filters.pair"
        is-rtl="true"
        is-bids="true"
      />

      <order-table
        class="order-book__table"
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
import { Sdk } from '@/sdk'
import OrderTable from './OrderBook.Table'
import HistoryTable from './OrderBook.History'
import { AssetPair } from '../../models/AssetPair'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    OrderTable,
    HistoryTable,
  },

  props: ['filters'],

  data () {
    return {
      book: {
        bids: [],
        asks: [],
        history: [],
      },
      isLoaded: false,
      isFailed: false,
    }
  },

  watch: {
    'filters.pair' () { this.getBook() },
  },

  created () {
    this.getBook()
  },

  methods: {
    async getBook () {
      this.isLoaded = false
      const pair = new AssetPair(this.filters.pair)
      const params = {
        order_book_id: 0,
        base_asset: pair.base,
        quote_asset: pair.quote,
      }
      try {
        const response = await Sdk.horizon.orderBook.getAll({
          ...params,
          is_buy: true,
        })
        this.book.bids = response.data
        const orderBookResponse = await Sdk.horizon.orderBook.getAll({
          ...params,
          is_buy: false,
        })
        this.book.asks = orderBookResponse.data
        const tradesResponse = await Sdk.horizon.trades.getPage(params)
        this.book.history = tradesResponse.data
        this.isLoaded = true
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
        this.isFailed = true
      }
    },
  },
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
