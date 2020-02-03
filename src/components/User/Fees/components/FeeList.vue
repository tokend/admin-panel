<template>
  <div class="fee-list">
    <template v-if="isLoaded">
      <div class="fee-list__filters-wrp">
        <div class="fee-list__filters">
          <select-field
            class="fee-list__filter"
            :label="'fee-list.lbl-scope' | globalize"
            v-model="filters.scope"
          >
            <option :value="SCOPE_TYPES.global">
              {{ "fee-list.global" | globalize }}
            </option>
            <option :value="SCOPE_TYPES.accountRole">
              {{ "fee-list.account-type" | globalize }}
            </option>
            <option :value="SCOPE_TYPES.account">
              {{ "fee-list.account" | globalize }}
            </option>
          </select-field>

          <select-field
            class="fee-list__filter"
            :label="'fee-list.lbl-type' | globalize"
            v-model="filters.feeType"
          >
            <option :value="FEE_TYPES.paymentFee">
              {{ "fee-list.payment" | globalize }}
            </option>
            <option :value="FEE_TYPES.offerFee">
              {{ "fee-list.order-match" | globalize }}
            </option>
            <option :value="FEE_TYPES.withdrawalFee">
              {{ "fee-list.withdrawal" | globalize }}
            </option>
            <option :value="FEE_TYPES.issuanceFee">
              {{ "fee-list.issuance" | globalize }}
            </option>
            <option :value="FEE_TYPES.investFee">
              {{ "fee-list.invest" | globalize }}
            </option>
            <option :value="FEE_TYPES.capitalDeploymentFee">
              {{ "fee-list.capital-deployment" | globalize }}
            </option>
          </select-field>

          <select-field
            class="fee-list__filter"
            v-model.number="filters.paymentFeeSubtype"
            v-if="+filters.feeType === FEE_TYPES.paymentFee"
            :label="'fee-list.lbl-direction' | globalize"
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
            :label="'fee-list.lbl-asset' | globalize"
            v-model="filters.assetCode"
          >
            <template v-if="assetsByType.length">
              <option
                v-for="item in assetsByType"
                :key="item.id"
                :value="item.id"
                :selected="item.id === filters.assetCode"
              >
                {{ item.id }}
              </option>
            </template>

            <template v-else>
              <option disabled>
                {{ "fee-list.no-appropriate-assets" | globalize }}
              </option>
            </template>
          </select-field>

          <select-field
            class="fee-list__filter"
            :label="'fee-list.lbl-account-type' | globalize"
            v-model="filters.accountRole"
            v-if="filters.scope === SCOPE_TYPES.accountRole"
          >
            <option :value="kvAccountRoles.general">
              {{ "fee-list.general" | globalize }}
            </option>
            <option :value="kvAccountRoles.unverified">
              {{ "fee-list.not-verified" | globalize }}
            </option>
            <option :value="kvAccountRoles.corporate">
              {{ "fee-list.corporate" | globalize }}
            </option>
          </select-field>

          <input-field
            class="fee-list__filter"
            :label="'fee-list.lbl-account' | globalize"
            v-model="filters.accountAlias"
            :placeholder="'fee-list.placeholder-mail-or-account-id' | globalize"
            v-if="filters.scope === SCOPE_TYPES.account"
            autocomplete-type="email"
          />
        </div>
      </div>
    </template>

    <div class="fee-list__list-wrp">
      <template v-if="!Object.keys(fees).length">
        <div class="app-list">
          <p class="app-list__li-like">
            {{ "fee-list.loading" | globalize }}
          </p>
        </div>
      </template>

      <template
        v-else-if="filters.scope === SCOPE_TYPES.account &&
          !filters.accountAddress"
      >
        <div class="app-list">
          <p class="app-list__li-like">
            {{ "fee-list.please-scecify-account" | globalize }}
          </p>
        </div>
      </template>

      <template v-else-if="!fees.length">
        <div class="app-list">
          <p class="app-list__li-like">
            {{ "fee-list.no-fees-avaible" | globalize }}
          </p>
        </div>
      </template>

      <template v-else>
        <ul class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">
              {{ "fee-list.lower-bound" | globalize }}
            </span>

            <span class="app-list__cell">
              {{ "fee-list.upper-bound" | globalize }}
            </span>

            <span class="app-list__cell">
              {{ "fee-list.percent-fee" | globalize }}
            </span>

            <span
              class="app-list__cell"
              v-if="+filters.feeType !== FEE_TYPES.offerFee &&
                +filters.feeType !== FEE_TYPES.capitalDeploymentFee &&
                +filters.feeType !== FEE_TYPES.investFee"
            >
              {{ "fee-list.fixed-fee" | globalize }}
            </span>
            <span class="app-list__cell">
              <!-- empty -->
            </span>
          </div>

          <li
            class="app-list__li"
            v-for="(item, id) in fees"
            :key="id"
          >
            <fee-form
              :fee="item"
              :account-id="composeRequestFilters.account"
              :account-role="composeRequestFilters.account_role"
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

import { base } from '@tokend/js-sdk'

import { ErrorHandler } from '@/utils/ErrorHandler'

import throttle from 'lodash/throttle'
import { api, loadingDataViaLoop } from '@/api'
import apiHelper from '@/apiHelper'

import {
  ASSET_POLICIES,
  FEE_TYPES,
  PAYMENT_FEE_TYPES,
  DEFAULT_BASE_ASSET,
} from '@/constants'

import { FeesRecord } from '@/js/records/fees.record'
import _cloneDeep from 'lodash/cloneDeep'
import { mapGetters } from 'vuex'

const SCOPE_TYPES = Object.freeze({ // non-xdr values, internal use only
  account: 'USER',
  accountRole: 'ACCOUNT_TYPE',
  global: 'GLOBAL',
})

const DEFAULT_FEE = {
  lowerBound: 0,
  upperBound: 0,
  percent: 0,
  fixed: 0,
  exists: false,
}

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
      PAYMENT_FEE_TYPES,

      assets: [{ id: DEFAULT_BASE_ASSET }],
      assetPairs: [],
      fees: {},
      isSubmitting: false,
      isLoaded: false,

      filters: {
        scope: SCOPE_TYPES.global,
        feeType: '' + FEE_TYPES.paymentFee,
        assetCode: DEFAULT_BASE_ASSET,

        // secondary
        accountRole: -1,
        accountAlias: '', // address or email
        accountAddress: '', // address will be inserted here

        // every fee has a subtype, but we're interested only in payment's
        paymentFeeSubtype: PAYMENT_FEE_TYPES.outgoing,
      },
    }
  },

  computed: {
    ...mapGetters([
      'kvAccountRoles',
    ]),

    assetsByType () {
      let result
      switch (+this.filters.feeType) {
        case FEE_TYPES.paymentFee:
          result = this.assets
            .filter(item => item.policies.value & ASSET_POLICIES.transferable)
          break
        case FEE_TYPES.offerFee:
          result = this.assets
            .filter(item => this.assetPairs
              .filter(el => el.quoteAsset.id === item.id).length
            )
          break
        case FEE_TYPES.issuanceFee:
          result = this.assets.filter(item => +item.maxIssuanceAmount)
          break
        case FEE_TYPES.withdrawalFee:
          result = this.assets.filter(
            item => +item.policies.value & ASSET_POLICIES.withdrawable
          )
          break
        default:
          result = this.assets
          break
      }
      return result
    },
    composeRequestFilters () {
      if (!Object.keys(this.filters).length) return this.filters

      const result = {}

      if (this.filters.scope === SCOPE_TYPES.accountRole) {
        // snake_case because sdk wait for it
        result.account_role = this.filters.accountRole
      } else if (this.filters.scope === SCOPE_TYPES.account) {
        // snake_case because sdk wait for it
        result.account = this.filters.accountAddress
      }

      if (+this.filters.feeType === FEE_TYPES.paymentFee) {
        result.subtype = this.filters.paymentFeeSubtype
      }

      return result
    },
  },

  watch: {
    assetsByType: function () {
      const isSelectedAssetInRange = this.assetsByType
        .filter(item => item.id === this.filters.assetCode)
        .length
      if (!isSelectedAssetInRange) {
        try {
          this.filters.assetCode = this.assetsByType[0].id
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

    'filters.assetCode': function () {
      this.fees = {}
      this.loadFees()
    },

    'filters.accountAddress': function (newValue) {
      if (newValue) {
        this.loadFees()
      }
    },

    'filters.feeType': function () {
      this.fees = {}
      this.loadFees()
    },

    'filters.paymentFeeSubtype': function () {
      this.fees = {}
      this.loadFees()
    },

    'filters.accountAlias': throttle(async function () {
      const alias = this.filters.accountAlias
      if (!alias) return

      let address = ''
      if (base.Keypair.isValidPublicKey(alias)) {
        address = alias
      } else {
        try {
          address = await apiHelper.users.getAccountIdByEmail(alias)
        } catch (error) {
          address = ''
        }
      }
      this.filters.accountAddress = address
    }, 1000),
  },

  async created () {
    this.isLoaded = false
    await this.getAssetsAndPairs()
    await this.loadFees()
    this.filters.accountRole = this.kvAccountRoles.general
    this.isLoaded = true
    this.filters.assetCode = this.assetsByType[0].id
  },

  methods: {
    async getAssetsAndPairs () {
      try {
        let response = await api.getWithSignature('/v3/assets')
        let assets = await loadingDataViaLoop(response)
        this.assets = assets
        let responseAssetPairs = await api.getWithSignature('/v3/asset_pairs')
        let assetPairs = await loadingDataViaLoop(responseAssetPairs)
        this.assetPairs = assetPairs
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async loadFees () {
      this.fees = {}
      try {
        const filters = this.composeRequestFilters
        const { data } = await api.getWithSignature('/v3/fees', {
          filter: {
            asset: this.filters.assetCode,
            fee_type: this.filters.feeType,
            ...filters,
          },
        })
        let newFees = _cloneDeep(data)
        newFees.push(DEFAULT_FEE)

        if (this.filters.scope === SCOPE_TYPES.global) {
          newFees = newFees
            .filter(fee => !(fee.accountRole || fee.account))
        }
        this.fees = newFees.map(item => new FeesRecord(item, this.filters))
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
