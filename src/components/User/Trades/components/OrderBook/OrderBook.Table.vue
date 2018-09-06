<template>
  <div class="order-book-table" :class="{ 'order-book-table--rtl': isRtl }">
    <div class="app__block">
      <h2>{{ isBids ? 'Bids' : 'Asks' }}</h2>
      <template v-if="summedList && summedList.length">
        <div class="order-book-table__table-wrp">
          <table class="order-book-table__table">
            <thead>
              <tr>
                <template v-if="isRtl">
                  <th>Summary ({{quoteAsset}})</th>
                  <th>Volume ({{quoteAsset}})</th>
                  <th>Amount ({{baseAsset}})</th>
                  <th>Price ({{quoteAsset}})</th>
                </template>
                <template v-else>
                  <th>Price ({{quoteAsset}})</th>
                  <th>Amount ({{baseAsset}})</th>
                  <th>Volume ({{quoteAsset}})</th>
                  <th>Summary ({{quoteAsset}})</th>
                </template>
              </tr>
            </thead>

            <tbody>
            <tr v-for="(item, index) in summedList" :key="index" tabindex="0"
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
          No data yet
        </p>
      </template>
    </div>

    <modal class="order-book-table__modal"
      v-if="isDetailsShown"
      @close-request="hideItemDetails()"
      max-width="45rem">
      <h2>Offer details</h2>

      <ul class="key-value-list">
        <li>
          <span>ID</span>
          <span>{{itemDetails.offerId}}</span>
        </li>
        <li>
          <span>Type</span>
          <span>
            <template v-if="itemDetails.isBuy">Bid</template>
            <template v-else>Ask</template>
          </span>
        </li>
        <li>
          <span>Offered at</span>
          <date-formatter :date="itemDetails.createdAt" format="DD MMM YYYY [at] HH:mm:ss" />
        </li>
        <li>
          <span>Offerer</span>
          <email-getter :address="itemDetails.ownerId" is-titled />
        </li>
        <li>
          <span>Offered amount</span>
          <asset-amount-formatter :amount="itemDetails.baseAmount" :asset="itemDetails.baseAssetCode" />
        </li>
        <li>
          <span>Price per {{itemDetails.baseAssetCode}}</span>
          <asset-amount-formatter :amount="itemDetails.price" :asset="itemDetails.quoteAssetCode" />
        </li>
        <li>
          <span>Total price</span>
          <asset-amount-formatter :amount="itemDetails.quoteAmount" :asset="itemDetails.quoteAssetCode" />
        </li>
      </ul>
    </modal>
  </div>
</template>

<script>
import { AssetPair } from '../../models/AssetPair'
import { AssetAmountFormatter, DateFormatter } from '@comcom/formatters'
import { EmailGetter } from '@comcom/getters'
import Modal from '@comcom/modals/Modal'

const EMPTY_DETAILS = Object.freeze({})

export default {
  components: {
    AssetAmountFormatter,
    DateFormatter,
    EmailGetter,
    Modal
  },

  data () {
    return {
      quoteAsset: '',
      baseAsset: '',
      summedList: [],
      isDetailsShown: false,
      itemDetails: Object.assign({}, EMPTY_DETAILS)
    }
  },

  props: ['list', 'pair', 'is-bids', 'is-rtl'],

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
    }
  },

  watch: {
    list () { this.calcSummedList() }
  }
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
