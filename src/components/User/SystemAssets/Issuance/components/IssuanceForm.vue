<template>
  <div class="issuance-form">
    <template v-if="assets && assets.length">
      <form @submit.prevent="submit">
        <div class="app__form-row">
          <input-field class="app__form-field"
            type="email"
            placeholder="email@example.com"
            v-model="form.receiver"
            label="Receiver"
            :disabled="isSubmitting"
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
            type="number" :step="DEFAULT_INPUT_STEP" :min="DEFAULT_INPUT_MIN"
            v-model="form.amount"
            label="Amount"
            :disabled="isSubmitting"
          />

          <div class="issuance-form__asset-field app__form-field">
            <select-field class="issuance-form__asset-select"
              v-model="form.asset"
              label="Asset"
              :disabled="isSubmitting">
              <option v-for="item in assets" :value="item.code" :key="item.code">
                {{item.code}}
              </option>
            </select-field>
          </div>
        </div>

        <div class="issuance-form__asset-info app__form-row" v-if="form.asset">
          <p class="text">
            <span>Available:</span>
            <asset-amount-formatter :amount="availableForIssuance" :asset="form.asset"/>
          </p>
        </div>

        <div class="issuance-form__form-actions app__form-actions">
          <button class="app__btn" :disabled="isSubmitting">
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
import { InputField, SelectField } from '@comcom/fields'
import Bus from '@/utils/EventBus'
import { AssetAmountFormatter } from '@comcom/formatters'
import { DEFAULT_INPUT_STEP, DEFAULT_INPUT_MIN } from '@/constants'

import { confirmAction } from '../../../../../js/modals/confirmation_message'

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
      const asset = this.assets.find(item => item.code === this.form.asset)
      return asset.availableForIssuance
    }
  },

  methods: {
    async getAssets () {
      try {
        const list = (await api.assets.getAllSystemAssets()).data || []
        const issuableAssets = list.filter(item => item.maxIssuanceAmount > 0)
        this.assets = issuableAssets
        this.form.asset = (issuableAssets[0] || {}).code
      } catch (error) {
        console.error(error)
        this.$store.dispatch('SET_ERROR', 'Cannot load asset list')
      }
    },

    async getBalanceId () {
      const address = await api.users.getUserIdByEmail(this.form.receiver)
      let account = await api.accounts.getAccountById(address)
      const balance = account.balances.find(item => item.asset === this.form.asset)

      if (!balance) {
        try {
          await api.users.createBalance(address, this.form.asset)
        } catch (error) {
          console.error(error)
          this.$store.dispatch('SET_ERROR', 'Unexpected error')
        }
        account = await api.accounts.getAccountById(address)
        return account.balances.find(item => item.asset === this.form.asset).balance_id
      } else {
        return balance.balance_id
      }
    },

    async sendManualIssuance (receiver) {
      if (receiver === '') {
        return Promise.reject(`The receiver has no ${this.form.asset} balance.`)
      }

      const opts = {
        receiver: receiver,
        asset: this.form.asset,
        amount: this.form.amount,
        reference: this.form.reference,
        allTasks: 0
      }
      opts.preEmissions = []

      await api.emissions.manualEmission(opts)
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
          this.isSubmitting = false
          Bus.$emit('issuance:updateRequestList')
          return this.getAssets()
        })
        .catch(err => {
          console.error(err)
          this.isSubmitting = false
          if (err.showMessage) {
            err.showMessage()
            return
          }

          if (typeof err === 'string') {
            this.$store.dispatch('SET_ERROR', err)
            return
          }

          if (err.status === 404) {
            this.$store.dispatch('SET_ERROR', 'User not found')
          } else {
            this.$store.dispatch('SET_ERROR', 'Something went wrong. Unable to get user details')
          }
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
