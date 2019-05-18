<template>
  <div class="collected-fees-withdraw">
    <div class="app__block">
      <h2>Withdrawal</h2>

      <form @submit.prevent="submit">
        <div class="app__form-row">
          <template v-if="masterBalances.length">
            <select-field
              class="app__form-field"
              v-model="form.balanceId"
              label="Asset"
              :disabled="isFormPending"
            >
              <option
                v-for="balance in masterBalances"
                :value="balance.id"
                :key="balance.id"
              >
                {{ balance.asset.id }}
              </option>
              <!-- TODO: empty-text -->
            </select-field>
          </template>

          <template v-else>
            <select-field
              class="app__form-field"
              value="_empty"
              label="Asset"
              :disabled="isFormPending"
            >
              <option
                :value="'_empty'"
                disabled
                selected
              >
                <template v-if="isMasterBalancesLoading">
                  Loading...
                </template>

                <template v-else-if="isMasterBalancesFailed">
                  Asset Load failed
                </template>

                <template v-else>
                  No assets to withdraw yet
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
            label="Amount"
            name="amount"
            step="0.000001"
            :max="maxWithdrawalAmount"
            :disabled="isFormPending"
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
            :label="isMasterSelectedBalanceAsset
              ? 'Destination address'
              : 'Comment'
            "
            name="meta"
            :disabled="isFormPending"
          />
        </div>

        <div class="collected-fees-withdraw__op-attrs">
          <p class="collected-fees-withdraw__op-attrs-row">
            <span>
              Reviewer:
            </span>
            <email-getter
              :account-id="opAttrs.reviewerAddress"
              is-titled
            />
          </p>

          <template v-if="+opAttrs.fixedFee">
            <p class="collected-fees-withdraw__op-attrs-row">
              <span>
                Fixed fee:
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
                Percent fee:
              </span>
              <asset-amount-formatter
                :amount="opAttrs.percentFee"
                :asset="opAttrs.feeAssetCode"
              />
            </p>
          </template>

          <template v-if="isMasterSelectedBalanceAsset">
            <p class="collected-fees-withdraw__op-attrs-row">
              External fee present
            </p>
          </template>
        </div>

        <div class="app__form-actions">
          <button
            class="app__btn collected-fees-withdraw__submit-btn"
            :disabled="isFormPending"
          >
            Withdraw
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import InputField from '@comcom/fields/InputField'
import SelectField from '@comcom/fields/SelectField'

import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { formatAssetAmount } from '@/utils/formatters'
import { EmailGetter } from '@comcom/getters'
import { AssetAmountFormatter } from '@comcom/formatters'

import _pick from 'lodash/pick'
import _throttle from 'lodash/throttle'
import { FEE_TYPES, base } from '@tokend/js-sdk'

export default {
  components: {
    InputField,
    SelectField,
    EmailGetter,
    AssetAmountFormatter,
  },

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
      isFormPending: false,
      isMasterBalancesLoading: false,
      isMasterBalancesFailed: false,
      isOpAttrsLoading: false,
      isOpAttrsFailed: false,
      masterBalances: [],
    }
  },

  computed: {
    selectedBalanceAttrs () {
      return ((this.masterBalances || [])
        .find(item => item.id === this.form.balanceId)) || {}
    },

    isMasterSelectedBalanceAsset () {
      try {
        return this.opAttrs.reviewerAddress === Vue.params.MASTER_ACCOUNT
      } catch (error) {
        return false
      }
    },

    maxWithdrawalAmount () {
      return (this.selectedBalanceAttrs.state || {}).available
    },

    maxWithdrawalAmountHint () {
      const formatted = formatAssetAmount(
        (this.selectedBalanceAttrs.state || {}).available,
        (this.selectedBalanceAttrs.asset || {}).id,
      )
      return `Max amount is ${formatted}`
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

  created () {
    this.loadMasterBalances()
  },

  methods: {
    async loadMasterBalances () {
      this.isMasterBalancesLoading = true
      this.isMasterBalancesFailed = false

      try {
        const { data: { balances: masterBalances } } = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature(`/v3/accounts/${Vue.params.MASTER_ACCOUNT}`, {
            include: ['balances.state'],
          })

        this.masterBalances = masterBalances

        if (this.masterBalances.length) {
          this.form.balanceId = masterBalances[0].state.id
        }
      } catch (err) {
        ErrorHandler.processWithoutFeedback(err)
        this.isMasterBalancesFailed = true
        this.masterBalances = []
      }

      this.isMasterBalancesLoading = false
    },

    async submit () {
      this.isFormPending = true
      try {
        const operation = this.craftWithdrawalOperation()
        await ApiCallerFactory
          .createCallerInstance()
          .postOperations(operation)

        this.form.amount = ''
        this.form.meta = ''
        this.$store.dispatch('SET_INFO', 'Request created successfully')
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isFormPending = false
    },

    craftWithdrawalOperation () {
      const opts = {
        balance: this.form.balanceId,
        amount: this.form.amount,
        destAsset: this.selectedBalanceAttrs.asset.id,
        creatorDetails: this.isMasterSelectedBalanceAsset
          ? { address: this.form.meta }
          : { comment: this.form.meta },
        fee: {
          fixed: this.opAttrs.fixedFee,
          percent: this.opAttrs.percentFee,
        },
      }

      return base.CreateWithdrawRequestBuilder
        .createWithdrawWithAutoConversion(opts)
    },

    async loadOpAttrs () {
      this.isOpAttrsLoading = true
      this.isOpAttrsFailed = false

      try {
        await this.loadReviewerAddress()
        await this.loadCalculatedFees()
      } catch (error) {
        ErrorHandler.process(error)
        this.isOpAttrsFailed = true
      }

      this.isOpAttrsLoading = false
    },

    async loadReviewerAddress () {
      const assetCode = this.selectedBalanceAttrs.asset.id
      const { data: asset } = await ApiCallerFactory
        .createCallerInstance()
        .getWithSignature(`/v3/assets/${assetCode}`, {
          include: ['owner'],
        })

      this.opAttrs.reviewerAddress = ((asset || {}).owner || {}).id
    },

    async loadCalculatedFees () {
      if (!this.form.amount || !this.form.balanceId) {
        return
      }

      const assetCode = (this.selectedBalanceAttrs.asset || {}).id
      const { data: fees } = await ApiCallerFactory
        .createCallerInstance()
        .getWithSignature(
          `/v3/accounts/${Vue.params.MASTER_ACCOUNT}/calculated_fees`,
          {
            asset: assetCode,
            fee_type: FEE_TYPES.withdrawalFee,
            amount: this.form.amount,
          })

      this.opAttrs.feeAssetCode = assetCode
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
