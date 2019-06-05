<template>
  <div class="sale-rl">
    <h2>
      Opportunity request list
    </h2>

    <div class="sale-rl__filters-wrp">
      <div class="app-list-filters">
        <select-field
          class="app-list-filters__field"
          label="State"
          v-model="filters.state"
        >
          <option :value="REQUEST_STATES.pending">
            Pending
          </option>
          <option :value="REQUEST_STATES.cancelled">
            Cancelled
          </option>
          <option :value="REQUEST_STATES.approved">
            Approved
          </option>
          <option :value="REQUEST_STATES.rejected">
            Rejected
          </option>
          <option :value="REQUEST_STATES.permanentlyRejected">
            Permanently rejected
          </option>
        </select-field>

        <input-field
          class="app-list-filters__field sale-rl__requestor-filter"
          label="Requestor"
          placeholder="Address or email"
          v-model="filters.requestor"
          autocomplete-type="email"
        />
      </div>
    </div>

    <div class="sale-rl__list-wrp">
      <template v-if="list && list.length">
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">
              <!-- empty -->
            </span>
            <span class="app-list__cell">
              Name
            </span>
            <span class="app-list__cell">
              Hard cap
            </span>
            <span class="app-list__cell">
              Requestor
            </span>
          </div>

          <router-link
            class="app-list__li"
            v-for="item in list"
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
              {{ extractDetails(item).details.name }}
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
      </template>

      <template v-else>
        <ul class="app-list">
          <li class="app-list__li-like">
            <template v-if="isLoaded">
              Nothing here yet
            </template>
            <template v-else>
              Loading...
            </template>
          </li>
        </ul>
      </template>

      <div class="app__more-btn-wrp">
        <collection-loader
          :first-page-loader="getList"
          @first-page-load="setList"
          @next-page-load="extendList"
          ref="collectionLoaderBtn"
        />
      </div>
    </div>
  </div>
</template>

<script>
import InputField from '@comcom/fields/InputField'
import SelectField from '@comcom/fields/SelectField'

import { REQUEST_STATES } from '@/constants'
import api from '@/api'
import { Sdk } from '@/sdk'

import { EmailGetter } from '@comcom/getters'
import { AssetAmountFormatter } from '@comcom/formatters'
import { CollectionLoader } from '@/components/common'

import _ from 'lodash'

import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    SelectField,
    InputField,
    EmailGetter,
    AssetAmountFormatter,
    CollectionLoader,
  },

  data () {
    return {
      REQUEST_STATES,

      list: [],
      filters: {
        state: REQUEST_STATES.pending,
        requestor: '',
      },
      isLoaded: false,
    }
  },

  watch: {
    'filters.state' () { this.reloadCollectionLoader() },

    'filters.requestor': _.throttle(function () {
      this.reloadCollectionLoader()
    }, 1000),
  },

  methods: {
    async getList () {
      this.isLoaded = false
      let response = {}
      try {
        const requestor =
          await this.getRequestorAccountId(this.filters.requestor)
        const filters = {
          state: this.filters.state,
          requestor,
        }
        response = await api.requests.getSaleRequests(filters)
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }

      this.isLoaded = true
      return response
    },

    async getRequestorAccountId (requestor) {
      if (Sdk.base.Keypair.isValidPublicKey(requestor)) {
        return requestor
      } else {
        try {
          const address = await api.users.getAccountIdByEmail(requestor)
          return address || requestor
        } catch (error) {
          return requestor
        }
      }
    },

    setList (data) {
      this.list = data
    },

    async extendList (data) {
      this.list = this.list.concat(data)
    },

    extractDetails (record) {
      const valuableRequestDetailsKey = Object.keys(record.details)
        .find(item => !/request_type|requestType/gi.test(item))
      return record.details[valuableRequestDetailsKey] || {}
    },

    reloadCollectionLoader () {
      this.$refs.collectionLoaderBtn.loadFirstPage()
    },
  },
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
