
<template>
  <div class="collected-fees-withdraw">
    <div class="app__block">
      <h2>{{ "collected-fees-withdraw.header" | globalize }}</h2>

      <form @submit.prevent="isFormValid() && showConfirmation()">
        <div class="app__form-row">
          <template v-if="masterBalances.length">
            <select-field
              class="app__form-field"
              v-model="form.balanceId"
              :label="'collected-fees-withdraw.lbl-asset' | globalize"
              :disabled="formMixin.isDisabled"
              :error-message="checkErrorSelectField | globalize"
            >
              <option
                v-for="balance in masterBalances"
                :value="balance.id"
                :key="balance.id"
              >
                {{ balance.assetCode }}
              </option>
            </select-field>
          </template>

          <template v-else>
            <select-field
              class="app__form-field"
              value="_empty"
              :label="'collected-fees-withdraw.lbl-asset' | globalize"
              :disabled="formMixin.isDisabled"
            >
              <option
                :value="'_empty'"
                disabled
                selected>
                <template v-if="isMasterBalancesLoading">
                  {{
                    "collected-fees-withdraw.loading" | globalize
                  }}
                </template>

                <template v-else-if="isMasterBalancesFailed">
                  <!--eslint-disable-next-line max-len -->
                  {{ "collected-fees-withdraw.fail-load" | globalize }}
                </template>

                <template v-else>
                  {{
                    "collected-fees-withdraw.no-assets-withdraw" | globalize
                  }}
                </template>
              </option>
            </select-field>
          </template>
        </div>

        <div class="app__form-row">
          <input-field
            class="app__form-field"
            type="number"
            v-model.trim="form.amount"
            :label="'collected-fees-withdraw.lbl-amount' | globalize"
            name="withdrawal-amount"
            :min="DEFAULT_INPUT_MIN"
            :step="DEFAULT_INPUT_STEP"
            :max="maxWithdrawalAmount"
            @blur="touchField('form.physicalPrice')"
            :error-message="
              getFieldErrorMessage('form.amount', {
                minValue: DEFAULT_INPUT_MIN,
                maxValue: maxWithdrawalAmount
              })
            "
            :disabled="formMixin.isDisabled"
          >
            <p slot="hint">
              {{ maxWithdrawalAmountHint }}
            </p>
          </input-field>
        </div>

        <div class="app__form-row">
          <input-field
            class="app__form-field"
            type="text"
            v-model.trim="form.meta"
            :label="selectInputFieldLabel"
            name="withdrawal-meta"
            @blur="touchField('form.meta')"
            :error-message="getFieldErrorMessage('form.meta')"
            :disabled="formMixin.isDisabled"
          />
        </div>

        <div class="collected-fees-withdraw__op-attrs">
          <p class="collected-fees-withdraw__op-attrs-row">
            <span>
              {{ "collected-fees-withdraw.reviewer" | globalize }}
            </span>
            <email-getter :account-id="opAttrs.reviewerAddress" is-titled />
          </p>

          <template v-if="+opAttrs.fixedFee">
            <p class="collected-fees-withdraw__op-attrs-row">
              <span>
                {{ "collected-fees-withdraw.fixed-fee" | globalize }}
              </span>
              <asset-amount-formatter
                :amount="opAttrs.fixedFee"
                :asset="opAttrs.feeAssetCode"
              />
            </p>
          </template>

          <template v-if="+opAttrs.fixedFee">
            <p class="collected-fees-withdraw__op-attrs-row">
              <span>
                {{
                  "collected-fees-withdraw.percent-fee" | globalize
                }}
              </span>
              <asset-amount-formatter
                :amount="opAttrs.percentFee"
                :asset="opAttrs.feeAssetCode"
              />
            </p>
          </template>

          <template v-if="isMasterSelectedBalanceAsset">
            <p class="collected-fees-withdraw__op-attrs-row">
              {{
                "collected-fees-withdraw.external-fee-present" | globalize
              }}
            </p>
          </template>
        </div>

        <div class="app__form-actions">
          <form-confirmation
            v-if="formMixin.isConfirmationShown"
            :is-pending="isFormSubmitting"
            :message="'collected-fees-withdraw.msg-recheck-form' | globalize"
            @ok="submit"
            @cancel="hideConfirmation"
          />

          <button
            v-else
            class="app__btn collected-fees-withdraw__submit-btn"
            :disabled="formMixin.isDisabled || !isSelectedAssetWithdrawable"
          >
            {{ "collected-fees-withdraw.btn-withdraw" | globalize }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'

import FormMixin from '@/mixins/form.mixin'
import { required, minValue, maxValue } from '@/validators'
import { DEFAULT_INPUT_STEP, DEFAULT_INPUT_MIN } from '@/constants'

import { api } from '@/api'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/bus'
import { formatAssetAmount } from '@/utils/formatters'

import { EmailGetter } from '@comcom/getters'
import { AssetAmountFormatter } from '@comcom/formatters'

import _pick from 'lodash/pick'
import _throttle from 'lodash/throttle'
import { FEE_TYPES, base } from '@tokend/js-sdk'

import { Balance } from '@/store/wrappers/balance'

const EVENTS = {
  submitted: 'submitted',
}

export default {
  components: {
    EmailGetter,
    AssetAmountFormatter,
  },

  mixins: [FormMixin],

  data () {
    return {
      form: {
        balanceId: '',
        amount: '',
        meta: '',
      },
      opAttrs: {
        reviewerAddress: '',
        fixedFee: '',
        percentFee: '',
        totalFee: '',
        feeAssetCode: '',
      },
      isFormSubmitting: false,
      isMasterBalancesLoading: false,
      isMasterBalancesFailed: false,
      isOpAttrsLoading: false,
      isOpAttrsFailed: false,
      masterBalances: [],
      DEFAULT_INPUT_STEP,
      DEFAULT_INPUT_MIN,
    }
  },

  validations () {
    return {
      form: {
        balanceId: { required },
        amount: {
          required,
          minValue: minValue(DEFAULT_INPUT_MIN),
          maxValue: maxValue(this.maxWithdrawalAmount),
        },
        meta: { required },
      },
    }
  },

  computed: {
    ...mapGetters({
      assetByCode: 'assetByCode',
    }),

    selectInputFieldLabel () {
      return this.isMasterSelectedBalanceAsset
        ? 'Destination address'
        : 'Comment'
    },

    checkErrorSelectField () {
      return this.isSelectedAssetWithdrawable
        ? ''
        : 'collected-fees-withdraw.error-asset-not-withdrawable'
    },

    selectedBalanceAttrs () {
      return (
        (this.masterBalances || []).find(
          item => item.id === this.form.balanceId
        ) || {}
      )
    },

    isMasterSelectedBalanceAsset () {
      try {
        return this.opAttrs.reviewerAddress === Vue.params.MASTER_ACCOUNT
      } catch (error) {
        return false
      }
    },

    maxWithdrawalAmount () {
      return this.selectedBalanceAttrs.available
    },

    maxWithdrawalAmountHint () {
      const formatted = formatAssetAmount(
        this.selectedBalanceAttrs.available,
        this.selectedBalanceAttrs.assetCode
      )
      return `Max amount is ${formatted}`
    },

    isSelectedAssetWithdrawable () {
      const asset = this.assetByCode(this.selectedBalanceAttrs.assetCode)
      return asset && asset.isWithdrawable
    },
  },

  watch: {
    'form.balanceId' () {
      this.loadOpAttrs()
    },

    'form.amount' () {
      this.loadOpAttrs()
    },
  },

  async created () {
    await this.loadMasterBalances()

    if (this.masterBalances.length) {
      this.form.balanceId = this.masterBalances[0].id
    }
  },

  methods: {
    ...mapActions({
      loadAssets: 'LOAD_ASSETS',
    }),

    async loadMasterBalances () {
      this.isMasterBalancesLoading = true
      this.isMasterBalancesFailed = false

      try {
        const {
          data: { balances: masterBalances },
        } = await api.getWithSignature(
          `/v3/accounts/${Vue.params.MASTER_ACCOUNT}`,
          {
            include: ['balances.state'],
          }
        )

        this.masterBalances = masterBalances.map(b => new Balance(b))
      } catch (err) {
        ErrorHandler.processWithoutFeedback(err)
        this.isMasterBalancesFailed = true
        this.masterBalances = []
      }

      this.isMasterBalancesLoading = false
    },

    async submit () {
      this.isFormSubmitting = true
      try {
        const operation = this.craftWithdrawalOperation()
        await api.postOperations(operation)

        this.clearFieldsWithOverriding({
          balanceId: this.form.balanceId,
        })
        Bus.success('Request created successfully')
        this.$emit(EVENTS.submitted)

        await this.loadAssets()
        await this.loadMasterBalances()
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isFormSubmitting = false
      this.hideConfirmation()
    },

    craftWithdrawalOperation () {
      const opts = {
        balance: this.form.balanceId,
        amount: this.form.amount,
        destAsset: this.selectedBalanceAttrs.assetCode,
        creatorDetails: this.isMasterSelectedBalanceAsset
          ? { address: this.form.meta }
          : { comment: this.form.meta },
        fee: {
          fixed: this.opAttrs.fixedFee,
          percent: this.opAttrs.percentFee,
        },
      }

      return base.CreateWithdrawRequestBuilder.createWithdrawWithAutoConversion(
        opts
      )
    },

    async loadOpAttrs () {
      this.isOpAttrsLoading = true
      this.isOpAttrsFailed = false

      try {
        this.setReviewerAddress()
        await this.loadCalculatedFees()
      } catch (error) {
        ErrorHandler.process(error)
        this.isOpAttrsFailed = true
      }

      this.isOpAttrsLoading = false
    },

    async setReviewerAddress () {
      const asset = this.assetByCode(this.selectedBalanceAttrs.assetCode)
      this.opAttrs.reviewerAddress = (asset || {}).owner
    },

    async loadCalculatedFees () {
      if (!this.form.amount || !this.form.balanceId) {
        return
      }
      const endpoint = `/v3/accounts/${Vue.params.MASTER_ACCOUNT}/calculated_fees`
      const { data: fees } = await api.getWithSignature(endpoint, {
        asset: this.selectedBalanceAttrs.assetCode,
        fee_type: FEE_TYPES.withdrawalFee,
        amount: this.form.amount,
      })

      this.opAttrs.feeAssetCode = this.selectedBalanceAttrs.assetCode
      this.opAttrs.fixedFee = fees.fixed
      this.opAttrs.percentFee = fees.calculatedPercent
    },

    throttledLoadOpAttrs: _throttle(_ => this.loadOpAttrs(), 1000),

    // For parent access
    setForm (opts) {
      Object.assign(this.form, _pick(opts, ['balanceId', 'amount']))
    },
  },
}
</script>

<style lang="scss" scoped>
.collected-fees-withdraw__submit-btn {
  max-width: 18rem;
}

.collected-fees-withdraw__op-attrs {
  margin-top: 1.6rem;
}

.collected-fees-withdraw__op-attrs-row {
  line-height: 1.5;
}
</style>
