<template>
  <div class="pending-participants">
    <h2>Pending deals</h2>

    <div class="pending-participants__filters">
      <select-field class="pending-participants__filter"
        v-model="filters.quoteAsset"
        label="Quote asset">
        <template v-if="get(sale, 'quoteAssets.quoteAssets', []).length">
          <option :value="item.asset"
            v-for="(item, index) in sale.quoteAssets.quoteAssets"
            :key="index"
          >{{item.asset}}</option>
        </template>

        <template v-else>
          <option disabled>No options</option>
        </template>
      </select-field>
    </div>

    <template v-if="isLoaded && participants.length">
      <table class="pending-participants__table">
        <thead>
          <tr>
            <th>Investor</th>
            <th>Invested at</th>
            <th>{{filters.quoteAsset}} invested</th>
            <th>{{sale.baseAsset}} acquired</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(participant, index) in participants" :key="index">
            <td><email-getter :address="participant.ownerId" /></td>
            <td><date-formatter :date="participant.createdAt" format="DD MMM YYYY HH:mm:ss" /></td>
            <td>{{participant.quoteAmount}}</td>
            <td>{{participant.baseAmount}}</td>
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
import api from '@/api'
import { DateFormatter } from '@comcom/formatters'
import { EmailGetter } from '@comcom/getters'
import { SelectField } from '@comcom/fields'
import get from 'lodash/get'

export default {
  data () {
    return {
      participants: [],
      filters: {
        quoteAsset: get(this, 'sale.quoteAssets.quoteAssets[0].asset', '')
      },
      isLoaded: false,
      isFailed: false
    }
  },

  components: {
    DateFormatter,
    EmailGetter,
    SelectField
  },

  props: ['sale'],

  created () {
    this.getParticipants()
  },

  watch: {
    'filters.quoteAsset' () { this.getParticipants() }
  },

  methods: {
    get,

    async getParticipants () {
      this.isLoaded = false
      this.isFailed = false

      const { id, baseAsset } = this.sale
      const quoteAsset = this.filters.quoteAsset

      try {
        const params = { saleId: id, baseAsset, quoteAsset }
        const response = await api.sales.getParticipants(params)
        this.participants = response.data
        this.isLoaded = true
      } catch (error) {
        this.isFailed = true
      }
    }
  }
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
