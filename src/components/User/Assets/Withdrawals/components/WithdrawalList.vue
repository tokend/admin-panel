<template>
  <div class="withdrawal-list">
    <div class="withdrawal-list__filters-wrp">
      <div class="app-list-filters">
        <select-field
          class="app-list-filters__field"
          :label="'withdrawal-list.lbl-state' | globalize"
          v-model="filters.state"
        >
          <option :value="REQUEST_STATES.pending">
            {{ "withdrawal-list.pending" | globalize }}
          </option>
          <option :value="REQUEST_STATES.approved">
            {{ "withdrawal-list.approved" | globalize }}
          </option>
          <option :value="REQUEST_STATES.permanentlyRejected">
            {{ "withdrawal-list.perm-rejected" | globalize }}
          </option>
        </select-field>

        <select-field
          v-if="assets.length"
          class="app-list-filters__field"
          :label="'withdrawal-list.lbl-asset' | globalize"
          v-model="filters.asset"
        >
          <option
            :value="item.id"
            v-for="item in assets"
            :key="item.id">
            {{ item.id }}
          </option>
        </select-field>

        <select-field
          v-else
          class="app-list-filters__field"
          :label="'withdrawal-list.lbl-asset' | globalize"
          value="no-assets"
          disabled
        >
          <option value="no-assets">
            {{ "withdrawal-list.no-assets" | globalize }}
          </option>
        </select-field>

        <input-field
          class="app-list-filters__field"
          :label="'withdrawal-list.lbl-requestor' | globalize"
          :placeholder="'withdrawal-list.placeholder-requestor' | globalize"
          autocomplete-type="email"
          v-model="filters.requestor"
        />
      </div>
    </div>

    <div class="withdrawal-list__list-wrp">
      <template v-if="list && list.length">
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">
              {{ "withdrawal-list.amount" | globalize }}
            </span>
            <span class="app-list__cell">
              {{ "withdrawal-list.status" | globalize }}
            </span>
            <span class="app-list__cell">
              {{ "withdrawal-list.requestor" | globalize }}
            </span>
          </div>

          <button
            class="app-list__li"
            v-for="item in list"
            :key="item.id"
            @click="requestToShow = item"
          >
            <!-- eslint-disable max-len -->
            <span class="app-list__cell">
              <asset-amount-formatter
                :amount="item.requestDetails.amount"
                :asset="item.requestDetails.asset.id"
              />
            </span>

            <span class="app-list__cell" :title="verbozify(item.state)">
              {{ verbozify(item.state) }}
            </span>

            <span class="app-list__cell" :title="item.requestor.id">
              {{ item.requestor.id }}
            </span>
          </button>
        </ul>
      </template>

      <template v-else>
        <ul class="app-list">
          <li class="app-list__li-like">
            <template v-if="isLoaded">
              {{ "withdrawal-list.fail-load" | globalize }}
            </template>
            <template v-else>
              {{ "withdrawal-list.loading" | globalize }}
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
          :page-limit="pageLimit"
        />
      </div>
    </div>

    <modal
      v-if="requestToShow && requestToShow.id"
      @close-request="requestToShow = null"
      max-width="60rem"
    >
      <withdrawal-details
        :request="requestToShow"
        @close-request="refreshList"
      />
    </modal>
  </div>
</template>

<script>
import SelectField from '@comcom/fields/SelectField'
import InputField from '@comcom/fields/InputField'
import { AssetAmountFormatter } from '@comcom/formatters'
import { CollectionLoader } from '@/components/common'

import Modal from '@comcom/modals/Modal'
import WithdrawalDetails from './WithdrawalDetails'

import { base } from '@tokend/js-sdk'

import { REQUEST_STATES, ASSET_POLICIES } from '@/constants'

import { verbozify } from '@/utils/verbozify'
import _ from 'lodash'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { api, loadingDataViaLoop } from '@/api'
import apiHelper from '@/apiHelper'

export default {
  components: {
    SelectField,
    InputField,
    Modal,
    WithdrawalDetails,
    AssetAmountFormatter,
    CollectionLoader,
  },

  data () {
    return {
      REQUEST_STATES,
      pageLimit: 15,

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
    'filters.state' () {
      this.reloadCollectionLoader()
    },

    'filters.asset' () {
      this.reloadCollectionLoader()
    },

    'filters.requestor': _.throttle(function () {
      this.reloadCollectionLoader()
    }, 1000),
  },

  created () {
    this.getAssets()
  },

  methods: {
    verbozify,

    async getAssets () {
      try {
        let response = await api.getWithSignature('/v3/assets')
        let data = await loadingDataViaLoop(response)
        this.assets = data
          .filter(item => item.policies.value & ASSET_POLICIES.withdrawable)
          .sort((assetA, assetB) => (assetA.id > assetB.id ? 1 : -1))

        if (this.assets.length) {
          this.filters.asset = this.assets[0].id
        }
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async getList () {
      this.isLoaded = false
      this.isNoMoreEntries = false
      let response = {}
      try {
        const requestor = await this.getRequestorAccountId(
          this.filters.requestor
        )
        response = await api.getWithSignature('/v3/create_withdraw_requests', {
          filter: {
            state: this.filters.state,
            requestor: requestor,
            'request_details.asset': this.filters.asset,
          },
          include: ['request_details'],
        })
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }

      this.isLoaded = true
      return response
    },

    setList (data) {
      this.list = data
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

    async extendList (data) {
      this.list = this.list.concat(data)
    },

    refreshList () {
      this.getList()
      this.requestToShow = null
    },

    reloadCollectionLoader () {
      this.$refs.collectionLoaderBtn.loadFirstPage()
    },
  },
}
</script>

<style scoped>
.withdrawal-list__filters-wrp {
  margin-bottom: 4rem;
}
</style>
