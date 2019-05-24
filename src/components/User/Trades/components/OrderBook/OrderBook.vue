<template>
  <div class="order-book">
    <div class="order-book__orders-wrp">
      <order-table
        class="order-book__table"
        :list="book.bids"
        :pair="filters.pair"
        :is-rtl="true"
        :is-bids="true"
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
import OrderTable from './OrderBook.Table'
import HistoryTable from './OrderBook.History'

import { AssetPair } from '../../models/AssetPair'
import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'

const SECONDARY_MARKET_ORDER_BOOK_ID = '0'

export default {
  components: {
    OrderTable,
    HistoryTable,
  },

  props: {
    filters: { type: Object, required: true },
  },

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
      try {
        const orderBookId = SECONDARY_MARKET_ORDER_BOOK_ID
        const formatedOrderBookId = `${pair.base}:${pair.quote}:${orderBookId}`
        const { data } = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature(`/v3/order_books/${formatedOrderBookId}`, {
            include: ['buy_entries', 'sell_entries'],
          })
        this.book.bids = data.buyEntries
        this.book.asks = data.sellEntries

        const tradesResponse = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/v3/matches', {
            filter: {
              base_asset: pair.base,
              quote_asset: pair.quote,
            },
          })
        this.book.history = tradesResponse.data
        this.isLoaded = true
      } catch (error) {
        ErrorHandler.process(error)
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
