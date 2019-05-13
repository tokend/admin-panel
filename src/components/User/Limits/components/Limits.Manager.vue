<template>
  <div class="limits-manager__wrapper">
    <div class="limits-manager">
      <h2>Limits management</h2>
      <div
        class="limits-manager__filters"
        :class="{
          'limits-manager__filters--global':
            filters.scope === SCOPE_TYPES.global
        }"
      >
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
          <option :value="SCOPE_TYPES.global">
            Global
          </option>
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
          <option :value="ACCOUNT_ROLES.general">
            General
          </option>
          <option :value="ACCOUNT_ROLES.notVerified">
            Not verified
          </option>
          <option :value="ACCOUNT_ROLES.corporate">
            Corporate
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
      <template v-if="filters.scope !== SCOPE_TYPES.account || filters.address">
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
                      type="number"
                      :value="normalizeLimitAmount(limits.payment[type])"
                      @input="setLimitValue($event, limits.payment[type])"
                      class="limits-manager__limit-field"
                      :placeholder="getLimitLabel(limits.payment, type)"
                      :class="{
                        'limits-manager__limit-field--unlimited':
                          isMaxLimitValue(limits.payment[type])
                      }"
                      :step="DEFAULT_INPUT_STEP"
                      :max="DEFAULT_MAX_AMOUNT"
                    />
                  </div>
                </template>
              </div>
            </div>

            <div class="limits-manager__limits-action">
              <button
                class="limits-manager__update-btn app__btn app__btn--info"
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
                      type="number"
                      :value="normalizeLimitAmount(limits.withdrawal[type])"
                      @input="setLimitValue($event, limits.withdrawal[type])"
                      class="limits-manager__limit-field"
                      :placeholder="getLimitLabel(limits.withdrawal, type)"
                      :class="{
                        'limits-manager__limit-field--unlimited':
                          isMaxLimitValue(limits.withdrawal[type])
                      }"
                      :step="DEFAULT_INPUT_STEP"
                      :max="DEFAULT_MAX_AMOUNT"
                    />
                  </div>
                </template>
              </div>
            </div>

            <div class="limits-manager__limits-action">
              <button
                class="limits-manager__update-btn app__btn app__btn--info"
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
                      type="number"
                      :value="normalizeLimitAmount(limits.deposit[type])"
                      @input="setLimitValue($event, limits.deposit[type])"
                      class="limits-manager__limit-field"
                      :placeholder="getLimitLabel(limits.deposit, type)"
                      :class="{
                        'limits-manager__limit-field--unlimited':
                          isMaxLimitValue(limits.deposit[type])
                      }"
                      :step="DEFAULT_INPUT_STEP"
                      :max="DEFAULT_MAX_AMOUNT"
                    />
                  </div>
                </template>
              </div>
            </div>

            <div class="limits-manager__limits-action">
              <button
                class="limits-manager__update-btn app__btn app__btn--info"
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
      </template>
      <template v-else-if="isAddressLoading">
        <div class="limits-manager__message-wrp">
          <p>Loading ...</p>
        </div>
      </template>
      <template v-else-if="!specificUserAddress">
        <div class="limits-manager__message-wrp">
          <p>Please specify account</p>
        </div>
      </template>
      <template v-else>
        <div class="limits-manager__message-wrp">
          <p>Such account not found</p>
        </div>
      </template>
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
import {
  STATS_OPERATION_TYPES,
  DEFAULT_MAX_AMOUNT,
  DEFAULT_INPUT_STEP,
} from '@/constants'
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
  global: 'GLOBAL',
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
      address: '',
      scope: SCOPE_TYPES.global,
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
    isAddressLoading: false,
    LIMITS_TYPES,
    DEFAULT_MAX_AMOUNT,
    DEFAULT_INPUT_STEP,
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
          this.setFilters()
          this.getLimits()
        }
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
        ? String(config.ACCOUNT_ROLES.general)
        : null
      this.specificUserAddress = ''
      if (value !== SCOPE_TYPES.account) {
        this.setFilters()
        this.getLimits()
      }
    },
    'filters.address': function (value) {
      if (!value) return
      this.getLimits()
    },
  },
  async created () {
    await this.getAssets()
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

      const limitDetails = {
        assetCode: this.filters.asset,
        accountId: this.filters.address,
        accountRole: this.filters.accountRole,
      }

      this.limits.payment = new LimitsRecord(paymentLimits, {
        statsOpType: STATS_OPERATION_TYPES.paymentOut,
        ...limitDetails,
      })

      this.limits.withdrawal = new LimitsRecord(
        withdrawalLimits, {
          statsOpType: STATS_OPERATION_TYPES.withdraw,
          ...limitDetails,
        })

      this.limits.deposit = new LimitsRecord(
        depositLimits, {
          statsOpType: STATS_OPERATION_TYPES.deposit,
          ...limitDetails,
        })

      async function getLimit (statsOpType) {
        const filters = {}
        if (this.filters.scope === SCOPE_TYPES.account) {
          filters.account = this.filters.address
        } else if (this.filters.scope === SCOPE_TYPES.accountRole) {
          filters.account_role = this.filters.accountRole
        }
        const { data: limits } = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/v3/limits', {
            filter: {
              asset: this.filters.asset,
              stats_op_type: statsOpType,
              ...filters,
            },
          })
        if (this.filters.scope === SCOPE_TYPES.global) {
          const globalLimits = limits
            .filter((limit) => !(limit.accountRole || limit.account))

          return globalLimits[0]
        } else {
          return limits[0]
        }
      }
    },
    async updateLimits (limits) {
      if (!this.isValidLimits(limits) || !this.isAccountAddressValid()) {
        return
      }
      this.isPending = true
      try {
        if (limits.accountRole == null) {
          // managelimitbuilder doesnt accept opts.accountRole NULL value
          delete limits.accountRole
        }

        if (limits.accountID == null) {
          // managelimitbuilder doesnt accept opts.accountID NULL value
          delete limits.accountID
        }
        const limitTypes = {}
        LIMITS_TYPES.forEach(
          type => {
            limitTypes[type] = limits[type].value
          }
        )
        const operation = Sdk.base.ManageLimitsBuilder.createLimits({
          ...limits,
          ...limitTypes,
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
      if (!await confirmAction({
        title: this.getTitleConfirmAction(type),
      })) return
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
        this.userEmail = ((data || [])[0] || {}).email || email
        if (this.userEmail === email) {
          this.filters.address = ((data || [])[0] || {}).address
        } else {
          this.filters.address = ''
        }
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },
    // it's a quick fix of the limits validation. Need to refactor it ASAP
    isValidLimits (limits) {
      for (const limit of Object.values(pick(limits, LIMITS_TYPES))) {
        if (limit.value === null) {
          ErrorHandler.process('Fill in all the fields. Not set value not allowed')
          return false
        }

        if (!this.numericValueRegExp.test(limit.value)) {
          ErrorHandler.process('Only numeric value allowed')
          return false
        }
      }
      if (+limits.weeklyOut.value < +limits.dailyOut.value) {
        ErrorHandler.process('Weekly out limits should be more or equal to daily out')
        return false
      }
      const isMonthlyLimitsValid =
        +limits.monthlyOut.value < +limits.dailyOut.value ||
        +limits.monthlyOut.value < +limits.weeklyOut.value
      if (isMonthlyLimitsValid) {
        ErrorHandler.process('Monthly out limits should be more or equal to daily and/or weekly out')
        return false
      }
      const isAnnualLimitsValid =
        +limits.annualOut.value < +limits.dailyOut.value ||
        +limits.annualOut.value < +limits.weeklyOut.value ||
        +limits.annualOut.value < +limits.monthlyOut.value
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
      this.isAddressLoading = true
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
      this.isAddressLoading = false
    },
    normalizeLimitAmount (limit) {
      if (limit) {
        return this.isMaxLimitValue(limit)
          ? limit.isChanged ? DEFAULT_MAX_AMOUNT : ''
          : limit.value
      }
    },
    getLimitLabel (limit, type) {
      if (limit[type]) {
        return limit[type].value === ''
          ? 'Not set'
          : 'Unlimited'
      }
    },
    setLimitValue (value, limit) {
      limit.isChanged = true
      limit.value = value
      if (this.isMaxLimitValue(limit)) limit.value = DEFAULT_MAX_AMOUNT
    },
    isMaxLimitValue (limit) {
      if (limit) {
        return +limit.value >= +DEFAULT_MAX_AMOUNT
      }
    },
  },
}
</script>

<style lang="scss">
  @import "@/assets/scss/_colors.scss";

  .limits-manager {
    margin-top: 2rem;
  }

  .limits-manager__inner {
    display: flex;
    justify-content: center;
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
  .limits-manager__message-wrp {
    display: flex;
    justify-content: center;
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

  .limits-manager__filters {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 5rem;

    &--global {
      justify-content: flex-start;
    }
  }

  .limits-manager__limits-action {
    display: flex;
    justify-content: space-between;
  }

  .limits-manager__update-btn,
  .limits-manager__remove-btn {
    min-width: 9rem;
  }

  .limits-manager__limit-field--unlimited {
    & .input-field__input {
      &::placeholder {
        color: $color-text;
      }
    }
  }
</style>
