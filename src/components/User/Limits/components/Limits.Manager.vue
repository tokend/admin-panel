<template>
  <div class="limits-manager__wrapper">
    <tabs @changed="onTabChange">
      <tab :name="TAB_NAMES.accountType">
        <div class="limits-manager">
          <h2>Limits management</h2>
          <div class="limits-manager__inner">
            <div class="limits-manager__limits-list-wrp">
              <select-field
                v-model="filters.accountRole"
                class="limits-manager__filter"
                label="Account type"
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
            </div>
            <div class="limits-manager__limits-list-wrp">
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
            </div>
          </div>
        </div>
      </tab>
      <tab :name="TAB_NAMES.account">
        <div class="limits-manager">
          <h2>Limits management</h2>
          <div class="limits-manager-filters">
            <input-field
              class="limits-manager-filters__field
                    limits-manager-filters__specific-user-field"
              v-model.trim="specificUserAddress"
              label="Email or Account ID"
              autocomplete-type="email"
            />

            <select-field v-model="filters.asset"
              class="limits-manager-filters__specific-user-field"
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
          </div>
        </div>
      </tab>
    </tabs>
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
                    placeholder="Unlimited"
                    min="0"
                  />
                </div>
              </template>
            </div>
          </div>

          <div class="limits-manager__limits-action">
            <button
              class="limits-manager__update-btn app__btn"
              :disabled="isPending"
              @click="updateLimits(limits.payment)"
            >
              Update payment limits
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
                    placeholder="Unlimited"
                    min="0"
                  />
                </div>
              </template>
            </div>
          </div>

          <div class="limits-manager__limits-action">
            <button
              class="limits-manager__update-btn app__btn"
              :disabled="isPending"
              @click="updateLimits(limits.withdrawal)"
            >
              Update withdrawal limits
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
                    placeholder="Unlimited"
                    min="0"
                  />
                </div>
              </template>
            </div>
          </div>

          <div class="limits-manager__limits-action">
            <button
              class="limits-manager__update-btn app__btn"
              :disabled="isPending"
              @click="updateLimits(limits.deposit)"
            >
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

import {
  Tabs,
  Tab
} from '@comcom/Tabs'

import { STATS_OPERATION_TYPES, DEFAULT_MAX_AMOUNT } from '@/constants'
import config from '@/config'

import { ErrorHandler } from '@/utils/ErrorHandler'

const LIMITS_TYPES = [
  'dailyOut',
  'weeklyOut',
  'monthlyOut',
  'annualOut'
]

const TAB_NAMES = {
  accountType: 'Specific account type',
  account: 'Specific account'
}

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
      accountRole: '',
      email: '',
      address: ''
    },
    selectedTabName: '',
    specificUserAddress: '',
    limits: {
      withdrawal: null,
      payment: null,
      deposit: null
    },
    assets: [],
    isPending: false,
    LIMITS_TYPES,
    TAB_NAMES,
    DEFAULT_MAX_AMOUNT,
    ACCOUNT_ROLES: config.ACCOUNT_ROLES,
    ACCOUNT_ROLES_VERBOSE: Object.freeze({
      [config.ACCOUNT_ROLES.notVerified]: 'Unverified user',
      [config.ACCOUNT_ROLES.general]: 'General user',
      [config.ACCOUNT_ROLES.corporate]: 'Corporate user'
    }),
    numericValueRegExp: /^\d*\.?\d*$/
  }),
  async created () {
    await this.getAssets()
  },
  methods: {
    async onTabChange (selectedTab) {
      this.selectedTabName = selectedTab.tab.name

      if (this.selectedTabName === TAB_NAMES.accountType) {
        this.specificUserAddress = ''
      }
    },
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
        await Sdk.horizon.transactions.submitOperations(operation)
        await this.getAssets()
        this.$store.dispatch('SET_INFO', 'Limits update saved')
      } catch (e) {
        ErrorHandler.process(e)
      }
      this.isPending = false
    },

    async getAssets () {
      try {
        const response = await Sdk.horizon.assets.getAll()
        this.assets = response.data
      } catch (e) {
        ErrorHandler.processWithoutFeedback(e)
      }
    },
    async getAccountIdByEmail (email) {
      this.filters.address = await api.users.getAccountIdByEmail(email)
    },
    // it's a quick fix of the limits validation. Need to refactor it ASAP
    isValidLimits (limits) {
      for (const limit of Object.values(pick(limits, LIMITS_TYPES))) {
        if (!this.numericValueRegExp.test(limit)) {
          ErrorHandler.process('Only numeric value allowed')
          return false
        }
      }
      if (+limits.weeklyOut < +limits.dailyOut) {
        ErrorHandler.process('Weekly out limits should be more or equal to daily out')
        return false
      }
      if (+limits.monthlyOut < +limits.dailyOut || +limits.monthlyOut < +limits.weeklyOut) {
        ErrorHandler.process('Monthly out limits should be more or equal to daily and/or weekly out')
        return false
      }
      if (+limits.annualOut < +limits.dailyOut || +limits.annualOut < +limits.weeklyOut || +limits.annualOut < +limits.monthlyOut) {
        ErrorHandler.process('Annual out limits should be more or equal to daily, weekly and/or monthly out')
        return false
      }
      return true
    },
    isAccountAddressValid () {
      const isAddressInvalid = !this.filters.address &&
        this.selectedTabName === TAB_NAMES.account

      if (isAddressInvalid) {
        ErrorHandler.process('Such account does not exist in the system')
        return false
      } else {
        return true
      }
    },
    async setFilters () {
      if (!this.filters.asset) this.filters.asset = get(this.assets, '[0].code')
      if (!this.filters.accountRole) {
        this.filters.accountRole = config.ACCOUNT_ROLES.general + ''
      }
      if (this.specificUserAddress) {
        // Both accountRole and accountId cant be requested at same time
        this.filters.accountRole = ''
        const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const idLength = 56
        if (emailRegExp.test(this.specificUserAddress)) {
          await this.getAccountIdByEmail(this.specificUserAddress)
        } else if (this.specificUserAddress.length === idLength) {
          this.filters.address = this.specificUserAddress
        }
      }
    },
    normalizeLimitAmount (limit) {
      return limit >= DEFAULT_MAX_AMOUNT ? '' : limit
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
      handler: throttle(async function (value) {
        await this.setFilters()
        await this.getLimits()
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
    align-items: center;
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
    min-width: 5rem;
    font-size: 1.2rem;
    font-weight: 600;
    padding: 1.7rem 0 0.6rem 0;
  }

  .limits-manager-filters__specific-user-field {
    margin-bottom: 5rem;
    width: 50%;
  }
</style>
