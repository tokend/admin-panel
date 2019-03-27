<template>
  <div class="sale-rl">
    <h2>
      Fund request list
    </h2>

    <div class="sale-rl__filters-wrp">
      <div class="app-list-filters">
        <select-field
          class="app-list-filters__field"
          label="State"
          v-model="filters.state"
        >
          <option :value="REQUEST_STATES.pending">Pending</option>
          <option :value="REQUEST_STATES.cancelled">Cancelled</option>
          <option :value="REQUEST_STATES.approved">Approved</option>
          <option :value="REQUEST_STATES.rejected">Rejected</option>
          <option :value="REQUEST_STATES.permanentlyRejected">Permanently rejected</option>
        </select-field>

        <input-field
          class="app-list-filters__field sale-rl__requestor-filter"
          label="Requestor"
          placeholder="Address (full match)"
          v-model="filters.requestor"
          autocomplete-type="email"
        />
      </div>
    </div>

    <div class="sale-rl__list-wrp">
      <template v-if="list.data && list.data.length">
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">
              <!-- empty --></span>
            <span class="app-list__cell">Name</span>
            <span class="app-list__cell">Hard cap</span>
            <span class="app-list__cell">Requestor</span>
          </div>

          <router-link
            class="app-list__li"
            v-for="item in list.data"
            :key="item.id"
            :to="{ name: 'sales.requests.show', params: { id: item.id }}"
          >
            <span
              class="app-list__cell app-list__cell--important"
              :title="item.baseAsset"
            >
              {{ extractDetails(item).baseAsset }}
            </span>
            <span
              class="app-list__cell"
              :title="extractDetails(item).details.name"
            >
              {{extractDetails(item).details.name}}
            </span>
            <span class="app-list__cell">
              <asset-amount-formatter
                :amount="extractDetails(item).hardCap"
                :asset="extractDetails(item).defaultQuoteAsset"
              />
            </span>
            <span class="app-list__cell">
              <email-getter
                :account-id="item.requestor"
                is-titled
              />
            </span>
          </router-link>
        </ul>

        <div
          class="app__more-btn-wrp"
          v-if="!isNoMoreEntries"
        >
          <button
            class="app__btn-secondary"
            @click="getMoreEntries"
          >
            More
          </button>
        </div>
      </template>

      <template v-else>
        <ul class="app-list">
          <li class="app-list__li-like">
            <template v-if="isLoaded">Nothing here yet</template>
            <template v-else>Loading...</template>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<script>
import api from '@/api'
import { REQUEST_STATES } from '@/constants'
import SelectField from '@comcom/fields/SelectField'
import InputField from '@comcom/fields/InputField'
import { EmailGetter } from '@comcom/getters'
import { AssetAmountFormatter } from '@comcom/formatters'
import _ from 'lodash'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    SelectField,
    InputField,
    EmailGetter,
    AssetAmountFormatter
  },

  data () {
    return {
      REQUEST_STATES,

      list: {},
      filters: {
        state: REQUEST_STATES.pending,
        requestor: ''
      },
      isLoaded: false,
      isNoMoreEntries: false
    }
  },

  created () {
    this.getList()
  },

  methods: {
    async getList () {
      this.isLoaded = false
      this.isNoMoreEntries = false

      try {
        const filters = { ...this.filters }
        this.list = await api.requests.getSaleRequests(filters)
      } catch (error) {
        error.showMessage('Cannot get fund request list. Please try again later')
      }

      this.isLoaded = true
    },

    async getMoreEntries () {
      try {
        const oldLength = (this.list.data || []).length
        const chunk = await this.list.fetchNext()
        this.list._data = this.list.data.concat(chunk.data)
        this.list.fetchNext = chunk.fetchNext
        this.isNoMoreEntries = oldLength === this.list.data.length
      } catch (error) {
        ErrorHandler.process(error)
      }
    },

    extractDetails (record) {
      const valuableRequestDetailsKey = Object.keys(record.details)
        .find(item => !/request_type|requestType/gi.test(item))
      return record.details[valuableRequestDetailsKey] || {}
    }
  },

  watch: {
    'filters.state' () { this.getList() },
    'filters.requestor': _.throttle(function () { this.getList() }, 1000)
  }
}
</script>

<style scoped>
.sale-rl__filters-wrp {
  margin-bottom: 4rem;
}

.sale-rl__requestor-filter {
  flex: 3.18;
}
</style>
