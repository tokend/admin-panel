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
          v-model.trim="filters.account"
          label="Email or Account ID"
          autocomplete-type="email"
          v-if="filters.scope === SCOPE_TYPES.account"
        />
      </div>
    </div>
    <div class="limits-manager__inner">
      <template
        v-if="filters.scope !== SCOPE_TYPES.account || filters.userAddress"
      >
        <div class="limits-manager__limits-list-wrp">
          <template v-if="limits.payment">
            <div class="limits-manager__limits-list">
              <h3 class="limits-manager__content-title">
                Payment limits
              </h3>
              <limits-update-form
                :limits="limits.payment"
                :account-role="limitsAccountRole"
                :account-id="limitsAccountId"
                @limits-updated="getLimits"
              />
            </div>
          </template>
        </div>
        <div class="limits-manager__limits-list-wrp">
          <template v-if="limits.withdrawal">
            <div class="limits-manager__limits-list">
              <h3 class="limits-manager__content-title">
                Withdrawal limits
              </h3>
              <limits-update-form
                :limits="limits.withdrawal"
                :account-role="limitsAccountRole"
                :account-id="limitsAccountId"
                @limits-updated="getLimits"
              />
            </div>
          </template>
        </div>
        <div class="limits-manager__limits-list-wrp">
          <template v-if="limits.deposit">
            <div class="limits-manager__limits-list">
              <h3 class="limits-manager__content-title">
                Deposit limits
              </h3>
              <limits-update-form
                :limits="limits.deposit"
                :account-role="limitsAccountRole"
                :account-id="limitsAccountId"
                @limits-updated="getLimits"
              />
            </div>
          </template>
        </div>
      </template>
      <template v-else-if="isAddressLoading">
        <div class="limits-manager__message-wrp">
          <p>Loading ...</p>
        </div>
      </template>
      <template v-else-if="!filters.account">
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
import LimitsUpdateForm from './Limits.UpdateForm'

import { base } from '@tokend/js-sdk'
import { STATS_OPERATION_TYPES } from '@/constants'

import { api, loadingDataViaLoop } from '@/api'
import { ErrorHandler } from '@/utils/ErrorHandler'

import config from '@/config'
import { LimitsRecord } from '@/js/records/limits.record'

import get from 'lodash/get'
import throttle from 'lodash/throttle'

// non-xdr values, internal use only
const SCOPE_TYPES = Object.freeze({
  account: 'USER',
  accountRole: 'ACCOUNT_TYPE',
  global: 'GLOBAL',
})

export default {
  components: {
    SelectField,
    InputField,
    LimitsUpdateForm,
  },

  data: _ => ({
    filters: {
      asset: '',
      accountRole: '',
      userAddress: '',
      account: '',
      scope: SCOPE_TYPES.global,
    },

    limits: {
      withdrawal: null,
      payment: null,
      deposit: null,
    },

    assets: [],
    isAddressLoading: false,
    ACCOUNT_ROLES: config.ACCOUNT_ROLES,
    SCOPE_TYPES,
  }),

  computed: {
    limitsAccountRole () {
      return this.filters.scope === SCOPE_TYPES.accountRole
        ? this.filters.accountRole
        : ''
    },

    limitsAccountId () {
      return this.filters.scope === SCOPE_TYPES.account
        ? this.filters.userAddress
        : ''
    },
  },

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
          this.filters.account = ''
          this.filters.userAddress = ''
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

    'filters.account': {
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
      this.filters.account = ''
      if (value !== SCOPE_TYPES.account) {
        this.setFilters()
        this.getLimits()
      }
    },

    'filters.userAddress': function (value) {
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
      const [paymentLimits, withdrawalLimits, depositLimits] =
        await Promise.all([
          this.getLimit(STATS_OPERATION_TYPES.paymentOut),
          this.getLimit(STATS_OPERATION_TYPES.withdraw),
          this.getLimit(STATS_OPERATION_TYPES.deposit),
        ])

      const limitDetails = {
        assetCode: this.filters.asset,
        accountId: this.filters.userAddress,
        accountRole: this.filters.accountRole,
      }

      this.limits.payment = new LimitsRecord(
        paymentLimits,
        {
          statsOpType: STATS_OPERATION_TYPES.paymentOut,
          ...limitDetails,
        }
      )
      this.limits.withdrawal = new LimitsRecord(
        withdrawalLimits,
        {
          statsOpType: STATS_OPERATION_TYPES.withdraw,
          ...limitDetails,
        }
      )
      this.limits.deposit = new LimitsRecord(
        depositLimits,
        {
          statsOpType: STATS_OPERATION_TYPES.deposit,
          ...limitDetails,
        }
      )
    },

    async getLimit (statsOpType) {
      const filters = {}
      if (this.filters.scope === SCOPE_TYPES.account) {
        filters.account = this.filters.userAddress
      } else if (this.filters.scope === SCOPE_TYPES.accountRole) {
        filters.account_role = this.filters.accountRole
      }
      const { data: limits } = await api.getWithSignature('/v3/limits', {
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
    },

    async getAssets () {
      let response = await api.getWithSignature('/v3/assets')
      let assets = await loadingDataViaLoop(response)
      this.assets = assets
    },

    async loadAccountIdByEmail (email) {
      try {
        const { data } = await api.getWithSignature('/identities', {
          filter: { email: email },
          page: { limit: 1 },
        })
        const userEmail = ((data || [])[0] || {}).email || email
        if (userEmail === email) {
          this.filters.userAddress = ((data || [])[0] || {}).address
        } else {
          this.filters.userAddress = ''
        }
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async setFilters () {
      if (!this.filters.asset) this.filters.asset = get(this.assets, '[0].id')
      const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      this.isAddressLoading = true
      if (this.filters.account) {
        if (base.Keypair.isValidPublicKey(this.filters.account)) {
          this.filters.userAddress = this.filters.account
        } else if (emailRegExp.test(this.filters.account)) {
          await this.loadAccountIdByEmail(this.filters.account)
        }
      } else {
        this.filters.userAddress = ''
      }
      this.isAddressLoading = false
    },
  },
}
</script>

<style lang="scss">
@import "~@/assets/scss/colors";

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

.limits-manager__filters {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 5rem;

  &--global {
    justify-content: flex-start;
  }
}
</style>
