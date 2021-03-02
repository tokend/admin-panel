<template>
  <div class="order-book-history">
    <div class="app__block">
      <h2>{{ "order-book-history.header" | globalize }}</h2>
      <template v-if="list && list.length">
        <div class="order-book-history__table-wrp">
          <table class="order-book-history__table">
            <thead>
              <tr>
                <th>
                  {{ "order-book-history.thead-price" | globalize({
                    quoteAsset: quoteAsset
                  })
                  }}
                </th>
                <th>
                  {{ "order-book-history.thead-amount" | globalize({
                    baseAsset: baseAsset
                  })
                  }}
                </th>
                <th>
                  {{ "order-book-history.thead-total-cost" | globalize({
                    quoteAsset: quoteAsset
                  })
                  }}
                </th>
                <th>{{ "order-book-history.thead-date" | globalize }}</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(item, index) in list"
                :key="index"
                tabindex="0"
                @click="showItemDetails(item)"
                @keyup.enter.stop.prevent="showItemDetails(item)"
                @keyup.space.stop.prevent="showItemDetails(item)"
              >
                <td>
                  <span :title="item.price | formatMoney">
                    {{ item.price | formatMoney }}
                  </span>
                </td>
                <td>
                  <span :title="item.baseAmount | formatMoney">
                    {{ item.baseAmount | formatMoney }}
                  </span>
                </td>
                <td>
                  <span :title="item.price * item.baseAmount | formatMoney">
                    {{ item.price * item.baseAmount | formatMoney }}
                  </span>
                </td>
                <td>
                  <span>
                    {{ item.createdAt | formatDate }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <template v-else>
        <p class="text order-book-history__empty">
          {{ "order-book-history.no-data" | globalize }}
        </p>
      </template>
    </div>

    <modal
      class="order-book-history__modal"
      v-if="isDetailsShown"
      @close-request="hideItemDetails()"
      max-width="40rem">
      <h2>{{ "order-book-history.deal-details" | globalize }}</h2>

      <ul class="key-value-list">
        <li>
          <span>{{ "order-book-history.deal-id" | globalize }}</span>
          <span>{{ itemDetails.id }}</span>
        </li>
        <li>
          <span>{{ "order-book-history.amount" | globalize }}</span>
          <span :title="baseAmountPrice | formatMoney">
            {{ baseAmountPrice | formatMoney }}
          </span>
        </li>
        <li>
          <span>{{ "order-book-history.price" | globalize }}</span>
          <span :title="quoteAssetPrice | formatMoney">
            {{ quoteAssetPrice | formatMoney }}
          </span>
        </li>
        <li>
          <span>{{ "order-book-history.date" | globalize }}</span>
          <span>
            {{ itemDetails.createdAt | formatDate }}
          </span>
        </li>
      </ul>
    </modal>
  </div>
</template>

<script>
import { AssetPair } from '../../models/AssetPair'

import Modal from '@comcom/modals/Modal'

const EMPTY_DETAILS = Object.freeze({})

export default {
  components: {
    Modal,
  },

  props: {
    list: { type: Array, required: true },
    pair: { type: String, required: true },
  },

  data () {
    return {
      quoteAsset: '',
      baseAsset: '',
      isDetailsShown: false,
      itemDetails: Object.assign({}, EMPTY_DETAILS),
    }
  },

  computed: {
    baseAmountPrice () {
      return {
        value: this.itemDetails.baseAmount,
        currency: this.itemDetails.baseAsset.id,
      }
    },
    quoteAssetPrice () {
      return {
        value: this.itemDetails.price,
        currency: this.quoteAsset,
      }
    },
  },

  watch: {
    list () {
      this.parsePair()
    },
  },

  created () {
    this.parsePair()
  },

  methods: {
    parsePair () {
      const pair = new AssetPair(this.pair)
      this.baseAsset = pair.base
      this.quoteAsset = pair.quote
    },

    showItemDetails (item) {
      this.isDetailsShown = true
      this.itemDetails = item
    },

    hideItemDetails (item) {
      this.isDetailsShown = false
    },
  },
}
</script>

<style scoped lang="scss">
@import "../../../../../assets/scss/colors";

.order-book-history {
  height: 40rem;
}

.app__block {
  height: 100%;
  display: flex;
  flex-direction: column;

  & > h2 {
    margin-bottom: 4rem;
  }
}

.order-book-history__table-wrp {
  flex: 1;
  overflow-y: auto;
}

.order-book-history__table {
  width: 100%;
  font-size: 1.6rem;
  border-collapse: collapse;

  & > thead > tr > th {
    font-size: 1.2rem;
  }

  & > thead > tr > th,
  & > tbody > tr > td {
    text-align: right;
    padding: 0.5rem 0.5rem;

    &:first-child {
      text-align: left;
    }
  }

  & > tbody > tr:hover {
    background-color: rgba(0, 0, 0, 0.08);
    cursor: pointer;
  }

  & > tbody > tr:focus {
    outline: .1rem dashed black;
    outline-offset: -.1rem;
  }
}

.order-book-history__empty {
  display: flex;
  height: calc(100% - 7rem);
  justify-content: center;
  align-items: center;
}
</style>
