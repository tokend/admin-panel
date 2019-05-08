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

      <button
        class="app-list__li"
        v-for="item in records"
        :key="item.id"
        @click="$emit('op-select', item)">
        <span class="app-list__cell" :title="item.operationType">
          {{ getOperationType(item) }}
        </span>
        <span class="app-list__cell" :title="item.appliedAt">
          {{ item.appliedAt }}
        </span>
        <span class="app-list__cell" :title="item.sourceAccount">
          {{ item.sourceAccount }}
        </span>
        <span class="app-list__cell">
          <operation-counterparty :operation="item" />
        </span>
      </button>
    </ul>

    <template v-else>
      <ul class="app-list">
        <li class="app-list__li-like">
          {{ isLoading ? 'Loading...' : 'Nothing here yet' }}
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

import safeGet from 'lodash/get'

import { OperationCounterparty } from '@comcom/getters'
import { CollectionLoader } from '@/components/common'

import { ApiCallerFactory } from '@/api-caller-factory'

import { formatAssetAmount } from '@/utils/formatters'
import { clearObject } from '@/utils/clearObject'
import { ErrorHandler } from '@/utils/ErrorHandler'

import config from '@/config'

export default {
  components: {
    OperationCounterparty,
    CollectionLoader,
  },

  props: {
    id: { type: String, required: true },
  },

  data () {
    return {
      formatAssetAmount,
      list: [],
      masterPubKey: Vue.params.MASTER_ACCOUNT,
      isLoading: false,
    }
  },

  computed: {
    records () {
      if (!this.list) return undefined
      return this.normalizeRecords(this.list)
    },
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
              account: this.id,
            }),
            include: ['operation.details'],
          })
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      this.isLoading = false
      return response
    },

    getOperationType (record) {
      switch (record.operationType) {
        case 'Create change role request':
          return this.getChangeRoleOperationType(record)
        default:
          return record.operationType
      }
    },

    getChangeRoleOperationType (record) {
      const roleToSet = safeGet(
        record, 'operation.details.roleToSet.id'
      )
      const isBlocked = Number(roleToSet) === config.ACCOUNT_ROLES.blocked
      const isReset = Boolean(safeGet(
        record, 'operation.details.creatorDetails.resetReason'
      ))

      // Currently the only non-blocking and non-resetting change role performed
      // by the admin is unblocking. A small workaround of detecting Unblocked
      // state, in the future replace to more robust solution if needed.
      const isUnblocked =
        !isBlocked && !isReset &&
        safeGet(record, 'operation.source.id', '') === this.masterPubKey

      let operationType
      if (isBlocked) {
        operationType = 'Block'
      } else if (isReset) {
        operationType = 'Reset to unverified'
      } else if (isUnblocked) {
        operationType = 'Unblock'
      } else {
        operationType = 'Change role request'
      }

      return operationType
    },

    setList (data) {
      this.list = data
    },

    async extendList (data) {
      this.list = this.list.concat(data)
    },

    normalizeRecords (records) {
      return records.map((item) => {
        const operationType = item.operation.details.type
          .replace(/operations-/g, '').split('-').join(' ')

        return Object.assign({}, item, {
          // Capitalize and remove dashes
          operationType: operationType.charAt(0).toUpperCase() +
            operationType.slice(1),
          appliedAt: moment(item.operation.appliedAt).format('DD MMM YYYY [at] hh:mm:ss'),
          sourceAccount: item.operation.source.id === this.masterPubKey ? 'Master' : item.operation.source.id,
          receiverAccount: safeGet(item, 'operation.details.receiverAccount.id'),
          accountTo: safeGet(item, 'operation.details.accountTo.id'),
        })
      })
    },
  },
}
</script>
