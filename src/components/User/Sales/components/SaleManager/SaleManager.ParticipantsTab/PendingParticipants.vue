<template>
  <div class="pending-participants">
    <h2>Pending deals</h2>

    <div class="pending-participants__filters">
      <select-field
        class="pending-participants__filter"
        v-model="filters.quoteAsset"
        label="Quote asset">
        <template v-if="get(sale, 'quoteAssets', []).length">
          <option
            :value="item.asset.id"
            v-for="(item, index) in sale.quoteAssets"
            :key="index"
          >
            {{ item.asset.id }}
          </option>
        </template>

        <template v-else>
          <option disabled>
            No options
          </option>
        </template>
      </select-field>
    </div>

    <template v-if="isLoaded && participants.length">
      <table class="pending-participants__table">
        <thead>
          <tr>
            <th>Investor</th>
            <th>Invested at</th>
            <th>{{ filters.quoteAsset }} invested</th>
            <th>{{ sale.baseAsset.id }} acquired</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(participant, index) in participants" :key="index">
            <td><email-getter :account-id="participant.ownerId" /></td>
            <td>
              <date-formatter
                :date="participant.createdAt"
                format="DD MMM YYYY HH:mm:ss"
              />
            </td>
            <td>{{ participant.quoteAmount }}</td>
            <td>{{ participant.baseAmount }}</td>
          </tr>
        </tbody>
      </table>
    </template>

    <template v-else-if="isLoaded && !participants.length">
      <p class="text">
        No investments yet.
      </p>
    </template>

    <template v-else-if="isFailed">
      <p class="text danger">
        An error occurred. Please try again later.
      </p>
    </template>

    <template v-else>
      <p>
        Loading...
      </p>
    </template>
  </div>
</template>

<script>
import { DateFormatter } from '@comcom/formatters'
import { EmailGetter } from '@comcom/getters'
import { SelectField } from '@comcom/fields'

import { Sdk } from '@/sdk'

import get from 'lodash/get'

export default {
  components: {
    DateFormatter,
    EmailGetter,
    SelectField,
  },

  props: {
    sale: { type: Object, required: true },
  },

  data () {
    return {
      participants: [],
      filters: {
        quoteAsset: get(this, 'sale.quoteAssets[0].asset.id', ''),
      },
      isLoaded: false,
      isFailed: false,
    }
  },

  watch: {
    'filters.quoteAsset' () { this.getParticipants() },
  },

  created () {
    this.getParticipants()
  },

  methods: {
    get,

    async getParticipants () {
      this.isLoaded = false
      this.isFailed = false

      const { id, baseAsset } = this.sale
      const quoteAsset = this.filters.quoteAsset

      try {
        // TODO: No ownerId property for orderBook yet
        const response = await Sdk.horizon.orderBook.getAll({
          order_book_id: id,
          base_asset: baseAsset.id,
          quote_asset: quoteAsset,
          is_buy: true,
        })
        this.participants = response.data
        this.isLoaded = true
      } catch (error) {
        this.isFailed = true
      }
    },
  },
}
</script>

<style scoped lang="scss">
$side-padding: 0.8rem;

.pending-participants__table {
  width: calc(100% + #{$side-padding} * 2);
  margin: 0 -$side-padding 0 -$side-padding;
  font-size: 1.6rem;
  border-collapse: collapse;

  & > thead > tr > th,
  & > tbody > tr > td {
    &:nth-child(1),
    &:nth-child(2) {
      text-align: left;
    }
    &:nth-child(3),
    &:nth-child(4) {
      text-align: right;
    }

    padding: 0.5rem 0;

    &:first-child {
      padding-left: $side-padding;
    }

    &:last-child {
      padding-right: $side-padding;
    }
  }

  & > tbody > tr:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
}

.pending-participants__filters {
  margin-top: -2.5rem;
  margin-bottom: 3rem;
  display: flex;

  & > .pending-participants__filter {
    flex: 1;
    max-width: 20rem;
  }
}
</style>
