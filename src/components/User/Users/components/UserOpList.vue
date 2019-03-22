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

    <div class="app__more-btn-wrp">
      <collection-loader
        :first-page-loader="getList"
        @first-page-load="setList"
        @next-page-load="extendList"
      />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Sdk } from '@/sdk'
import moment from 'moment'
import { formatAssetAmount } from '@/utils/formatters'
import { OperationCounterparty } from '@comcom/getters'
import { CollectionLoader } from '@/components/common'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    OperationCounterparty,
    CollectionLoader
  },
  data () {
    return {
      formatAssetAmount,
      list: [],
      masterPubKey: Vue.params.MASTER_ACCOUNT
    }
  },

  props: ['id'],

  computed: {
    records () {
      if (!this.list) return undefined
      return this.normalizeRecords(this.list)
    }
  },

  methods: {
    async getList () {
      let response = {}
      try {
        response = await Sdk.horizon.account.getOperations(this.id)
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      return response
    },

    setList (data) {
      this.list = data
    },

    async extendList (data) {
      this.list = this.list.concat(data)
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
