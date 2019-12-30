<template>
  <div class="participants">
    <div class="participants__filters">
      <select-field
        class="participants__filter"
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
            {{ "participants.no-options" | globalize }}
          </option>
        </template>
      </select-field>
    </div>

    <template v-if="isLoaded && participants.length">
      <table class="participants__table">
        <thead>
          <tr>
            <th>{{ "participants.investor" | globalize }}</th>
            <th>{{ filters.quoteAsset }} invested</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in participants" :key="index">
            <td><email-getter :account-id="item.participant.id" /></td>
            <td>{{ item.amount }}</td>
          </tr>
        </tbody>
      </table>
    </template>

    <template v-else-if="isLoaded && !participants.length">
      <p class="text">
        {{ "participants.no-investments-yet" | globalize }}
      </p>
    </template>

    <template v-else-if="isFailed">
      <p class="text danger">
        {{ "participants.error" | globalize }}
      </p>
    </template>

    <template v-else>
      <p>
        {{ "participants.loading" | globalize }}
      </p>
    </template>
  </div>
</template>

<script>
import { EmailGetter } from '@comcom/getters'
import { SelectField } from '@comcom/fields'

import { api } from '@/api'

import get from 'lodash/get'

export default {
  components: {
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
      try {
        const endpoint = `/v3/sales/${this.sale.id}/relationships/participation`
        const { data } = await api.getWithSignature(endpoint, {
          filter: {
            'quote_asset': this.filters.quoteAsset,
          },
        })
        this.participants = data
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

.participants__table {
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

.participants__filters {
  margin-top: -2.5rem;
  margin-bottom: 3rem;
  display: flex;

  & > .participants__filter {
    flex: 1;
    max-width: 20rem;
  }
}
</style>
