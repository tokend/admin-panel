<template>
  <div class="issuance-form">
    <template v-if="assets && assets.length">
      <form @submit.prevent="submit">
        <div class="app__form-row">
          <input-field class="app__form-field"
            type="text"
            placeholder="email@example.com or GAAQ..."
            v-model="form.receiver"
            label="Receiver (email or address)"
            :disabled="isSubmitting"
            autocomplete-type="email"
          />
        </div>

        <div class="app__form-row">
          <input-field class="app__form-field"
            v-model="form.reference"
            label="Reference"
            :disabled="isSubmitting"
          />
        </div>

        <div class="app__form-row">
          <input-field class="app__form-field"
            type="number"
            :step="DEFAULT_INPUT_STEP"
            :min="DEFAULT_INPUT_MIN"
            :max="availableForIssuance"
            v-model="form.amount"
            label="Amount"
            :disabled="isSubmitting"
          />

          <div class="issuance-form__asset-field app__form-field">
            <select-field class="issuance-form__asset-select"
              v-model="form.asset"
              label="Asset"
              :disabled="isSubmitting">
              <option v-for="item in assets" :value="item.id" :key="item.id">
                {{item.id}}
              </option>
            </select-field>
          </div>
        </div>

        <div class="issuance-form__asset-info app__form-row" v-if="form.asset">
          <p v-if="isIssuanceAllowed" class="text">
            <span>Available:</span>
            <asset-amount-formatter :amount="availableForIssuance" :asset="form.asset"/>
          </p>

          <p v-else class="text">
            No available assets left
          </p>
        </div>

        <div class="issuance-form__form-actions app__form-actions">
          <button class="app__btn" :disabled="isSubmitting || !isIssuanceAllowed">
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
import api from '@/api'
import { Sdk } from '@/sdk'
import config from '@/config'
import { InputField, SelectField } from '@comcom/fields'
import Bus from '@/utils/EventBus'
import { AssetAmountFormatter } from '@comcom/formatters'
import { DEFAULT_INPUT_STEP, DEFAULT_INPUT_MIN } from '@/constants'

import { confirmAction } from '@/js/modals/confirmation_message'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { ApiCallerFactory } from '@/api-caller-factory'

export default {
  components: {
    InputField,
    SelectField,
    AssetAmountFormatter
  },

  created () {
    Bus.$on('issuance:updateAssets', _ => this.getAssets())
    this.getAssets()
  },

  data () {
    return {
      DEFAULT_INPUT_STEP,
      DEFAULT_INPUT_MIN,
      form: {
        amount: '',
        receiver: '',
        reference: '',
        asset: ''
      },
      assets: [],
      isSubmitting: false
    }
  },

  computed: {
    availableForIssuance () {
      const asset = this.assets.find(item => item.id === this.form.asset)
      return asset.availableForIssuance
    },

    isIssuanceAllowed () {
      return this.availableForIssuance > 0
    }
  },
  methods: {
    async getAssets () {
      try {
        const { data } = await ApiCallerFactory
          .createStubbornCallerInstance()
          .stubbornGet('/v3/assets', {
            filter: {
              owner: config.MASTER_ACCOUNT
            }
          })
        const list = data || []
        const issuableAssets = list.filter(item => item.maxIssuanceAmount > 0)
        this.assets = issuableAssets
        this.form.asset = this.form.asset || (issuableAssets[0] || {}).id
      } catch (error) {
        ErrorHandler.process(error)
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
        return Promise.reject(`Account doesn't exists in the system`)
      }
      const { data } = await ApiCallerFactory
        .createCallerInstance()
        .getWithSignature(`/v3/accounts/${address}`, {
          include: ['balances', 'balances.asset']
        })
      let account = data
      const balance = account.balances.find(item => item.asset.id === this.form.asset)

      if (!balance) {
        try {
          const operation = Sdk.base.Operation.manageBalance({
            asset: this.form.asset,
            action: Sdk.xdr.ManageBalanceAction.createUnique(),
            destination: address
          })
          await ApiCallerFactory
            .createCallerInstance()
            .postOperations(operation)
        } catch (error) {
          ErrorHandler.process(error)
        }
        const { data } = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature(`/v3/accounts/${address}`, {
            include: ['balances', 'balances.asset']
          })
        account = data
        return account.balances.find(item => item.asset.id === this.form.asset).id
      } else {
        return balance.id
      }
    },

    async sendManualIssuance (receiver) {
      if (receiver === '') {
        return Promise.reject(`The receiver has no ${this.form.asset} balance.`)
      }
      const operation = Sdk.base.CreateIssuanceRequestBuilder.createIssuanceRequest({
        asset: this.form.asset,
        amount: this.form.amount,
        receiver: receiver,
        reference: this.form.reference,
        source: config.MASTER_ACCOUNT,
        creatorDetails: {},
        allTasks: 0
      })
      await ApiCallerFactory
        .createCallerInstance()
        .postOperations(operation)
      this.form.amount = null
      this.form.receiver = null
      this.form.reference = null

      this.$store.dispatch('SET_INFO', 'Issued successfully')
      this.getAssets()
    },

    async submit () {
      if (!await confirmAction()) return

      this.isSubmitting = true
      return this.$validator.validateAll()
        .then(this.getBalanceId)
        .then(this.sendManualIssuance)
        .then(_ => {
          Bus.$emit('issuance:updateRequestList')
          return this.getAssets()
        })
        .catch((error) => {
          ErrorHandler.process(error)
        })
        .finally(() => {
          this.isSubmitting = false
        })
    }
  }
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
