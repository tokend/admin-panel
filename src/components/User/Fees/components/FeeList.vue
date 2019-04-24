<template>
  <div class="fee-list">
    <div class="fee-list__filters-wrp">
      <div class="fee-list__filters">
        <select-field class="fee-list__filter" label="Scope" v-model="filters.scope">
          <option :value="SCOPE_TYPES.global">Global</option>
          <option :value="SCOPE_TYPES.accountRole">Account type</option>
          <option :value="SCOPE_TYPES.account">Account</option>
        </select-field>

        <select-field class="fee-list__filter" label="Type" v-model="filters.feeType">
          <option :value="FEE_TYPES.paymentFee">Payment</option>
          <option :value="FEE_TYPES.offerFee">Order Match</option>
          <option :value="FEE_TYPES.withdrawalFee">Withdrawal</option>
          <option :value="FEE_TYPES.issuanceFee">Issuance</option>
          <option :value="FEE_TYPES.investFee">Invest</option>
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

        <select-field class="fee-list__filter" label="Asset" v-model="filters.assetCode">
          <template v-if="assetsByType.length">
            <option
              v-for="item in assetsByType" :key="item.code"
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
          <option :value="ACCOUNT_ROLES.general">General</option>
          <option :value="ACCOUNT_ROLES.notVerified">Not verified</option>
          <option :value="ACCOUNT_ROLES.corporate">Corporate</option>
        </select-field>

        <input-field
          class="fee-list__filter"
          label="Account"
          v-model="filters.accountAlias"
          placeholder="Email address or account ID"
          v-if="filters.scope === SCOPE_TYPES.account"
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

      <template v-else-if="filters.scope === SCOPE_TYPES.account && !filters.accountAddress">
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
              v-if="+filters.feeType !== FEE_TYPES.offerFee"
            >
              Fixed fee
            </span>
            <span class="app-list__cell"><!-- empty --></span>
          </div>

          <li class="app-list__li" v-for="(item, id) in feesByFilters" :key="id">
            <form
              class="fee-list__li--hidden-form"
              @submit.prevent="updateFee(item)"
              :id="`fee-list-form-${id}`"
            />

            <span class="app-list__cell fee-list__cell">
              <input-field
                type="number"
                min="0"
                :step="DEFAULT_INPUT_STEP"
                :form="`fee-list-form-${id}`"
                :disabled="isSubmitting || item.exists"
                v-model="item.lowerBound"
              />
            </span>

            <span class="app-list__cell fee-list__cell">
              <input-field
                type="number"
                min="0"
                :max="DEFAULT_MAX_AMOUNT"
                :step="DEFAULT_INPUT_STEP"
                :form="`fee-list-form-${id}`"
                :disabled="isSubmitting  || item.exists"
                v-model="item.upperBound"
              />
              <button
                class="fee-list__btn-max"
                @click="item.upperBound = DEFAULT_MAX_AMOUNT"
                v-if="!item.exists"
                :disabled="isSubmitting"
              >
                <mdi-arrow-up-icon/>
              </button>
            </span>

            <span class="app-list__cell fee-list__cell">
              <input-field
                type="number"
                min="0"
                max="100"
                :step="DEFAULT_INPUT_STEP"
                :form="`fee-list-form-${id}`"
                :disabled="isSubmitting"
                v-model="item.percent"
              />
            </span>

            <span class="app-list__cell fee-list__cell"
                  v-if="+filters.feeType !== FEE_TYPES.offerFee">
              <input-field
                type="number"
                min="0"
                :step="DEFAULT_INPUT_STEP"
                :form="`fee-list-form-${id}`"
                :disabled="isSubmitting"
                v-model="item.fixed"
              />
            </span>

            <span class="app-list__cell fee-list__cell">
              <template v-if="item.exists">
                <button
                  class="app__btn app__btn--small"
                  :form="`fee-list-form-${id}`"
                  :disabled="isSubmitting"
                >
                  Update
                </button>
                <button
                  class="app__btn app__btn--small app__btn--danger"
                  :disabled="isSubmitting"
                  @click="deleteFee(item)"
                >
                  Delete
                </button>
              </template>

              <template v-else>
                <button
                  class="app__btn app__btn--small"
                  :form="`fee-list-form-${id}`"
                  :disabled="isSubmitting"
                >
                  Create
                </button>
              </template>
            </span>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<script>
  import api from '@/api'
  import { Sdk } from '@/sdk'
  import { xdrTypeFromValue } from '@/utils/xdrTypeFromValue'
  import { ErrorHandler } from '@/utils/ErrorHandler'
  import { SelectField, InputField } from '@comcom/fields'
  import {
    ASSET_POLICIES,
    DEFAULT_MAX_AMOUNT,
    DEFAULT_INPUT_STEP,
    FEE_TYPES,
    PAYMENT_FEE_TYPES,
    DEFAULT_BASE_ASSET
  } from '@/constants'
  import throttle from 'lodash/throttle'
  import 'mdi-vue/ArrowUpIcon'

  import { confirmAction } from '@/js/modals/confirmation_message'

  import config from '@/config'

  const SCOPE_TYPES = Object.freeze({ // non-xdr values, internal use only
    account: 'USER',
    accountRole: 'ACCOUNT_TYPE',
    global: 'GLOBAL'
  })

  export default {
    components: {
      SelectField,
      InputField
    },

    data () {
      return {
        SCOPE_TYPES,
        FEE_TYPES,
        ACCOUNT_ROLES: config.ACCOUNT_ROLES,
        DEFAULT_MAX_AMOUNT,
        DEFAULT_INPUT_STEP,
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

          paymentFeeSubtype: PAYMENT_FEE_TYPES.outgoing // every fee has a subtype, but we're interested only in payment's
        }
      }
    },

    computed: {
      assetsByType () {
        let result
        switch (+this.filters.feeType) {
          case FEE_TYPES.paymentFee:
            result = this.assets.filter(item => item.policy & ASSET_POLICIES.transferable)
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
            result = this.assets.filter(item => +item.policy & ASSET_POLICIES.withdrawable)
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
          .filter((item) => type === FEE_TYPES.paymentFee ? item.subtype === paymentFeeSubtype : true)
      }
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
          this.fees = {}
          this.getFees()
        }
      },

      'filters.accountRole': function () {
        this.fees = {}
        this.getFees()
      },

      'filters.accountAddress': function (newValue) {
        if (newValue) {
          this.fees = {}
          this.getFees()
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
      }, 1000)
    },

    created () {
      this.getAssetsAndPairs()
      this.getFees()
    },

    methods: {
      composeRequestFilters (filters) {
        if (!Object.keys(filters).length) return filters

        const result = {}

        if (filters.scope === SCOPE_TYPES.accountRole) {
          // snake_case because sdk wait for it
          result.account_type = filters.accountRole
        } else if (filters.scope === SCOPE_TYPES.account) {
          // snake_case because sdk wait for it
          result.account_id = filters.accountAddress
        }

        return result
      },

      async getAssetsAndPairs () {
        try {
          const response = await Sdk.horizon.assets.getAll()
          this.assets = response.data
          const assetsResponse = await Sdk.horizon.assetPairs.getAll()
          this.assetPairs = assetsResponse.data
        } catch (error) {
          ErrorHandler.process(error)
        }
      },

      async getFees () {
        try {
          const filters = this.composeRequestFilters(this.filters)
          const response = await Sdk.horizon.fees.getAll(filters)
          this.fees = response.data.fees
        } catch (error) {
          ErrorHandler.process(error)
        }
      },

      async updateFee (fees) {
        if (!await confirmAction()) return

        const additionalParams = this.composeRequestFilters(this.filters)

        if (+fees.lowerBound > +fees.upperBound) {
          ErrorHandler.process('Lower bound should be less or equal to Upper bound')
          return false
        }

        this.isSubmitting = true
        try {
          const opts = {
            fee: {
              feeType: xdrTypeFromValue('FeeType', Number(fees.feeType)),
              subtype: String(fees.subtype) || '0',
              asset: String(fees.asset),
              fixedFee: String(fees.fixed),
              percentFee: String(fees.percent),
              accountId: additionalParams.account_id || additionalParams.address,
              accountRole: additionalParams.account_type
                ? String(additionalParams.account_type)
                : undefined,
              lowerBound: String(fees.lowerBound),
              upperBound: String(fees.upperBound)
            },
            isDelete: fees.isDelete
          }

          const operation = Sdk.base.Operation.setFees(opts)

          await Sdk.horizon.transactions.submitOperations(operation)
          await this.getFees()
          this.$store.dispatch('SET_INFO', 'Submitted successfully')
        } catch (error) {
          this.isSubmitting = false
          ErrorHandler.process(error)
        }
        this.isSubmitting = false
      },

      async deleteFee (fee) {
        if (!await confirmAction({ title: 'Delete the fee rule?' })) return
        fee.isDelete = true
        return this.updateFee(Object.assign({}, fee, { isDelete: true }))
      }
    }
  }
</script>

<style>
  .fee-list__cell > .input-field > .input-field__label,
  .fee-list__cell > .select-field > .select-field__label {
    display: none;
  }

  .fee-list__cell > .input-field > .input-field__input,
  .fee-list__cell > .select-field > .select-field__select {
    padding-top: 0.7rem;
  }
</style>

<style scoped lang="scss">
  @import "../../../../assets/scss/colors";

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

  .fee-list__cell.app-list__cell {
    display: inline-flex;
    align-items: stretch;

    & > .app__btn.app__btn--small {
      padding: 0;
      min-width: inherit;
    }

    & > .app__btn + .app__btn {
      margin-left: 1rem;
    }
  }

  .fee-list__li--hidden-form {
    flex: 0;
    opacity: 0;
  }

  .fee-list__btn-max {
    display: flex;
    justify-content: center;
    min-width: 2rem;

    &:enabled:hover {
      opacity: 0.8;
      cursor: pointer;
    }

    & > svg {
      width: 1.8rem;
      height: 1.8rem;
    }

    &:disabled {
      fill: $color-unfocused;
      cursor: default;
    }
  }
</style>
