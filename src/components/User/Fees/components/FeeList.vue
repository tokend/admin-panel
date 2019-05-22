<template>
  <div class="fee-list">
    <div class="fee-list__filters-wrp">
      <div class="fee-list__filters">
        <select-field
          class="fee-list__filter"
          label="Scope"
          v-model="filters.scope">
          <option :value="SCOPE_TYPES.global">
            Global
          </option>
          <option :value="SCOPE_TYPES.accountRole">
            Account type
          </option>
          <option :value="SCOPE_TYPES.account">
            Account
          </option>
        </select-field>

        <select-field
          class="fee-list__filter"
          label="Type"
          v-model="filters.feeType">
          <option :value="FEE_TYPES.paymentFee">
            Payment
          </option>
          <option :value="FEE_TYPES.offerFee">
            Order Match
          </option>
          <option :value="FEE_TYPES.withdrawalFee">
            Withdrawal
          </option>
          <option :value="FEE_TYPES.issuanceFee">
            Issuance
          </option>
          <option :value="FEE_TYPES.investFee">
            Invest
          </option>
          <option :value="FEE_TYPES.capitalDeploymentFee">
            Capital Deployment
          </option>
        </select-field>

        <select-field
          class="fee-list__filter"
          v-model.number="filters.paymentFeeSubtype"
          v-if="+filters.feeType === FEE_TYPES.paymentFee"
          label="Direction"
        >
          <option
            v-for="(value, name) in PAYMENT_FEE_TYPES"
            :key="`fee-list-item-option-${name}`"
            :value="value"
          >
            {{ name }}
          </option>
        </select-field>

        <select-field
          class="fee-list__filter"
          label="Asset"
          v-model="filters.assetCode"
        >
          <template v-if="assetsByType.length">
            <option
              v-for="item in assetsByType"
              :key="item.code"
              :value="item.code"
              :selected="item.code === filters.assetCode"
            >
              {{ item.code }}
            </option>
          </template>

          <template v-else>
            <option disabled>
              No appropriate assets
            </option>
          </template>
        </select-field>

        <select-field
          class="fee-list__filter"
          label="Account type"
          v-model="filters.accountRole"
          v-if="filters.scope === SCOPE_TYPES.accountRole"
        >
          <option :value="ACCOUNT_ROLES.general">
            General
          </option>
          <option :value="ACCOUNT_ROLES.notVerified">
            Not verified
          </option>
          <option :value="ACCOUNT_ROLES.corporate">
            Corporate
          </option>
        </select-field>

        <input-field
          class="fee-list__filter"
          label="Account"
          v-model="filters.accountAlias"
          placeholder="Email or account ID"
          v-if="filters.scope === SCOPE_TYPES.account"
          autocomplete-type="email"
        />
      </div>
    </div>

    <div class="fee-list__list-wrp">
      <template v-if="!Object.keys(fees).length">
        <div class="app-list">
          <p class="app-list__li-like">
            Loading...
          </p>
        </div>
      </template>

      <template
        v-else-if="filters.scope === SCOPE_TYPES.account &&
          !filters.accountAddress"
      >
        <div class="app-list">
          <p class="app-list__li-like">
            Please specify account
          </p>
        </div>
      </template>

      <template v-else-if="!feesByFilters.length">
        <div class="app-list">
          <p class="app-list__li-like">
            No fees available for current filter settings
          </p>
        </div>
      </template>

      <template v-else>
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">
              Lower bound
            </span>

            <span class="app-list__cell">
              Upper bound
            </span>

            <span class="app-list__cell">
              Percent fee
            </span>

            <span
              class="app-list__cell"
              v-if="+filters.feeType !== FEE_TYPES.offerFee &&
                +filters.feeType !== FEE_TYPES.capitalDeploymentFee"
            >
              Fixed fee
            </span>
            <span class="app-list__cell">
              <!-- empty -->
            </span>
          </div>

          <li
            class="app-list__li"
            v-for="(item, id) in feesByFilters"
            :key="id"
          >
            <fee-form
              :fee="item"
              :account-id="requestFilters.account_id"
              :account-role="requestFilters.account_type"
              @fee-updated="loadFees"
            />
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<script>
import { SelectField, InputField } from '@comcom/fields'
import FeeForm from './FeeForm'

import api from '@/api'
import { Sdk } from '@/sdk'

import { ErrorHandler } from '@/utils/ErrorHandler'
import config from '@/config'

import throttle from 'lodash/throttle'

import {
  ASSET_POLICIES,
  FEE_TYPES,
  PAYMENT_FEE_TYPES,
  DEFAULT_BASE_ASSET,
} from '@/constants'

const SCOPE_TYPES = Object.freeze({ // non-xdr values, internal use only
  account: 'USER',
  accountRole: 'ACCOUNT_TYPE',
  global: 'GLOBAL',
})

export default {
  components: {
    SelectField,
    InputField,
    FeeForm,
  },

  data () {
    return {
      SCOPE_TYPES,
      FEE_TYPES,
      ACCOUNT_ROLES: config.ACCOUNT_ROLES,
      PAYMENT_FEE_TYPES,

      assets: [{ code: DEFAULT_BASE_ASSET }],
      assetPairs: [],
      fees: {},
      isSubmitting: false,

      filters: {
        scope: SCOPE_TYPES.global,
        feeType: '' + FEE_TYPES.paymentFee,
        assetCode: DEFAULT_BASE_ASSET,

        // secondary
        accountRole: config.ACCOUNT_ROLES.general,
        accountAlias: '', // address or email
        accountAddress: '', // address will be inserted here

        // every fee has a subtype, but we're interested only in payment's
        paymentFeeSubtype: PAYMENT_FEE_TYPES.outgoing,
      },
    }
  },

  computed: {
    assetsByType () {
      let result
      switch (+this.filters.feeType) {
        case FEE_TYPES.paymentFee:
          result = this.assets
            .filter(item => item.policy & ASSET_POLICIES.transferable)
          break
        case FEE_TYPES.offerFee:
          result = this.assets
            .filter(item => this.assetPairs
              .filter(el => el.quote === item.code).length
            )
          break
        case FEE_TYPES.issuanceFee:
          result = this.assets.filter(item => +item.maxIssuanceAmount)
          break
        case FEE_TYPES.withdrawalFee:
          result = this.assets
            .filter(item => +item.policy & ASSET_POLICIES.withdrawable)
          break
        default:
          result = this.assets
          break
      }
      return result
    },

    feesByFilters () {
      const isFeeListEmpty = !Object.keys(this.fees).length
      const isInvalidAsset = !this.filters.assetCode
      if (isFeeListEmpty || isInvalidAsset) return []

      const type = +this.filters.feeType
      const asset = this.filters.assetCode
      const paymentFeeSubtype = +this.filters.paymentFeeSubtype

      // TODO: fetch from /v3/fees/ instead
      const filtered = Object.entries(this.fees)
        .find(([key]) => key.toLowerCase() === asset.toLowerCase())
      return filtered[1]
        .filter((item) => item.feeType === type)
        .filter((item) => {
          return type === FEE_TYPES.paymentFee
            ? item.subtype === paymentFeeSubtype
            : true
        })
    },

    requestFilters () {
      if (!Object.keys(this.filters).length) return this.filters

      const result = {}

      if (this.filters.scope === SCOPE_TYPES.accountRole) {
        // snake_case because sdk wait for it
        result.account_type = this.filters.accountRole
      } else if (this.filters.scope === SCOPE_TYPES.account) {
        // snake_case because sdk wait for it
        result.account_id = this.filters.accountAddress
      }

      return result
    },
  },

  watch: {
    'assetsByType': function () {
      const isSelectedAssetInRange = this.assetsByType
        .filter(item => item.code === this.filters.assetCode)
        .length

      if (!isSelectedAssetInRange) {
        try {
          this.filters.assetCode = this.assetsByType[0].code
        } catch (error) {
          this.filters.assetCode = null
        }
      }
    },

    'filters.scope': function (newValue) {
      if (!(newValue === SCOPE_TYPES.account && !this.filters.accountAddress)) {
        this.loadFees()
      }
    },

    'filters.accountRole': function () {
      this.loadFees()
    },

    'filters.accountAddress': function (newValue) {
      if (newValue) {
        this.loadFees()
      }
    },

    'filters.accountAlias': throttle(async function () {
      const alias = this.filters.accountAlias
      if (!alias) return

      let address = ''
      if (Sdk.base.Keypair.isValidPublicKey(alias)) {
        address = alias
      } else {
        try {
          address = await api.users.getAccountIdByEmail(alias)
        } catch (error) {
          address = ''
        }
      }
      this.filters.accountAddress = address
    }, 1000),
  },

  created () {
    this.getAssetsAndPairs()
    this.loadFees()
  },

  methods: {
    async getAssetsAndPairs () {
      try {
        const response = await Sdk.horizon.assets.getAll()
        this.assets = response.data
        const assetsResponse = await Sdk.horizon.assetPairs.getAll()
        this.assetPairs = assetsResponse.data
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async loadFees () {
      this.fees = {}
      try {
        const response = await Sdk.horizon.fees.getAll(this.requestFilters)
        this.fees = response.data.fees
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async updateFee (fees) {
      await this.loadFees()
    },
  },
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss/colors";

.fee-list__filters-wrp {
  margin-bottom: 4rem;
}

.fee-list__filters {
  background-color: $color-content-bg;
  border-radius: 0.3rem;
  box-shadow: 0.7px 0.7px 5.6px 0.4px rgba(170, 170, 170, 0.72);
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.fee-list__filter {
  width: calc(33.333333% - 2rem);
  margin: 1rem;
}
</style>
