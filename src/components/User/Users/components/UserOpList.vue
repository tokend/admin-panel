<template>
  <div class="user-op-list">
    <h2>
      Operations
    </h2>

    <ul class="app-list">
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
          {{item.ledger_close_time}}
        </span>
        <span class="app-list__cell" :title="item.source_account">
          {{item.source_account}}
        </span>
        <span class="app-list__cell">
          <operation-counterparty :operation="item" />
        </span>
      </button>
    </ul>

    <div class="app__more-btn-wrp">
      <button class="app__btn-secondary" v-if="!isListEnded && records" @click="getNextPage">
        More
      </button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import api from '@/api'
import moment from 'moment'
import { formatAssetAmount } from '@/utils/formatters'
import { OperationCounterparty } from '@comcom/getters'

export default {
  components: {
    OperationCounterparty
  },
  data () {
    return {
      formatAssetAmount,
      list: undefined,
      isListEnded: false,
      masterPubKey: Vue.params.MASTER_ACCOUNT
    }
  },

  props: ['id'],

  computed: {
    records () {
      if (!this.list) return undefined
      return this.normalizeRecords(this.list.records)
    }
  },

  created () {
    this.getList()
  },

  methods: {
    async getList () {
      try {
        this.list = await api.transactions.getOperationsByAccountId(this.id)
      } catch (error) {
        this.$store.dispatch('SET_ERROR', 'Cannot load transaction list')
      }
    },

    async getNextPage () {
      return this.list.next(this.$store.getters.keypair).then((response) => {
        if (response.records.length > 0) {
          this.list.records = this.list.records.concat(response.records)
          this.list.prev = response.prev
          this.list.next = response.next
          return
        }
        if (response.records.length < this.$store.getters.pageLimit) {
          this.isListEnded = true
        }
      }).catch((err) => {
        console.error(err)
        this.isListEnded = true
      })
    },

    normalizeRecords (records) {
      return records.map((item) => {
        return Object.assign({}, item, {
          // Capitalize and remove underscores
          type: item.type.charAt(0).toUpperCase() + item.type.split('_').join(' ').slice(1),

          ledger_close_time: moment(item.ledger_close_time).format('DD MMM YYYY [at] hh:mm:ss'),
          source_account: item.source_account === this.masterPubKey ? 'Master' : item.source_account
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
</style>
