<template>
  <div class="collected-fees-list">
    <h2>{{ "collected-fees-list.header" | globalize }}</h2>
    <div class="app-list">
      <template v-if="masterBalances && masterBalances.length">
        <div class="app-list__header">
          <span class="app-list__cell app-list__cell--important">
            {{ "collected-fees-list.asset" | globalize }}
          </span>
          <span class="app-list__cell app-list__cell--right">
            {{ "collected-fees-list.available" | globalize }}
          </span>
          <span class="app-list__cell app-list__cell--right">
            {{ "collected-fees-list.locked" | globalize }}
          </span>
          <span class="app-list__cell app-list__cell--right">
            {{ "collected-fees-list.withdrawable" | globalize }}
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

          <span
            class="app-list__cell app-list__cell--right"
            :title="balanceAvailable(balance) | formatMoney"
          >
            {{ balanceAvailable(balance) | formatMoney }}
          </span>
          <span
            class="app-list__cell app-list__cell--right"
            :title="balanceLocked(balance) | formatMoney"
          >
            {{ balanceLocked(balance) | formatMoney }}
          </span>

          <span class="app-list__cell app-list__cell--right">
            <template>
              {{ isAssetWithdrawable(balance.assetCode) | yesNoFilter }}
            </template>
          </span>
        </button>
      </template>

      <template v-else>
        <div class="app-list__li-like">
          <template v-if="isLoading">
            <p>
              {{ "collected-fees-list.loading" | globalize }}
            </p>
          </template>

          <template v-else-if="isFailed">
            <p class="danger">
              {{ "collected-fees-list.error" | globalize }}
            </p>
          </template>

          <template v-else>
            <p>
              {{ "collected-fees-list.fail-load" | globalize }}
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

import { api } from '@/api'
import { ErrorHandler } from '@/utils/ErrorHandler'

import { Balance } from '@/store/wrappers/balance'

const EVENTS = {
  onItemClicked: 'on-item-clicked',
}

export default {
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
        const { data: { balances: masterBalances } } = await api
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

    balanceAvailable (balance) {
      return {
        value: balance.available,
        currency: balance.assetCode,
      }
    },

    balanceLocked (balance) {
      return {
        value: balance.locked,
        currency: balance.assetCode,
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
