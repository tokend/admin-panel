<template>
  <div class="sale-rl">
    <h2>
      {{ "sale-request-list.header" | globalize }}
    </h2>

    <div class="sale-rl__filters-wrp">
      <div class="app-list-filters">
        <select-field
          class="app-list-filters__field"
          :label="'sale-request-list.lbl-state' | globalize"
          v-model="filters.state"
        >
          <option :value="REQUEST_STATES.pending">
            {{ "sale-request-list.pending" | globalize }}
          </option>
          <option :value="REQUEST_STATES.cancelled">
            {{ "sale-request-list.cancelled" | globalize }}
          </option>
          <option :value="REQUEST_STATES.approved">
            {{ "sale-request-list.approved" | globalize }}
          </option>
          <option :value="REQUEST_STATES.rejected">
            {{ "sale-request-list.rejected" | globalize }}
          </option>
          <option :value="REQUEST_STATES.permanentlyRejected">
            {{ "sale-request-list.perm-rejected" | globalize }}
          </option>
        </select-field>
        <!-- eslint-disable -->
        <input-field
          class="app-list-filters__field sale-rl__requestor-filter"
          :label="'sale-request-list.lbl-requestor' | globalize"
          :placeholder="'sale-request-list.placeholder-address-or-email' | globalize"
          v-model="filters.requestor"
          autocomplete-type="email"
        />
        <!-- eslint-enable -->
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
              {{ "sale-request-list.name" | globalize }}
            </span>
            <span class="app-list__cell">
              {{ "sale-request-list.hard-cap" | globalize }}
            </span>
            <span class="app-list__cell">
              {{ "sale-request-list.requestor" | globalize }}
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
              :title="item.requestDetails.baseAsset.id"
            >
              {{ item.requestDetails.baseAsset.id }}
            </span>
            <span
              class="app-list__cell"
              :title="item.requestDetails.creatorDetails.name"
            >
              {{ item.requestDetails.creatorDetails.name }}
            </span>
            <span class="app-list__cell">
              <asset-amount-formatter
                :amount="item.requestDetails.hardCap"
                :asset="item.requestDetails.defaultQuoteAsset.id"
              />
            </span>
            <span class="app-list__cell">
              <email-getter
                :account-id="item.requestor.id"
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
              {{ "sale-request-list.nothing-here-yet" | globalize }}
            </template>
            <template v-else>
              {{ "sale-request-list.loading" | globalize }}
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
import apiHelper from '@/apiHelper'
import { base } from '@tokend/js-sdk'

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
        response = await apiHelper.requests.getSaleCreateRequests(filters)
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      this.isLoaded = true
      return response
    },

    async getRequestorAccountId (requestor) {
      if (base.Keypair.isValidPublicKey(requestor)) {
        return requestor
      } else {
        try {
          const address = await apiHelper.users.getAccountIdByEmail(requestor)
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
