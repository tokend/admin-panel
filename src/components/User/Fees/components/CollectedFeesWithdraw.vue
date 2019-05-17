<template>
  <div class="collected-fees-withdraw">
    <div class="app__block">
      <h2>Withdrawal</h2>

      <form @submit.prevent="createWithdraw">
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
            :disabled="isFormPending"
          />
        </div>

        <!-- TODO: withdraw to where? -->

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
import { Sdk } from '@/sdk'

export default {
  components: {
    InputField,
    SelectField,
  },

  props: {
    fromBalanceId: {
      type: String,
      default: '',
    },
    withdrawalAmount: {
      type: [String, Number],
      default: '',
    },
  },

  data () {
    return {
      form: {
        balanceId: '',
        amount: '',
      },
      isFormPending: false,
      isMasterBalancesLoading: false,
      isMasterBalancesFailed: false,
      masterBalances: [],
    }
  },

  watch: {
    fromBalanceId (newValue) {
      this.form.balanceId = newValue
    },

    withdrawalAmount (newValue) {
      this.form.amount = newValue
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

    async createWithdraw () {
      this.isFormPending = true
      try {
        const operation = this.craftWithdrawOperation()
        await Sdk.horizon.transactions.submitOperations(operation)
      } catch (err) {
        ErrorHandler.process('Something went wrong. Can’t to create withdraw')
      }
      this.isFormPending = false
    },

    craftWithdrawOperation () {
      const opts = {
        balance: this.form.balanceId,
        amount: this.form.amount,
        creatorDetails: {},
        destAsset: this.form.code,
        // TODO: calculate
        // fee: {
        //   fixed: '0',
        //   percent: '0',
        // },
      }

      return Sdk.base.CreateWithdrawRequestBuilder
        .createWithdrawWithAutoConversion(opts)
    },
  },
}
</script>

<style lang="scss" scoped>
.collected-fees-withdraw__submit-btn {
  max-width: 18rem;
}
</style>
