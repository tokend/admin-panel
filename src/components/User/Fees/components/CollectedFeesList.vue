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
        </div>

        <button
          class="app-list__li"
          v-for="balance in masterBalances"
          :key="balance.id"
          @click="emitOnItemClicked(balance)"
        >
          <span
            class="app-list__cell app-list__cell--important"
            :title="balance.asset.id"
          >
            {{ balance.asset.id }}
          </span>

          <asset-amount-formatter
            class="app-list__cell app-list__cell--right"
            is-titled
            :amount="balance.state.available"
            :asset="balance.asset.id"
          />

          <asset-amount-formatter
            class="app-list__cell app-list__cell--right"
            is-titled
            :amount="balance.state.locked"
            :asset="balance.asset.id"
          />
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
import { AssetAmountFormatter } from '@comcom/formatters'
import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'

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

        this.masterBalances = masterBalances
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
        amount: balance.state.available,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
