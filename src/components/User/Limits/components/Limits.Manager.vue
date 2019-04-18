<template>
  <div class="limits-manager__wrapper">
    <div class="limits-manager">
      <h2>Limits management</h2>
      <div class="limits-manager-filters">
          <select-field
            v-model="filters.asset"
            class="limits-manager__filter"
            label="Asset"
          >
            <option
              v-for="item in assets"
              :key="item.code"
              :value="item.code"
              :selected="item.code === filters.asset"
            >
              {{ item.details.name }} ({{ item.code }})
            </option>
          </select-field>
          <select-field
            class="limits-manager__filter"
            label="Scope"
            v-model="filters.scope"
          >
            <option :value="SCOPE_TYPES.accountRole">Account type</option>
            <option :value="SCOPE_TYPES.account">Account</option>
          </select-field>
          <select-field
            v-model="filters.accountRole"
            class="limits-manager__filter"
            label="Account type"
            v-if="filters.scope === SCOPE_TYPES.accountRole"
          >
            <option
              v-for="type in Object.values(ACCOUNT_ROLES)"
              v-show="ACCOUNT_ROLES_VERBOSE[type]"
              :key="type"
              :value="type"
              :selected="type === +filters.accountRole"
            >
              {{ ACCOUNT_ROLES_VERBOSE[type] }}
            </option>
          </select-field>
          <input-field
            class="limits-manager__filter"
            v-model.trim="specificUserAddress"
            label="Email or Account ID"
            autocomplete-type="email"
            v-if="filters.scope === SCOPE_TYPES.account"
          />
      </div>
    </div>
    <div class="limits-manager__inner">
      <div class="limits-manager__limits-list-wrp">
        <template v-if="limits.payment">
          <div class="limits-manager__limits-list">
            <h3 class="limits-manager__content-title">Payment limits</h3>
            <div class="limits-manager__limits-list-inner">
              <template v-for="(type,i) in LIMITS_TYPES">
                <div class="limits-manager__limit-row" :key="i">
                  <span class="limits-manager__limit-type">
                    {{ type.replace('Out', '') }}
                  </span>
                  <input-field
                    :value="normalizeLimitAmount(limits.payment[type])"
                    @input="limits.payment[type] = $event || DEFAULT_MAX_AMOUNT"
                    class="limits-manager__limit-field"
                    :step="DEFAULT_INPUT_STEP"
                    :placeholder="getLimitLable(limits.payment, type)"
                    min="0"
                  />
                </div>
              </template>
            </div>
          </div>

          <div class="limits-manager__limits-action">
            <button
              class="limits-manager__update-btn app__btn app__btn-outline"
              :disabled="isPending"
              @click="updateLimits(limits.payment)"
            >
              Update
            </button>

            <button
              class="limits-manager__remove-btn app__btn app__btn-outline app__btn-outline--danger"
              :disabled="isPending || limits.payment.id === 0"
              @click="removeLimits(limits.payment, 'payment')"
            >
              Remove
            </button>
          </div>
        </template>
      </div>
      <div class="limits-manager__limits-list-wrp">
        <template v-if="limits.withdrawal">
          <div class="limits-manager__limits-list">
            <h3 class="limits-manager__content-title">Withdrawal limits</h3>
            <div class="limits-manager__limits-list-inner">
              <template v-for="(type,i) in LIMITS_TYPES">
                <div class="limits-manager__limit-row" :key="i">
                  <span class="limits-manager__limit-type">
                    {{ type.replace('Out', '') }}
                  </span>
                  <input-field
                    :value="normalizeLimitAmount(limits.withdrawal[type])"
                    @input="limits.withdrawal[type] = $event || DEFAULT_MAX_AMOUNT"
                    class="limits-manager__limit-field"
                    :step="DEFAULT_INPUT_STEP"
                    :placeholder="getLimitLable(limits.withdrawal, type)"
                    min="0"
                  />
                </div>
              </template>
            </div>
          </div>

          <div class="limits-manager__limits-action">
            <button
              class="limits-manager__update-btn app__btn app__btn-outline"
              :disabled="isPending"
              @click="updateLimits(limits.withdrawal)"
            >
              Update
            </button>

            <button
              class="limits-manager__remove-btn app__btn app__btn-outline app__btn-outline--danger"
              :disabled="isPending || limits.withdrawal.id === 0"
              @click="removeLimits(limits.withdrawal, 'withdrawal')"
            >
              Remove
            </button>
          </div>
        </template>
      </div>
      <div class="limits-manager__limits-list-wrp">
        <template v-if="limits.deposit">
          <div class="limits-manager__limits-list">
            <h3 class="limits-manager__content-title">Deposit limits</h3>
            <div class="limits-manager__limits-list-inner">
              <template v-for="(type,i) in LIMITS_TYPES">
                <div class="limits-manager__limit-row" :key="i">
                  <span class="limits-manager__limit-type">
                    {{ type.replace('Out', '') }}
                  </span>
                  <input-field
                    :value="normalizeLimitAmount(limits.deposit[type])"
                    @input="limits.deposit[type] = $event || DEFAULT_MAX_AMOUNT"
                    class="limits-manager__limit-field"
                    :step="DEFAULT_INPUT_STEP"
                    :placeholder="getLimitLable(limits.deposit, type)"
                    min="0"
                  />
                </div>
              </template>
            </div>
          </div>

          <div class="limits-manager__limits-action">
            <button
              class="limits-manager__update-btn app__btn app__btn-outline"
              :disabled="isPending"
              @click="updateLimits(limits.deposit)"
            >
              Update
            </button>

            <button
              class="limits-manager__remove-btn app__btn app__btn-outline app__btn-outline--danger"
              :disabled="isPending || limits.deposit.id === 0"
              @click="removeLimits(limits.deposit, 'deposit')"
            >
              Remove
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
  import api from '@/api'
  import { Sdk } from '@/sdk'
  import get from 'lodash/get'
  import throttle from 'lodash/throttle'
  import pick from 'lodash/pick'
  import {
    SelectField,
    InputField,
    SwitchField,
    TickField
  } from '@comcom/fields'

  import { STATS_OPERATION_TYPES, DEFAULT_MAX_AMOUNT } from '@/constants'
  import config from '@/config'
  import { confirmAction } from '@/js/modals/confirmation_message'
  import { ErrorHandler } from '@/utils/ErrorHandler'
  import { ApiCallerFactory } from '@/api-caller-factory'

  const LIMITS_TYPES = [
    'dailyOut',
    'weeklyOut',
    'monthlyOut',
    'annualOut'
  ]

  const SCOPE_TYPES = Object.freeze({ // non-xdr values, internal use only
    account: 'USER',
    accountRole: 'ACCOUNT_TYPE'
  })

  export default {
    components: {
      SelectField,
      SwitchField,
      InputField,
      TickField
    },
    data: _ => ({
      filters: {
        asset: '',
        accountRole: config.ACCOUNT_ROLES.general,
        email: '',
        address: '',
        scope: SCOPE_TYPES.accountRole
      },
      specificUserAddress: '',
      limits: {
        withdrawal: null,
        payment: null,
        deposit: null
      },
      assets: [],
      isPending: false,
      LIMITS_TYPES,
      DEFAULT_MAX_AMOUNT,
      ACCOUNT_ROLES: config.ACCOUNT_ROLES,
      ACCOUNT_ROLES_VERBOSE: Object.freeze({
        [config.ACCOUNT_ROLES.notVerified]: 'Unverified user',
        [config.ACCOUNT_ROLES.general]: 'General user',
        [config.ACCOUNT_ROLES.corporate]: 'Corporate user'
      }),
      numericValueRegExp: /^\d*\.?\d*$/,
      SCOPE_TYPES
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

        async function getLimit (statsOpType) {
          const { data } = await Sdk.horizon.limits.get({
            account_id: this.filters.address,
            account_type: this.filters.accountRole,
            stats_op_type: statsOpType,
            asset: this.filters.asset,
            email: this.filters.email
          })

          // TODO: remove legacy consistency fix
          if (data.accountType || data.accountType === null) {
            const role = data.accountType === null
              ? null
              : String(data.accountType)
            data.accountRole = role
            delete data.accountType
          }

          return data
        }
      },

      async updateLimits (limits) {
        if (!this.isValidLimits(limits) || !this.isAccountAddressValid()) {
          return
        }

        this.isPending = true
        try {
          if (limits.accountRole == null) {
            // managelimitbuilder somehow doesnt accept opts.accountRole NULL value
            delete limits.accountRole
          }
          let accountID
          // managelimitbuilder somehow doesnt accept opts.accountId NULL value
          if (limits.accountId) {
            accountID = limits.accountId
          }
          const operation = Sdk.base.ManageLimitsBuilder.createLimits({
            ...limits,
            accountID
          })
          await ApiCallerFactory
            .createCallerInstance()
            .postOperations(operation)
          await this.getAssets()
          this.$store.dispatch('SET_INFO', 'Limits update saved')
        } catch (e) {
          ErrorHandler.process(e)
        }
        this.isPending = false
      },
      async removeLimits (limits, type) {
        console.log(type)
        if (limits.id === 0) {
          return false
        }
        if (!await confirmAction({ title: this.getTitleConfirmAction(type) })) return
        this.isPending = true
        try {
          const operation = Sdk.base.ManageLimitsBuilder.removeLimits({
            id: (limits.id).toString()
          })
          await ApiCallerFactory
            .createCallerInstance()
            .postOperations(operation)
          await this.getLimits()
          this.$store.dispatch('SET_INFO', 'Limits removed')
        } catch (e) {
          ErrorHandler.process(e)
        }
        this.isPending = false
      },
      getTitleConfirmAction (type) {
        if (this.filters.scope === SCOPE_TYPES.accountRole) {
          const accountRole = this.ACCOUNT_ROLES_VERBOSE[this.filters.accountRole].toLowerCase()
          return `Delete ${accountRole} ${type} limits?`
        } else {
          return `Delete ${this.specificUserAddress} ${type} limits?`
        }
      },
      async getAssets () {
        const response = await Sdk.horizon.assets.getAll()
        this.assets = response.data
      },
      async loadAccountIdByEmail (email) {
        let address = ''
        try {
          address = await api.users.getAccountIdByEmail(email)
        } catch (error) {
          address = ''
        }
        this.filters.address = address
      },
      // it's a quick fix of the limits validation. Need to refactor it ASAP
      isValidLimits (limits) {
        for (const limit of Object.values(pick(limits, LIMITS_TYPES))) {
          if (!this.numericValueRegExp.test(limit)) {
            this.$store.dispatch('SET_ERROR', 'Only numeric value allowed')
            return false
          }
        }
        if (+limits.weeklyOut < +limits.dailyOut) {
          this.$store.dispatch('SET_ERROR', 'Weekly out limits should be more or equal to daily out')
          return false
        }
        if (+limits.monthlyOut < +limits.dailyOut || +limits.monthlyOut < +limits.weeklyOut) {
          this.$store.dispatch('SET_ERROR', 'Monthly out limits should be more or equal to daily and/or weekly out')
          return false
        }
        if (+limits.annualOut < +limits.dailyOut || +limits.annualOut < +limits.weeklyOut || +limits.annualOut < +limits.monthlyOut) {
          this.$store.dispatch('SET_ERROR', 'Annual out limits should be more or equal to daily, weekly and/or monthly out')
          return false
        }
        return true
      },
      isAccountAddressValid () {
        const isAddressInvalid = !this.filters.address &&
          this.filters.scope === SCOPE_TYPES.account

        if (isAddressInvalid) {
          this.$store.dispatch('SET_ERROR', 'Such account does not exist in the system')
          return false
        } else {
          return true
        }
      },
      async setFilters () {
        if (!this.filters.asset) this.filters.asset = get(this.assets, '[0].code')
        if (this.specificUserAddress) {
          // Both accountRole and accountId cant be requested at same time
          if (Sdk.base.Keypair.isValidPublicKey(this.specificUserAddress)) {
            this.filters.address = this.specificUserAddress
          } else {
            this.loadAccountIdByEmail(this.specificUserAddress)
          }
        }
      },
      normalizeLimitAmount (limit) {
        return limit >= DEFAULT_MAX_AMOUNT ? '' : limit
      },
      getLimitLable (limit, type) {
        const notSetLimitId = 0
        return limit.id === notSetLimitId && limit[type] === DEFAULT_MAX_AMOUNT
          ? 'Not set'
          : 'Unlimited'
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
      'filters.accountRole': {
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
        }, 1000),
        immediate: true
      },
      'filters.scope': function (value) {
        if (!value) return
        this.filters.accountRole = value === SCOPE_TYPES.accountRole
          ? config.ACCOUNT_ROLES.general
          : ''
        this.specificUserAddress = ''
        this.setFilters()
        this.getLimits()
      },
      'filters.address': function (value) {
        if (value) {
          this.getLimits()
        }
      }
    }
  }
</script>

<style lang="scss">
  .limits-manager {
    /*max-width: 80rem;*/
    margin-top: 2rem;
  }

  .limits-manager__inner {
    display: flex;
  }

  .limits-manager__filter {
    width: calc(33.333333% - 3.4rem);
    &:not(:last-child) {
      margin-right: 5rem;
    }
  }

  .limits-manager__limit-row {
    display: flex;
    align-items: center;
  }

  .limits-manager__limits-list-wrp {
    &:first-child:not(:only-child),
    &:not(:last-child) {
      margin-right: 5rem;
    }
    width: 100%;
  }

  .limits-manager__limits-list {
    margin-bottom: 1.7rem;
  }

  .limits-manager__limit-type {
    margin-right: 1rem;
    min-width: 5rem;
    font-size: 1.2rem;
    font-weight: 600;
    padding: 1.7rem 0 0.6rem 0;
  }

  .limits-manager__remove-btn {
    margin-left: 0.5rem;
  }

  .limits-manager-filters {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 5rem;
  }

  .limits-manager__limits-action {
    display: flex;
    justify-content: space-between;
  }

  .limits-manager__update-btn,
  .limits-manager__remove-btn {
    min-width: 9rem;
  }
</style>
