<template>
  <div class="issuance-form">
    <template v-if="assets && assets.length">
      <form
        @submit.prevent="isFormValid() && showConfirmation()"
        novalidate
      >
        <div class="app__form-row">
          <input-field
            class="app__form-field"
            type="text"
            :placeholder="'issuance-form.placeholder-email-or-gaaq' | globalize"
            v-model="form.receiver"
            :label="'issuance-form.lbl-receiver' | globalize"
            @blur="touchField('form.receiver')"
            :error-message="getFieldErrorMessage('form.receiver')"
            :disabled="formMixin.isDisabled"
            autocomplete-type="email"
          />
        </div>

        <div class="app__form-row">
          <input-field
            class="app__form-field"
            v-model="form.reference"
            :label="'issuance-form.lbl-reference' | globalize"
            @blur="touchField('form.reference')"
            :error-message="getFieldErrorMessage(
              'form.reference',
              { maxLength: REFERENCE_MAX_LENGTH }
            )"
            :disabled="formMixin.isDisabled"
          />
        </div>

        <div class="app__form-row">
          <input-field
            class="app__form-field"
            type="number"
            :step="DEFAULT_INPUT_STEP"
            :min="DEFAULT_INPUT_MIN"
            :max="availableForIssuance"
            v-model="form.amount"
            :label="'issuance-form.lbl-amount' | globalize"
            @blur="touchField('form.amount')"
            :error-message="getFieldErrorMessage(
              'form.amount',
              { minValue: DEFAULT_INPUT_MIN, available: availableForIssuance }
            )"
            :disabled="formMixin.isDisabled"
          />

          <div class="issuance-form__asset-field app__form-field">
            <select-field
              class="issuance-form__asset-select"
              v-model="form.asset"
              :label="'issuance-form.lbl-asset' | globalize"
              @blur="touchField('form.asset')"
              :error-message="getFieldErrorMessage('form.asset')"
              :disabled="formMixin.isDisabled"
            >
              <option
                v-for="item in assets"
                :value="item.id"
                :key="item.id"
              >
                {{ item.id }}
              </option>
            </select-field>
          </div>
        </div>

        <div class="issuance-form__asset-info app__form-row" v-if="form.asset">
          <p v-if="isIssuanceAllowed" class="text">
            <span>{{ "issuance-form.avaible" | globalize }}</span>
            <asset-amount-formatter
              :amount="availableForIssuance"
              :asset="form.asset"
            />
          </p>

          <p v-else class="text">
            {{ "issuance-form.no-avaible" | globalize }}
          </p>
        </div>

        <div class="issuance-form__form-actions app__form-actions">
          <form-confirmation
            v-if="formMixin.isConfirmationShown"
            :is-pending="isFormSubmitting"
            :message="'issuance-form.msg-please-recheck-all-fields' | globalize"
            @ok="submit"
            @cancel="hideConfirmation"
          />

          <button
            v-else
            class="app__btn"
            :disabled="formMixin.isDisabled || !isIssuanceAllowed"
          >
            {{ "issuance-form.issue" | globalize }}
          </button>
        </div>
      </form>
    </template>

    <template v-else>
      <p>{{ "issuance-form.loading" | globalize }}</p>
      <!-- TODO: better loading -->
    </template>
  </div>
</template>

<script>
import FormMixin from '@/mixins/form.mixin'
import { AssetAmountFormatter } from '@comcom/formatters'
import { api, loadingDataViaLoop } from '@/api'
import apiHelper from '@/apiHelper'
import { base } from '@tokend/js-sdk'

import config from '@/config'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/bus'

import {
  required,
  minValue,
  noMoreThanAvailableForIssuance,
  emailOrAccountId,
  maxLength,
} from '@/validators'

import { DEFAULT_INPUT_STEP, DEFAULT_INPUT_MIN } from '@/constants'

const REFERENCE_MAX_LENGTH = 255

export default {
  components: { AssetAmountFormatter },
  mixins: [FormMixin],

  data () {
    return {
      form: {
        amount: '',
        receiver: '',
        reference: '',
        asset: '',
      },
      isFormSubmitting: false,
      assets: [],
      DEFAULT_INPUT_STEP,
      DEFAULT_INPUT_MIN,
      REFERENCE_MAX_LENGTH,
    }
  },

  validations () {
    return {
      form: {
        amount: {
          required,
          minValue: minValue(DEFAULT_INPUT_MIN),
          noMoreThanAvailableForIssuance: noMoreThanAvailableForIssuance(
            this.availableForIssuance
          ),
        },
        receiver: { required, emailOrAccountId },
        reference: {
          required,
          maxLength: maxLength(REFERENCE_MAX_LENGTH),
        },
        asset: { required },
      },
    }
  },

  computed: {
    availableForIssuance () {
      const asset = this.assets.find(item => item.id === this.form.asset)
      return asset ? asset.availableForIssuance : ''
    },

    isIssuanceAllowed () {
      return this.availableForIssuance > 0
    },
  },

  created () {
    Bus.$on('issuance:updateAssets', _ => this.getAssets())
    this.getAssets()
  },

  methods: {
    async getAssets () {
      try {
        let response = await api.getWithSignature('/v3/assets', {
          filter: {
            owner: config.MASTER_ACCOUNT,
          },
        })
        let assets = await loadingDataViaLoop(response)
        const list = assets || []
        const issuableAssets = list.filter(item => item.maxIssuanceAmount > 0)
        this.assets = issuableAssets
        this.form.asset = this.form.asset || (issuableAssets[0] || {}).id
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async getBalanceId () {
      let address
      if (base.Keypair.isValidPublicKey(this.form.receiver)) {
        address = this.form.receiver
      } else {
        address = await apiHelper.users.getAccountIdByEmail(this.form.receiver)
      }

      if (!address) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject(`Account doesn't exists in the system`)
      }
      const { data } = await api.getWithSignature(`/v3/accounts/${address}`, {
        include: ['balances', 'balances.asset'],
      })
      let account = data
      const balance = account.balances.find(
        item => item.asset.id === this.form.asset
      )

      if (!balance) {
        try {
          const operation = base.Operation.manageBalance({
            asset: this.form.asset,
            action: base.xdr.ManageBalanceAction.createUnique(),
            destination: address,
          })
          await api.postOperations(operation)
        } catch (error) {
          ErrorHandler.process(error)
        }
        const { data } = await api.getWithSignature(`/v3/accounts/${address}`, {
          include: ['balances', 'balances.asset'],
        })
        account = data
        return account.balances.find(
          item => item.asset.id === this.form.asset
        ).id
      } else {
        return balance.id
      }
    },

    async sendManualIssuance (receiver) {
      if (receiver === '') {
        throw new Error(`The receiver has no ${this.form.asset} balance.`)
      }
      const operation = base.CreateIssuanceRequestBuilder
        .createIssuanceRequest(
          {
            asset: this.form.asset,
            amount: this.form.amount,
            receiver: receiver,
            reference: this.form.reference,
            source: config.MASTER_ACCOUNT,
            creatorDetails: {},
            allTasks: 0,
          }
        )
      await api.postOperations(operation)

      Bus.success('issuance-form.issued-successfully')
      this.getAssets()
    },

    async submit () {
      this.isFormSubmitting = true
      try {
        const balanceId = await this.getBalanceId()
        await this.sendManualIssuance(balanceId)

        this.clearFieldsWithOverriding({
          asset: this.form.asset,
        })
        Bus.$emit('issuance:updateRequestList')
        await this.getAssets()
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isFormSubmitting = false
      this.hideConfirmation()
    },
  },
}
</script>

<style scoped>
.issuance-form__asset-field.app__form-field {
  flex: 0.4;
}

.app__form-row + .issuance-form__asset-info.app__form-row {
  margin-top: 1rem;
}
</style>
