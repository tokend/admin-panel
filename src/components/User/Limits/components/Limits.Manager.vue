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
            :key="item.id"
            :value="item.id"
            :selected="item.id === filters.asset"
          >
            {{ item.details.name }} ({{ item.id }})
          </option>
        </select-field>
        <select-field
          class="limits-manager__filter"
          label="Scope"
          v-model="filters.scope"
        >
          <option :value="SCOPE_TYPES.accountRole">
            Account type
          </option>
          <option :value="SCOPE_TYPES.account">
            Account
          </option>
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
            <h3 class="limits-manager__content-title">
              Payment limits
            </h3>
            <div class="limits-manager__limits-list-inner">
              <template v-for="(type, i) in LIMITS_TYPES">
                <div class="limits-manager__limit-row" :key="i">
                  <span class="limits-manager__limit-type">
                    {{ type.replace('Out', '') }}
                  </span>
                  <input-field
                    :value="normalizeLimitAmount(limits.payment[type])"
                    @input="limits.payment[type] = setLimitValue($event)"
                    class="limits-manager__limit-field"
                    :placeholder="getLimitLable(limits.payment, type)"
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
              class="
                limits-manager__remove-btn
                app__btn app__btn-outline
                app__btn-outline--danger
              "
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
            <h3 class="limits-manager__content-title">
              Withdrawal limits
            </h3>
            <div class="limits-manager__limits-list-inner">
              <template v-for="(type,i) in LIMITS_TYPES">
                <div class="limits-manager__limit-row" :key="i">
                  <span class="limits-manager__limit-type">
                    {{ type.replace('Out', '') }}
                  </span>
                  <input-field
                    :value="normalizeLimitAmount(limits.withdrawal[type])"
                    @input="limits.withdrawal[type] = setLimitValue($event)"
                    class="limits-manager__limit-field"
                    :placeholder="getLimitLable(limits.withdrawal, type)"
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
              class="
                limits-manager__remove-btn
                app__btn app__btn-outline
                app__btn-outline--danger
               "
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
            <h3 class="limits-manager__content-title">
              Deposit limits
            </h3>
            <div class="limits-manager__limits-list-inner">
              <template v-for="(type,i) in LIMITS_TYPES">
                <div class="limits-manager__limit-row" :key="i">
                  <span class="limits-manager__limit-type">
                    {{ type.replace('Out', '') }}
                  </span>
                  <input-field
                    :value="normalizeLimitAmount(limits.deposit[type])"
                    @input="limits.deposit[type] = setLimitValue($event)"
                    class="limits-manager__limit-field"
                    :placeholder="getLimitLable(limits.deposit, type)"
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
              class="
                limits-manager__remove-btn
                app__btn app__btn-outline
                app__btn-outline--danger
              "
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
import { SelectField, InputField } from '@comcom/fields'
import get from 'lodash/get'
import throttle from 'lodash/throttle'
import pick from 'lodash/pick'
import api from '@/api'
import { Sdk } from '@/sdk'
import { STATS_OPERATION_TYPES, DEFAULT_MAX_AMOUNT } from '@/constants'
import config from '@/config'
import { confirmAction } from '@/js/modals/confirmation_message'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { ApiCallerFactory } from '@/api-caller-factory'
import { LimitsRecord } from '@/js/records/limits.record'

const LIMITS_TYPES = [
  'dailyOut',
  'weeklyOut',
  'monthlyOut',
  'annualOut',
]

const SCOPE_TYPES = Object.freeze({ // non-xdr values, internal use only
  account: 'USER',
  accountRole: 'ACCOUNT_TYPE',
})

export default {
  components: {
    SelectField,
    InputField,
  },
  data: _ => ({
    filters: {
      asset: '',
      accountRole: '',
      email: '',
      address: '',
      scope: SCOPE_TYPES.accountRole,
    },
    specificUserAddress: '',
    userEmail: '',
    limits: {
      withdrawal: {},
      payment: {},
      deposit: {},
    },
    assets: [],
    isPending: false,
    LIMITS_TYPES,
    DEFAULT_MAX_AMOUNT,
    ACCOUNT_ROLES: config.ACCOUNT_ROLES,
    ACCOUNT_ROLES_VERBOSE: Object.freeze({
      [config.ACCOUNT_ROLES.notVerified]: 'Unverified user',
      [config.ACCOUNT_ROLES.general]: 'General user',
      [config.ACCOUNT_ROLES.corporate]: 'Corporate user',
    }),
    numericValueRegExp: /^[+-]?\d+(\.\d+)?$/,
    SCOPE_TYPES,
  }),
  watch: {
    assets: {
      handler: function () {
        this.setFilters()
        this.getLimits()
      },
      immediate: true,
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
      immediate: true,
    },
    'filters.asset': {
      handler: function () {
        this.setFilters()
        this.getLimits()
      },
      immediate: true,
    },
    'specificUserAddress': {
      handler: throttle(function () {
        this.setFilters()
      }, 1000),
      immediate: true,
    },
    'filters.scope': function (value) {
      if (!value) return
      this.filters.accountRole = value === SCOPE_TYPES.accountRole
        ? config.ACCOUNT_ROLES.general
        : null
      this.specificUserAddress = ''
      this.setFilters()
      this.getLimits()
    },
    'filters.address': function () {
      this.getLimits()
    },
  },
  async created () {
    await this.getAssets()
    this.filters.accountRole = config.ACCOUNT_ROLES.general.toString()
  },
  methods: {
    async getLimits () {
      if (!this.filters.asset) return
      const [
        paymentLimits,
        withdrawalLimits,
        depositLimits,
      ] = await Promise.all([
        getLimit.apply(this, [STATS_OPERATION_TYPES.paymentOut]),
        getLimit.apply(this, [STATS_OPERATION_TYPES.withdraw]),
        getLimit.apply(this, [STATS_OPERATION_TYPES.deposit]),
      ])

      const limitDeatils = {
        assetCode: this.filters.asset,
        accountId: this.filters.address,
        accountRole: this.filters.accountRole,
      }

      this.limits.payment = new LimitsRecord(paymentLimits, {
        statsOpType: STATS_OPERATION_TYPES.paymentOut,
        ...limitDeatils,
      })

      this.limits.withdrawal = new LimitsRecord(
        withdrawalLimits, {
          statsOpType: STATS_OPERATION_TYPES.withdraw,
          ...limitDeatils,
        })

      this.limits.deposit = new LimitsRecord(
        depositLimits, {
          statsOpType: STATS_OPERATION_TYPES.deposit,
          ...limitDeatils,
        })

      async function getLimit (statsOpType) {
        const filters = {}
        if (this.filters.scope === SCOPE_TYPES.account) {
          // Load empty limit list if address field is empty
          filters.account = this.filters.address === ''
            ? 'empty'
            : this.filters.address
        } else {
          filters.account_role = this.filters.accountRole
        }
        const { data } = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/v3/limits', {
            filter: {
              asset: this.filters.asset,
              stats_op_type: statsOpType,
              ...filters,
            },
          })

        return data[0]
      }
    },
    async updateLimits (limits) {
      if (!this.isValidLimits(limits) || !this.isAccountAddressValid()) {
        return
      }
      this.isPending = true
      try {
        if (limits.accountRole == null) {
          /* eslint-disable-next-line max-len */
          // managelimitbuilder somehow doesnt accept opts.accountRole NULL value
          delete limits.accountRole
        }

        if (limits.accountID == null) {
          // managelimitbuilder somehow doesnt accept opts.accountID NULL value
          delete limits.accountID
        }
        const operation = Sdk.base.ManageLimitsBuilder.createLimits({
          ...limits,
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
      if (limits.id === 0) {
        return false
      }
      /* eslint-disable-next-line max-len */
      if (!await confirmAction({ title: this.getTitleConfirmAction(type) })) return
      this.isPending = true
      try {
        const operation = Sdk.base.ManageLimitsBuilder.removeLimits({
          id: (limits.id).toString(),
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
        const accountRole = this.ACCOUNT_ROLES_VERBOSE[this.filters.accountRole]
          .toLowerCase()

        return `Delete ${accountRole} ${type} limits?`
      } else {
        return `Delete ${this.userEmail} ${type} limits?`
      }
    },
    async getAssets () {
      const { data } = await ApiCallerFactory
        .createStubbornCallerInstance()
        .stubbornGet('/v3/assets')
      this.assets = data
    },
    async loadAccountIdByEmail (email) {
      try {
        const { data } = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/identities', {
            filter: { email: email },
            page: { limit: 1 },
          })
        this.filters.address = ((data || [])[0] || {}).address || ''
        this.userEmail = ((data || [])[0] || {}).email || email
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },
    // it's a quick fix of the limits validation. Need to refactor it ASAP
    isValidLimits (limits) {
      for (const limit of Object.values(pick(limits, LIMITS_TYPES))) {
        if (limit === null) {
          ErrorHandler.process('Fill in all the fields. Not set value not allowed')
          return false
        }

        if (!this.numericValueRegExp.test(limit)) {
          ErrorHandler.process('Only numeric value allowed')
          return false
        }
      }
      if (+limits.weeklyOut < +limits.dailyOut) {
        ErrorHandler.process('Weekly out limits should be more or equal to daily out')
        return false
      }
      const isMonthlyLimitsValid = +limits.monthlyOut < +limits.dailyOut ||
        +limits.monthlyOut < +limits.weeklyOut
      if (isMonthlyLimitsValid) {
        ErrorHandler.process('Monthly out limits should be more or equal to daily and/or weekly out')
        return false
      }
      const isAnnualLimitsValid = +limits.annualOut < +limits.dailyOut ||
        +limits.annualOut < +limits.weeklyOut ||
        +limits.annualOut < +limits.monthlyOut
      if (isAnnualLimitsValid) {
        ErrorHandler.process('Annual out limits should be more or equal to daily, weekly and/or monthly out')
        return false
      }
      return true
    },

    isAccountAddressValid () {
      const isAddressInvalid = !this.filters.address &&
        this.filters.scope === SCOPE_TYPES.account

      if (isAddressInvalid) {
        ErrorHandler.process('Such account does not exist in the system')
        return false
      } else {
        return true
      }
    },
    async setFilters () {
      if (!this.filters.asset) this.filters.asset = get(this.assets, '[0].id')
      const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (this.specificUserAddress) {
        if (Sdk.base.Keypair.isValidPublicKey(this.specificUserAddress)) {
          this.filters.address = this.specificUserAddress
          this.userEmail = await api.users.getEmailByAccountId(
            this.filters.address
          )
        } else if (emailRegExp.test(this.specificUserAddress)) {
          await this.loadAccountIdByEmail(this.specificUserAddress)
        }
      } else {
        this.filters.address = ''
      }
    },
    normalizeLimitAmount (limit) {
      return +limit >= +DEFAULT_MAX_AMOUNT ? '' : limit
    },
    getLimitLable (limit, type) {
      return limit[type] === null
        ? 'Not set'
        : 'Unlimited'
    },
    setLimitValue (value) {
      if (value) {
        return +value >= +DEFAULT_MAX_AMOUNT
          ? DEFAULT_MAX_AMOUNT
          : value
      } else {
        return null
      }
    },
  },
}
</script>

<style lang="scss">
  .limits-manager {
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
