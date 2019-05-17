<template>
  <div class="issuance-form">
    <template v-if="assets && assets.length">
      <form @submit.prevent="submit">
        <div class="app__form-row">
          <input-field
            class="app__form-field"
            type="text"
            placeholder="email@example.com or GAAQ..."
            v-model="form.receiver"
            label="Receiver (email or address)"
            :disabled="isSubmitting"
            autocomplete-type="email"
          />
        </div>

        <div class="app__form-row">
          <input-field
            class="app__form-field"
            v-model="form.reference"
            label="Reference"
            :disabled="isSubmitting"
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
            label="Amount"
            :disabled="isSubmitting"
          />

          <div class="issuance-form__asset-field app__form-field">
            <select-field
              class="issuance-form__asset-select"
              v-model="form.asset"
              label="Asset"
              :disabled="isSubmitting">
              <option
                v-for="item in assets"
                :value="item.code"
                :key="item.code">
                {{ item.code }}
              </option>
            </select-field>
          </div>
        </div>

        <div class="issuance-form__asset-info app__form-row" v-if="form.asset">
          <p v-if="isIssuanceAllowed" class="text">
            <span>Available:</span>
            <asset-amount-formatter
              :amount="availableForIssuance"
              :asset="form.asset"
            />
          </p>

          <p v-else class="text">
            No available assets left
          </p>
        </div>

        <div class="issuance-form__form-actions app__form-actions">
          <button
            class="app__btn"
            :disabled="isSubmitting || !isIssuanceAllowed"
          >
            Issue
          </button>
        </div>
      </form>
    </template>

    <template v-else>
      <p>Loading...</p>
      <!-- TODO: better loading -->
    </template>
  </div>
</template>

<script>
import { InputField, SelectField } from '@comcom/fields'

import { AssetAmountFormatter } from '@comcom/formatters'
import { confirmAction } from '../../../../../js/modals/confirmation_message'

import api from '@/api'
import { Sdk } from '@/sdk'

import config from '@/config'
import { ErrorHandler } from '@/utils/ErrorHandler'

import Bus from '@/utils/EventBus'
import { DEFAULT_INPUT_STEP, DEFAULT_INPUT_MIN } from '@/constants'

export default {
  components: {
    InputField,
    SelectField,
    AssetAmountFormatter,
  },

  data () {
    return {
      DEFAULT_INPUT_STEP,
      DEFAULT_INPUT_MIN,
      form: {
        amount: '',
        receiver: '',
        reference: '',
        asset: '',
      },
      assets: [],
      isSubmitting: false,
    }
  },

  computed: {
    availableForIssuance () {
      const asset = this.assets.find(item => item.code === this.form.asset)
      return asset.availableForIssuance
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
        const response = await Sdk.horizon.assets
          .getAll({ owner: config.MASTER_ACCOUNT })
        const list = response.data || []
        const issuableAssets = list.filter(item => item.maxIssuanceAmount > 0)
        this.assets = issuableAssets
        this.form.asset = this.form.asset || (issuableAssets[0] || {}).code
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async getBalanceId () {
      let address
      if (Sdk.base.Keypair.isValidPublicKey(this.form.receiver)) {
        address = this.form.receiver
      } else {
        address = await api.users.getAccountIdByEmail(this.form.receiver)
      }

      if (!address) {
        throw new Error(`Account doesn't exists in the systen`)
      }

      const response = await Sdk.horizon.account.get(address)
      let account = response.data
      const balance = account.balances
        .find(item => item.asset === this.form.asset)

      if (!balance) {
        try {
          const operation = Sdk.base.Operation.manageBalance({
            asset: this.form.asset,
            action: Sdk.xdr.ManageBalanceAction.createUnique(),
            destination: address,
          })
          await Sdk.horizon.transactions.submitOperations(operation)
        } catch (error) {
          ErrorHandler.process(error)
        }

        const response = await Sdk.horizon.account.get(address)
        account = response.data
        return account.balances
          .find(item => item.asset === this.form.asset).balanceId
      } else {
        return balance.balanceId
      }
    },

    async sendManualIssuance (receiver) {
      if (receiver === '') {
        throw new Error(`The receiver has no ${this.form.asset} balance.`)
      }
      const operation = Sdk.base.CreateIssuanceRequestBuilder
        .createIssuanceRequest({
          asset: this.form.asset,
          amount: this.form.amount,
          receiver: receiver,
          reference: this.form.reference,
          source: config.MASTER_ACCOUNT,
          creatorDetails: {},
          allTasks: 0,
        })
      await Sdk.horizon.transactions.submitOperations(operation)

      this.form.amount = null
      this.form.receiver = null
      this.form.reference = null

      this.$store.dispatch('SET_INFO', 'Issued successfully')
      this.getAssets()
    },

    async submit () {
      this.isSubmitting = true

      if (await confirmAction()) {
        try {
          await this.$validator.validateAll()

          const balanceId = await this.getBalanceId()
          await this.sendManualIssuance(balanceId)

          Bus.$emit('issuance:updateRequestList')
          await this.getAssets()
        } catch (error) {
          ErrorHandler.process(error)
        }
      }

      this.isSubmitting = false
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
