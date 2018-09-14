<template>
  <div class="limits-manager__wrapper">
    <tabs>
      <tab name="Specific account type">
        <div class="limits-manager">
          <h2>Limits management</h2>
          <div class="limits-manager__inner">
            <div class="limits-manager__limits-list-wrp">
              <select-field v-model="filters.accountType"
                            class="limits-manager__filter"
                            label="Account type"
              >
                <option v-for="type in Object.values(ACCOUNT_TYPES)"
                        v-if="ACCOUNT_TYPES_VERBOSE[type]"
                        :key="type"
                        :value="type"
                        :selected="type === +filters.accountType"
                >
                  {{ ACCOUNT_TYPES_VERBOSE[type] }}
                </option>
              </select-field>
            </div>
            <div class="limits-manager__limits-list-wrp">
              <select-field v-model="filters.asset"
                            class="limits-manager__filter"
                            label="Asset"
              >
                <option v-for="item in assets"
                        :key="item.code"
                        :value="item.code"
                        :selected="item.code === filters.asset"
                >
                  {{ item.details.name }} ({{ item.code }})
                </option>
              </select-field>
            </div>
          </div>
        </div>
      </tab>
      <tab name="Specific account">
        <div class="limits-manager">
          <h2>Limits management</h2>
          <div class="limits-manager-filters">
            <input-field class="limits-manager-filters__field limits-manager-filters__specific-user-field" v-model.trim="specificUserAddress" label="Email or Account ID" />

            <select-field v-model="filters.asset"
              class="limits-manager-filters__specific-user-field"
              label="Asset"
            >
              <option v-for="item in assets"
                      :key="item.code"
                      :value="item.code"
                      :selected="item.code === filters.asset"
              >
                {{ item.details.name }} ({{ item.code }})
              </option>
            </select-field>
          </div>
        </div>
      </tab>
    </tabs>
    <div class="limits-manager__inner">
      <div class="limits-manager__limits-list-wrp">
        <template v-if="limits.payment">
          <div class="limits-manager__limits-list">
            <h3 class="limits-manager__content-title">Payment</h3>
            <div class="limits-manager__limits-list-inner">
              <template v-for="(type,i) in LIMITS_TYPES">
                <div class="limits-manager__limit-row" :key="i">
                  <span class="limits-manager__limit-type">{{ type.replace('Out', '') }} limit</span>
                  <input-field v-model="limits.payment[type]"
                              class="limits-manager__limit-field"
                              :step="DEFAULT_INPUT_STEP"
                              :type="number"
                              :label="' '"
                              min="0"
                  />
                  <switch-field v-model="switchValues.payment[type]" />
                </div>
              </template>
            </div>
          </div>

          <div class="limits-manager__limits-action">
            <button class="limits-manager__update-btn app__btn"
                    :disabled="isPending"
                    @click="updateLimits(limits.payment)">
              Update payment limits
            </button>
          </div>
        </template>
      </div>
      <div class="limits-manager__limits-list-wrp">
        <template v-if="limits.withdrawal">
          <div class="limits-manager__limits-list">
            <h3 class="limits-manager__content-title">Withdrawal</h3>
            <div class="limits-manager__limits-list-inner">
              <template v-for="(type,i) in LIMITS_TYPES">
                <div class="limits-manager__limit-row" :key="i">
                  <span class="limits-manager__limit-type">{{ type.replace('Out', '') }} limit</span>
                  <input-field v-model="limits.withdrawal[type]"
                              class="limits-manager__limit-field"
                              :step="DEFAULT_INPUT_STEP"
                              :type="number"
                              :label="' '"
                              min="0"
                  />
                  <switch-field v-model="switchValues.withdrawal[type]" />
                </div>
              </template>
            </div>
          </div>

          <div class="limits-manager__limits-action">
            <button class="limits-manager__update-btn app__btn"
                    :disabled="isPending"
                    @click="updateLimits(limits.withdrawal)">
              Update withdrawal limits
            </button>
          </div>
        </template>
      </div>
      <div class="limits-manager__limits-list-wrp">
        <template v-if="limits.deposit">
          <div class="limits-manager__limits-list">
            <h3 class="limits-manager__content-title">Deposit</h3>
            <div class="limits-manager__limits-list-inner">
              <template v-for="(type,i) in LIMITS_TYPES">
                <div class="limits-manager__limit-row" :key="i">
                  <span class="limits-manager__limit-type">{{ type.replace('Out', '') }} limit</span>
                  <input-field v-model="limits.deposit[type]"
                              class="limits-manager__limit-field"
                              :step="DEFAULT_INPUT_STEP"
                              :type="number"
                              :label="' '"
                              min="0"
                  />
                  <switch-field v-model="switchValues.deposit[type]" />
                </div>
              </template>
            </div>
          </div>

          <div class="limits-manager__limits-action">
            <button class="limits-manager__update-btn app__btn"
                    :disabled="isPending"
                    @click="updateLimits(limits.deposit)">
              Update deposit limits
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
  import api from '@/api'
  import get from 'lodash/get'
  import throttle from 'lodash/throttle'
  import pick from 'lodash/pick'
  import {
    SelectField,
    InputField,
    SwitchField,
    TickField
  } from '@comcom/fields'

  import {
    Tabs,
    Tab
  } from '@comcom/Tabs'

  import {
    STATS_OPERATION_TYPES,
    ACCOUNT_TYPES,
    DEFAULT_MAX_AMOUNT
  } from '@/constants'

  const ACCOUNT_TYPES_VERBOSE = Object.freeze({
    [ACCOUNT_TYPES.notVerified]: 'Unverified user',
    [ACCOUNT_TYPES.general]: 'Individual user',
    [ACCOUNT_TYPES.syndicate]: 'Syndicate user'
  })

  const LIMIT_OPS_STR = Object.freeze({
    payment: 'paymentOut',
    withdrawal: 'withdraw',
    deposit: 'deposit'
  })

  const LIMITS_TYPES = [
    'dailyOut',
    'weeklyOut',
    'monthlyOut',
    'annualOut'
  ]

  export default {
    components: {
      SelectField,
      SwitchField,
      InputField,
      TickField,
      Tabs,
      Tab
    },
    data: _ => ({
      filters: {
        asset: '',
        accountType: '',
        email: '',
        address: ''
      },
      specificUserAddress: '',
      limits: {
        withdrawal: null,
        payment: null,
        deposit: null
      },
      switchValues: {
        payment: {
          dailyOut: false,
          weeklyOut: false,
          monthlyOut: false,
          annualOut: false
        },
        withdrawal: {
          dailyOut: false,
          weeklyOut: false,
          monthlyOut: false,
          annualOut: false
        },
        deposit: {
          dailyOut: false,
          weeklyOut: false,
          monthlyOut: false,
          annualOut: false
        }
      },
      assets: [],
      isPending: false,
      LIMITS_TYPES,
      ACCOUNT_TYPES,
      ACCOUNT_TYPES_VERBOSE
    }),
    async created () {
      await this.getAssets()
    },
    methods: {
      async getLimits () {
        if (!this.filters.asset) return
        const [paymentLimits, withdrawalLimits, depositLimits] = await Promise.all([
          getLimit.apply(this, [STATS_OPERATION_TYPES.paymentOut]),
          getLimit.apply(this, [STATS_OPERATION_TYPES.withdraw]),
          getLimit.apply(this, [STATS_OPERATION_TYPES.deposit])
        ])
        this.limits.payment = paymentLimits
        this.limits.withdrawal = withdrawalLimits
        this.limits.deposit = depositLimits

        const pickedPaymentLimits = pick(this.limits.payment, Object.keys(this.switchValues.payment))
        const pickedWithdrawLimits = pick(this.limits.withdrawal, Object.keys(this.switchValues.withdrawal))
        const pickedDepositLimits = pick(this.limits.deposit, Object.keys(this.switchValues.deposit))
        this.switchValues.payment = Object.keys(this.switchValues.payment).reduce((newObj, key) => {
          return {
            ...newObj,
            [key]: pickedPaymentLimits[key] !== DEFAULT_MAX_AMOUNT // If not equal to DEFAULT_MAX_AMOUNT, limits are enabled
          }
        }, {})

        this.switchValues.withdrawal = Object.keys(this.switchValues.withdrawal).reduce((newObj, key) => {
          return {
            ...newObj,
            [key]: pickedWithdrawLimits[key] !== DEFAULT_MAX_AMOUNT
          }
        }, {})

        this.switchValues.deposit = Object.keys(this.switchValues.deposit).reduce((newObj, key) => {
          return {
            ...newObj,
            [key]: pickedDepositLimits[key] !== DEFAULT_MAX_AMOUNT
          }
        }, {})

        async function getLimit (statsOpType) {
          return (await api.limits.getAll({
            ...this.filters,
            statsOpType
          })).data
        }
      },

      async updateLimits (limits) {
        this.isPending = true
        const limitsStatsOpTypeStr = Object.keys(STATS_OPERATION_TYPES).find(key => STATS_OPERATION_TYPES[key] === limits.statsOpType)
        const limitsOpStr = Object.keys(LIMIT_OPS_STR).find(key => LIMIT_OPS_STR[key] === limitsStatsOpTypeStr)
        const disabledLimits = Object.keys(this.switchValues[limitsOpStr])
          .filter(item => item)
          .reduce((newObj, item) => {
            return {
              ...newObj,
              [item]: this.switchValues[limitsOpStr][item] ? limits[item] : DEFAULT_MAX_AMOUNT
            }
          }, {})
        try {
          if (limits.accountType == null) {
            delete limits.accountType // managelimitbuilder somehow doesnt accept opts.accountType NULL value
          }
          let accountID
          if (limits.accountId) { // managelimitbuilder somehow doesnt accept opts.accountId NULL value
            accountID = limits.accountId
          }
          await api.limits.update({
            ...limits,
            ...disabledLimits,
            accountID
          })
          await this.getAssets()
          this.$store.dispatch('SET_INFO', 'Limits update saved')
        } catch (e) {
          console.error(e)
          e.showMessage()
        }
        this.isPending = false
      },

      async getAssets () {
        this.assets = (await api.assets.getAll()).data
      },
      async getAccountIdByEmail (email) {
        this.filters.address = await api.users.getAccountIdByEmail(email)
      },
      setFilters () {
        if (!this.filters.asset) this.filters.asset = get(this.assets, '[0].code')
        if (!this.filters.accountType) this.filters.accountType = ACCOUNT_TYPES.general + ''
        if (this.specificUserAddress) {
          this.filters.accountType = '' // Both accountType and accountId cant be requested at same time
          const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          const idLength = 56
          if (emailRegExp.test(this.specificUserAddress)) this.getAccountIdByEmail(this.specificUserAddress)
          else if (this.specificUserAddress.length === idLength) this.filters.address = this.specificUserAddress
        }
      }
    },
    watch: {
      assets: {
        handler: function () {
          this.setFilters()
          this.getLimits()
        },
        immediate: true
      },
      'filters.accountType': {
        handler: function (value) {
          if (value) {
            this.specificUserAddress = ''
            this.filters.address = ''
          }
          this.setFilters()
          this.getLimits()
        },
        immediate: true
      },
      'filters.asset': {
        handler: function () {
          this.setFilters()
          this.getLimits()
        },
        immediate: true
      },
      'specificUserAddress': {
        handler: throttle(function (value) {
          if (!value) return
          this.setFilters()
          this.getLimits()
        }, 1000),
        immediate: true
      }
    }
  }
</script>

<style lang="scss">
  .limits-manager {
    /*max-width: 80rem;*/
    margin-top: 2rem;
  }

  .limits-manager__filters,
  .limits-manager__inner {
    display: flex;
  }

  .limits-manager__filter {
    margin-bottom: 5rem;
    width: 100%;
    &:first-child { margin-right: 2rem }
  }

  .limits-manager-filters,
  .limits-manager__limit-row {
    display: flex;
    align-items: flex-end;
  }

  .limits-manager-filters__field,
  .limits-manager__limits-list-wrp {
    &:first-child:not(:only-child),
    &:not(:last-child) {
      margin-right: 5rem;
    }
    width: 100%;
  }

  .limits-manager-filters__field {
    margin-bottom: 5rem;
  }

  .limits-manager__limits-list {
    margin-bottom: 4rem;
  }

  .limits-manager__limit-type {
    margin-right: 1rem;
    min-width: 7.5rem;
    font-size: 1.2rem;
    font-weight: 600;
  }

  .limits-manager-filters__specific-user-field {
    margin-bottom: 5rem;
    width: 50%;
  }

  .limits-manager__limit-field {
    margin-right: 1rem;
  }
</style>
