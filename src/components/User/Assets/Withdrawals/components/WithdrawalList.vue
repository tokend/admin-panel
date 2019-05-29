<template>
  <div class="withdrawal-list">
    <div class="withdrawal-list__filters-wrp">
      <div class="app-list-filters">
        <select-field
          class="app-list-filters__field"
          label="State"
          v-model="filters.state">
          <option :value="REQUEST_STATES.pending">
            Pending
          </option>
          <option :value="REQUEST_STATES.approved">
            Approved
          </option>
          <option :value="REQUEST_STATES.permanentlyRejected">
            Permanently rejected
          </option>
        </select-field>

        <select-field
          v-if="assets.length"
          class="app-list-filters__field"
          label="Asset"
          v-model="filters.asset">
          <option
            :value="item.code"
            v-for="item in assets"
            :key="item.code"
          >
            {{ item.code }}
          </option>
        </select-field>

        <select-field
          v-else
          class="app-list-filters__field"
          label="Asset"
          value="no-assets"
          disabled
        >
          <option value="no-assets">
            No withdrawable assets
          </option>
        </select-field>

        <input-field
          class="app-list-filters__field"
          label="Requestor"
          placeholder="Requestor"
          autocomplete-type="email"
          v-model="filters.requestor"
        />
      </div>
    </div>

    <div class="withdrawal-list__list-wrp">
      <template v-if="list.data && list.data.length">
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">
              Amount
            </span>
            <span class="app-list__cell">
              Status
            </span>
            <span class="app-list__cell">
              Requestor
            </span>
          </div>

          <button
            class="app-list__li"
            v-for="item in list.data"
            :key="item.id"
            @click="requestToShow = item">
            <!-- eslint-disable max-len -->
            <span class="app-list__cell">
              <asset-amount-formatter
                :amount="item.details.createWithdraw.amount"
                :asset="item.details.createWithdraw.asset"
              />
            </span>

            <span class="app-list__cell" :title="verbozify(item.requestState)">
              {{ verbozify(item.requestState) }}
            </span>

            <span class="app-list__cell" :title="item.requestor">
              {{ item.requestor }}
            </span>
          </button>
        </ul>

        <div class="app__more-btn-wrp" v-if="!isNoMoreEntries">
          <button class="app__btn-secondary" @click="extendList">
            More
          </button>
        </div>
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
    </div>

    <modal
      v-if="requestToShow && requestToShow.id"
      @close-request="requestToShow = null"
      max-width="60rem">
      <withdrawal-details
        :request="requestToShow"
        @close-request="refreshList" />
    </modal>
  </div>
</template>

<script>
import SelectField from '@comcom/fields/SelectField'
import InputField from '@comcom/fields/InputField'
import { AssetAmountFormatter } from '@comcom/formatters'

import Modal from '@comcom/modals/Modal'
import WithdrawalDetails from './WithdrawalDetails'

import api from '@/api'
import { Sdk } from '@/sdk'

import {
  REQUEST_STATES,
  ASSET_POLICIES,
} from '@/constants'

import { verbozify } from '@/utils/verbozify'
import _ from 'lodash'

import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    SelectField,
    InputField,
    Modal,
    WithdrawalDetails,
    AssetAmountFormatter,
  },

  data () {
    return {
      REQUEST_STATES,

      assets: [],
      list: {},
      requestToShow: {},
      filters: {
        state: REQUEST_STATES.pending,
        asset: '',
        requestor: '',
      },
      isLoaded: false,
      isNoMoreEntries: false,
    }
  },

  watch: {
    'filters.state' () { this.getList() },

    'filters.asset' () { this.getList() },

    'filters.requestor': _.throttle(function () { this.getList() }, 1000),
  },

  created () {
    this.getAssets()
    this.getList()
  },

  methods: {
    verbozify,

    async getAssets () {
      try {
        const response = await Sdk.horizon.assets.getAll()
        this.assets = response.data
          .filter(item => (item.policy & ASSET_POLICIES.withdrawable))
          .sort((assetA, assetB) => assetA.code > assetB.code ? 1 : -1)

        if (this.assets.length) {
          this.filters.asset = this.assets[0].code
        }
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async getList () {
      this.isLoaded = false
      this.isNoMoreEntries = false
      try {
        const requestor =
          await this.getRequestorAccountId(this.filters.requestor)
        const list = await api.requests.getWithdrawalRequests({
          state: this.filters.state,
          asset: this.filters.asset,
          requestor: requestor,
        })

        // TODO: remove these dirty fixes
        // the problem is that in the current implementation, back-end does
        // not return us asset code of the withdrawn amount
        list._data = list.data.map(item => {
          const hackedKeys = {
            details: {
              ...item.details,
              createWithdraw: {
                ...item.details.createWithdraw,
                asset: this.filters.asset
              },
            },
          }

          return {
            ...item,
            ...hackedKeys,
          }
        })

        this.list = list
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }

      this.isLoaded = true
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

    async extendList () {
      try {
        const oldLength = (this.list.data || []).length
        const chunk = await this.list.fetchNext()

        // TODO: remove these dirty fixes
        // the problem is that in the current implementation, back-end does
        // not return us asset code of the withdrawn amount
        chunk._data = chunk.data.map(item => {
          const hackedKeys = {
            details: {
              ...item.details,
              createWithdraw: {
                ...item.details.createWithdraw,
                asset: this.filters.asset
              },
            },
          }

          return {
            ...item,
            ...hackedKeys,
          }
        })

        this.list._data = this.list.data.concat(chunk.data)
        this.list.fetchNext = chunk.fetchNext
        this.isNoMoreEntries = oldLength === this.list.data.length
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    refreshList () {
      this.getList()
      this.requestToShow = null
    },
  },
}
</script>

<style scoped>
  .withdrawal-list__filters-wrp {
    margin-bottom: 4rem;
  }
</style>
