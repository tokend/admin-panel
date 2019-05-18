<template>
  <div class="collected-fees-withdrawals">
    <h2>
      Withdrawals
    </h2>

    <div class="collected-fees-withdrawals__filters-wrp">
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
            Canceled
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

        <select-field
          class="app-list-filters__field"
          label="Asset"
          v-model="filters.assetCode"
        >
          <option
            v-for="item in assetCodes"
            :key="item"
            :value="item"
          >
            {{ item }}
          </option>
        </select-field>
      </div>
    </div>

    <div class="withdrawal-list__list-wrp">
      <template v-if="withdrawals.data && withdrawals.data.length">
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">
              Source amount
            </span>
            <span class="app-list__cell">
              Destination amount
            </span>
            <span class="app-list__cell">
              Status
            </span>
          </div>

          <button
            class="app-list__li"
            v-for="item in list.data"
            :key="item.id"
          >
            <!-- @click="requestToShow = item" -->
            <!-- eslint-disable max-len -->
            <asset-amount-formatter
              class="app-list__cell"
              is-titled
              :amount="item.details.withdraw.amount"
              :asset="item.details.withdraw.destAssetCode"
            />

            <span
              class="app-list__cell"
              :title="`${localize(item.destAssetAmount)} ${item.destAssetCode}`"
            >
              {{ localize(item.details.withdraw.destAssetAmount) }}&nbsp;{{ item.details.withdraw.destAssetCode }}
            </span>

            <span
              class="app-list__cell"
              :title="verbozify(item.requestState)"
            >
              {{ verbozify(item.requestState) }}
            </span>
          </button>
        </ul>

        <div class="app__more-btn-wrp">
          <collection-loader
            :first-page-loader="getWithdrawals"
            @first-page-load="setWithdrawals"
            @next-page-load="extendWithdrawals"
            ref="collectionLoaderBtn"
          />
        </div>
      </template>

      <template v-else>
        <ul class="app-list">
          <li class="app-list__li-like">
            <template v-if="isWithdrawalsLoading">
              <p>
                Loading...
              </p>
            </template>

            <template v-else-if="isWithdrawalsFailed">
              <p class="danger">
                An error occurred. Please try again later
              </p>
            </template>

            <template v-else>
              <p>
                Nothing here yet
              </p>
            </template>
          </li>
        </ul>
      </template>
    </div>

    <!-- <modal
      v-if="requestToShow && requestToShow.id"
      @close-request="requestToShow = null"
      max-width="60rem">
      <withdrawal-details
        :request="requestToShow"
        :assetCodes="assetCodes"
        @close-request="refreshList" />
    </modal> -->
  </div>
</template>

<script>
import Vue from 'vue'

import SelectField from '@comcom/fields/SelectField'
import { CollectionLoader } from '@comcom'
import { AssetAmountFormatter } from '@comcom/formatters'

// TODO: restore withdraw details modal
// import Modal from '@comcom/modals/Modal'
// import WithdrawalDetails from './WithdrawalDetails'

import { REQUEST_STATES } from '@/constants'

import { verbozify } from '@/utils/verbozify'
import localize from '@/utils/localize'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { clearObject } from '@/utils/clearObject'
import { ApiCallerFactory } from '@/api-caller-factory'

export default {
  components: {
    SelectField,
    CollectionLoader,
    AssetAmountFormatter,
    // Modal,
    // WithdrawalDetails,
  },

  data () {
    return {
      REQUEST_STATES,

      assetCodes: [],
      withdrawals: {},
      // requestToShow: {},
      filters: {
        state: REQUEST_STATES.pending,
        assetCode: '',
      },
      isWithdrawalsLoading: false,
      isWithdrawalsFailed: false,
      isAssetCodesLoading: false,
      isAssetCodesFailed: false,
    }
  },

  watch: {
    'filters.state' () { this.getWithdrawals() },
    'filters.assetCode' () { this.getWithdrawals() },
  },

  created () {
    this.loadAssetCodes()
  },

  methods: {
    verbozify,
    localize,

    async loadAssetCodes () {
      this.isAssetCodesLoading = true
      this.isAssetCodesFailed = false
      try {
        const { data: { balances: assetCodes } } = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature(`/v3/accounts/${Vue.params.MASTER_ACCOUNT}`, {
            include: ['balances.state'],
          })

        this.assetCodes = assetCodes
          .map(item => item.asset.id)

        if (this.assetCodes.length) {
          this.filters.assetCode = this.assetCodes[0]
        }
      } catch (err) {
        ErrorHandler.processWithoutFeedback(err)
        this.isAssetCodesFailed = true
        this.assetCodes = []
      }
      this.isAssetCodesLoading = false
    },

    async getWithdrawals () {
      this.isWithdrawalsLoading = true
      let response = {}
      try {
        response = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature(`/v3/create_withdraw_requests`, {
            filter: clearObject({
              requestor: Vue.params.MASTER_ACCOUNT,
              state: this.filters.state,
              // TODO: tmp disabled
              // 'request_details.asset': this.filters.assetCode,
            }),
          })
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
        this.isWithdrawalsFailed = true
        this.withdrawals = []
      }
      this.isWithdrawalsLoading = false
      return response
    },

    setWithdrawals (data) {
      this.withdrawals = data
    },

    async extendWithdrawals (data) {
      this.withdrawals = this.withdrawals.concat(data)
    },
  },
}
</script>

<style scoped>
.collected-fees-withdrawals__filters-wrp {
  margin-bottom: 4rem;
}
</style>
