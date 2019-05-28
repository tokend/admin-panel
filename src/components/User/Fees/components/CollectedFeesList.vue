<template>
  <div class="collected-fees-list">
    <h2>Balances</h2>
    <div class="app-list">
      <template v-if="masterBalances && masterBalances.length">
        <div class="app-list__header">
          <span class="app-list__cell app-list__cell--important">
            Asset
          </span>
          <span class="app-list__cell app-list__cell--right">
            Available
          </span>
          <span class="app-list__cell app-list__cell--right">
            Locked
          </span>
          <span class="app-list__cell app-list__cell--right">
            Withdrawable
          </span>
        </div>

        <button
          class="app-list__li"
          v-for="balance in masterBalances"
          :key="balance.id"
          @click="emitOnItemClicked(balance)"
        >
          <span
            class="app-list__cell app-list__cell--important"
            :title="balance.assetCode"
          >
            {{ balance.assetCode }}
          </span>

          <asset-amount-formatter
            class="app-list__cell app-list__cell--right"
            is-titled
            :amount="balance.available"
            :asset="balance.assetCode"
          />

          <asset-amount-formatter
            class="app-list__cell app-list__cell--right"
            is-titled
            :amount="balance.locked"
            :asset="balance.assetCode"
          />

          <span class="app-list__cell app-list__cell--right">
            <template v-if="isAssetWithdrawable(balance.assetCode)">
              Yes
            </template>
            <template v-else>
              No
            </template>
          </span>
        </button>
      </template>

      <template v-else>
        <div class="app-list__li-like">
          <template v-if="isLoading">
            <p>
              Loading...
            </p>
          </template>

          <template v-else-if="isFailed">
            <p class="danger">
              An error occurred. Please try again later
            </p>
          </template>

          <template v-else>
            <p>
              Nothing here yet
            </p>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'

import { AssetAmountFormatter } from '@comcom/formatters'

import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'

import { Balance } from '@/store/wrappers/balance'

const EVENTS = {
  onItemClicked: 'on-item-clicked',
}

export default {
  components: {
    AssetAmountFormatter,
  },

  data () {
    return {
      isLoading: false,
      isFailed: false,
      masterBalances: [],
    }
  },

  computed: {
    ...mapGetters({
      assetByCode: 'assetByCode',
    }),
  },

  created () {
    this.loadList()
  },

  methods: {
    async loadList () {
      this.isLoading = true
      this.isFailed = false
      try {
        const { data: { balances: masterBalances } } = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature(`/v3/accounts/${Vue.params.MASTER_ACCOUNT}`, {
            include: ['balances.state'],
          })

        this.masterBalances = masterBalances.map(b => new Balance(b))
      } catch (err) {
        ErrorHandler.processWithoutFeedback(err)
        this.isFailed = true
        this.masterBalances = []
      }
      this.isLoading = false
    },

    emitOnItemClicked (balance) {
      this.$emit(EVENTS.onItemClicked, {
        balanceId: balance.id,
        amount: balance.available,
      })
    },

    isAssetWithdrawable (assetCode) {
      const asset = this.assetByCode(assetCode)
      return asset && asset.isWithdrawable
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
