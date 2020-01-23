<template>
  <div class="order-book-table" :class="{ 'order-book-table--rtl': isRtl }">
    <div class="app__block">
      <h2 v-if="isBids">
        {{ "order-book-table.header-bids" | globalize }}
      </h2>
      <h2 v-else>
        {{ "order-book-table.header-asks" | globalize }}
      </h2>
      <template v-if="summedList && summedList.length">
        <div class="order-book-table__table-wrp">
          <table class="order-book-table__table">
            <thead>
              <tr>
                <template v-if="isRtl">
                  <th>
                    {{ "order-book-table.summary" | globalize({
                      quoteAsset: quoteAsset
                    })
                    }}
                  </th>
                  <th>
                    {{ "order-book-table.volume" | globalize({
                      quoteAsset: quoteAsset
                    })
                    }}
                  </th>
                  <th>
                    {{ "order-book-table.amount" | globalize({
                      baseAsset: baseAsset
                    })
                    }}
                  </th>
                  <th>
                    {{ "order-book-table.price" | globalize({
                      quoteAsset: quoteAsset
                    })
                    }}
                  </th>
                </template>
                <template v-else>
                  <th>
                    {{ "order-book-table.price" | globalize({
                      quoteAsset: quoteAsset
                    })
                    }}
                  </th>
                  <th>
                    {{ "order-book-table.amount" | globalize({
                      baseAsset: baseAsset
                    })
                    }}
                  </th>
                  <th>
                    {{ "order-book-table.volume" | globalize({
                      quoteAsset: quoteAsset
                    })
                    }}
                  </th>
                  <th>
                    {{ "order-book-table.summary" | globalize({
                      quoteAsset: quoteAsset
                    })
                    }}
                  </th>
                </template>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(item, index) in summedList"
                :key="index"
                tabindex="0"
                @click="showItemDetails(item)"
                @keyup.enter.stop.prevent="showItemDetails(item)"
                @keyup.space.stop.prevent="showItemDetails(item)">
                <template v-if="isRtl">
                  <td><asset-amount-formatter :amount="item.sum" /></td>
                  <td><asset-amount-formatter :amount="item.quoteAmount" /></td>
                  <td><asset-amount-formatter :amount="item.baseAmount" /></td>
                  <td><asset-amount-formatter :amount="item.price" /></td>
                </template>
                <template v-else>
                  <td><asset-amount-formatter :amount="item.price" /></td>
                  <td><asset-amount-formatter :amount="item.baseAmount" /></td>
                  <td><asset-amount-formatter :amount="item.quoteAmount" /></td>
                  <td><asset-amount-formatter :amount="item.sum" /></td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <template v-else>
        <p class="text order-book-table__empty">
          {{ "order-book-table.no-data" | globalize }}
        </p>
      </template>
    </div>

    <modal
      class="order-book-table__modal"
      v-if="isDetailsShown"
      @close-request="hideItemDetails()"
      max-width="45rem">
      <h2>{{ "order-book-table.offer-details" | globalize }}</h2>

      <ul class="key-value-list">
        <li>
          <span>{{ "order-book-table.id" | globalize }}</span>
          <span>{{ itemDetails.id }}</span>
        </li>
        <li>
          <span>{{ "order-book-table.tupe" | globalize }}</span>
          <span>
            <template v-if="itemDetails.isBuy">
              {{ "order-book-table.bid" | globalize }}
            </template>
            <template v-else>
              {{ "order-book-table.ask" | globalize }}
            </template>
          </span>
        </li>
        <li>
          <span>{{ "order-book-table.offered-at" | globalize }}</span>
          <span>
            {{ itemDetails.createdAt | formatDate }}
          </span>
        </li>
        <li>
          <span>{{ "order-book-table.offerer" | globalize }}</span>
          <email-getter :account-id="itemDetails.ownerId" is-titled />
        </li>
        <li>
          <span>{{ "order-book-table.offered-amount" | globalize }}</span>
          <asset-amount-formatter
            :amount="itemDetails.baseAmount"
            :asset="itemDetails.baseAssetCode"
          />
        </li>
        <li>
          <span>
            <!-- eslint-disable-next-line max-len -->
            {{ "order-book-table.price-per-item-details-asset-code" | globalize }}
          </span>
          <asset-amount-formatter
            :amount="itemDetails.price"
            :asset="itemDetails.quoteAssetCode"
          />
        </li>
        <li>
          <span>{{ "order-book-table.total-price" | globalize }}</span>
          <asset-amount-formatter
            :amount="itemDetails.quoteAmount"
            :asset="itemDetails.quoteAssetCode"
          />
        </li>
      </ul>
    </modal>
  </div>
</template>

<script>
import { AssetPair } from '../../models/AssetPair'

import { AssetAmountFormatter } from '@comcom/formatters'
import { EmailGetter } from '@comcom/getters'
import Modal from '@comcom/modals/Modal'

const EMPTY_DETAILS = Object.freeze({})

export default {
  components: {
    AssetAmountFormatter,
    EmailGetter,
    Modal,
  },

  props: {
    list: { type: Array, required: true },
    pair: { type: String, required: true },
    isBids: { type: Boolean, default: false },
    isRtl: { type: Boolean, default: false },
  },

  data () {
    return {
      quoteAsset: '',
      baseAsset: '',
      summedList: [],
      isDetailsShown: false,
      itemDetails: Object.assign({}, EMPTY_DETAILS),
    }
  },

  watch: {
    list () {
      this.calcSummedList()
      this.parsePair()
    },
  },

  created () {
    this.parsePair()
    this.calcSummedList()
  },

  methods: {
    parsePair () {
      const pair = new AssetPair(this.pair)
      this.baseAsset = pair.base
      this.quoteAsset = pair.quote
    },

    calcSummedList () {
      this.summedList = this.list.map(function (item, index, array) {
        const prevSum = index > 0 ? array[index - 1].sum : 0
        item.sum = prevSum + +item.quoteAmount
        return item
      })
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

$side-padding: 0.5rem;

.order-book-table {
  height: 30rem;
}

.app__block {
  padding: 3rem;
  height: 100%;
  display: flex;
  flex-direction: column;

  & > h2 {
    margin-bottom: 1.5rem;
  }
}

.order-book-table__table-wrp {
  flex: 1;
  overflow-y: auto;
  margin: 0;
  margin-left: -$side-padding;
  margin-right: -$side-padding;
}

.order-book-table__table {
  width: 100%;
  font-size: 1.6rem;
  border-collapse: collapse;

  & > thead > tr > th {
    font-size: 1.2rem;
  }

  & > thead > tr > th,
  & > tbody > tr > td {
    text-align: right;
    padding: 0.5rem $side-padding;

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

.order-book-table--rtl {
  & > .app__block {
    transform: rotateY(180deg);
    -ms-transform: rotateY(180deg); /* IE 9 */
    -webkit-transform: rotateY(180deg); /* Safari and Chrome */

    & > h2,
    & > .order-book-table__table-wrp > .order-book-table__table,
    & > .order-book-table__empty {
      transform: rotateY(180deg);
      -ms-transform: rotateY(180deg); /* IE 9 */
      -webkit-transform: rotateY(180deg); /* Safari and Chrome */
    }

    & > h2 {
      text-align: right;
    }

    & > .order-book-table__table-wrp > .order-book-table__table {
      & > thead > tr > th,
      & > tbody > tr > td {
        text-align: left;

        &:last-child {
          text-align: right;
        }
      }
    }
  }
}

.order-book-table__empty {
  display: flex;
  height: calc(100% - 7rem);
  justify-content: center;
  align-items: center;
}
</style>
