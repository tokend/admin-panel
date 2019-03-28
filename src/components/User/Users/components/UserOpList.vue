<template>
  <div class="user-op-list">
    <h2>
      Operations
    </h2>

    <ul
      class="app-list"
      v-if="records && records.length"
    >
      <div class="app-list__header">
        <span class="app-list__cell">
          Type
        </span>

        <span class="app-list__cell">
          Date
        </span>

        <span class="app-list__cell">
          Source
        </span>

        <span class="app-list__cell">
          Counterparty
        </span>
      </div>

      <button class="app-list__li" v-for="item in records" :key="item.id" @click="$emit('op-select', item)">
        <span class="app-list__cell" :title="item.type">
          {{item.type}}
        </span>
        <span class="app-list__cell" :title="item.ledger_close_time">
          {{item.ledgerCloseTime}}
        </span>
        <span class="app-list__cell" :title="item.source_account">
          {{item.sourceAccount}}
        </span>
        <span class="app-list__cell">
          <operation-counterparty :operation="item" />
        </span>
      </button>
    </ul>

    <template v-else>
      <div class="app-list__li-like">
        <template v-if="isLoading">
          <p>
            Loading...
          </p>
        </template>

        <template v-else>
          <p>
            Nothing here yet
          </p>
        </template>
      </div>
    </template>

    <div class="app__more-btn-wrp">
      <button class="app__btn-secondary" v-if="!isListEnded && records" @click="getNextPage">
        More
      </button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Sdk } from '@/sdk'
import moment from 'moment'
import { formatAssetAmount } from '@/utils/formatters'
import { OperationCounterparty } from '@comcom/getters'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    OperationCounterparty
  },
  data () {
    return {
      formatAssetAmount,
      list: undefined,
      isListEnded: false,
      masterPubKey: Vue.params.MASTER_ACCOUNT,
      isLoading: false
    }
  },

  props: ['id'],

  computed: {
    records () {
      if (!this.list) return undefined
      return this.normalizeRecords(this.list.data)
    }
  },

  created () {
    this.getList()
  },

  methods: {
    async getList () {
      this.isLoading = true
      try {
        this.list = (await Sdk.horizon.account.getOperations(this.id))
      } catch (error) {
        this.$store.dispatch('SET_ERROR', 'Cannot load transaction list')
      }
      this.isLoading = false
    },

    async getNextPage () {
      try {
        const oldLength = this.list.data.length
        const chunk = await this.list.fetchNext()
        this.list._data = this.list.data.concat(chunk.data)
        this.list.fetchNext = chunk.fetchNext
        this.isListEnded = oldLength === this.list.data.length
      } catch (error) {
        ErrorHandler.process(error)
      }
    },

    normalizeRecords (records) {
      return records.map((item) => {
        return Object.assign({}, item, {
          // Capitalize and remove underscores
          type: item.type.charAt(0).toUpperCase() + item.type.split('_').join(' ').slice(1),

          ledgerCloseTime: moment(item.ledgerCloseTime).format('DD MMM YYYY [at] hh:mm:ss'),
          sourceAccount: item.sourceAccount === this.masterPubKey ? 'Master' : item.sourceAccount
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
</style>
