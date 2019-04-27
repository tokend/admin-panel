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

      <router-link
        class="app-list__li"
        v-for="item in records"
        :key="item.id"
        :to="{ name: 'users.operationDetails',
          params: { operation: item, operationId: item.id }
        }"
      >
        <span
          class="app-list__cell"
          :title="item.operationType"
        >
          {{ item.operationType }}
        </span>
        <span
          class="app-list__cell"
          :title="item.ledgerCloseTime"
        >
          {{ item.ledgerCloseTime }}
        </span>
        <span
          class="app-list__cell"
          :title="item.sourceAccount"
        >
          {{ item.sourceAccount }}
        </span>
        <span class="app-list__cell">
          <operation-counterparty :operation="item" />
        </span>
      </router-link>
    </ul>

    <template v-else>
      <ul class="app-list">
        <li class="app-list__li-like">
          {{ isPending ? 'Loading...' : 'Nothing here yet' }}
        </li>
      </ul>
    </template>

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
import moment from 'moment'
import get from 'lodash/get'
import { formatAssetAmount } from '@/utils/formatters'
import { OperationCounterparty } from '@comcom/getters'
import { CollectionLoader } from '@/components/common'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { ApiCallerFactory } from '@/api-caller-factory'
import { clearObject } from '@/utils/clearObject'

export default {
  components: {
    OperationCounterparty,
    CollectionLoader
  },
  data () {
    return {
      formatAssetAmount,
      list: [],
      masterPubKey: Vue.params.MASTER_ACCOUNT,
      isLoading: false
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
      this.isLoading = true
      let response = {}
      try {
        response = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/v3/history', {
            page: { order: 'desc' },
            filter: clearObject({
              account: this.id
            }),
            include: ['operation.details']
          })
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      this.isLoading = false
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
        const operationType = item.operation.details.type.replace(/operations-/g, '').split('-').join(' ')
        return Object.assign({}, item, {
          // Capitalize and remove dashes
          operationType: operationType.charAt(0).toUpperCase() + operationType.slice(1),
          ledgerCloseTime: moment(item.operation.appliedAt).format('DD MMM YYYY [at] hh:mm:ss'),
          sourceAccount: item.operation.source.id === this.masterPubKey ? 'Master' : item.operation.source.id,
          receiverAccount: get(item, 'operation.details.receiverAccount.id'),
          accountTo: get(item, 'operation.details.accountTo.id')
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
</style>
