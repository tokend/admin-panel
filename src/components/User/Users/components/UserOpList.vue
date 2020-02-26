<template>
  <div class="user-op-list">
    <h2>
      {{ "user-op-list.header" | globalize }}
    </h2>

    <ul
      class="app-list"
      v-if="list.length"
    >
      <div class="app-list__header">
        <span class="app-list__cell">
          {{ "user-op-list.type" | globalize }}
        </span>

        <span class="app-list__cell">
          {{ "user-op-list.date" | globalize }}
        </span>

        <span class="app-list__cell">
          {{ "user-op-list.source" | globalize }}
        </span>

        <span class="app-list__cell">
          {{ "user-op-list.counterparty" | globalize }}
        </span>
      </div>

      <router-link
        class="app-list__li"
        v-for="item in list"
        :key="item.id"
        :to="{
          name: 'users.operationDetails',
          params: { operationId: item.id }
        }"
      >
        <span
          class="app-list__cell"
          :title="item.operationType"
        >
          {{ getOperationType(item) }}
        </span>
        <span
          class="app-list__cell"
          :title="item.appliedAt"
        >
          {{ item.appliedAt | formatDateDMYT }}
        </span>
        <span
          class="app-list__cell"
          :title="item.sourceAccount"
        >
          <template v-if="masterPubKey === item.sourceAccount">
            {{ 'user-op-list.master' | globalize }}
          </template>
          <template v-else>
            {{ item.sourceAccount }}
          </template>
        </span>
        <span class="app-list__cell">
          <operation-counterparty :operation="item" />
        </span>
      </router-link>
    </ul>

    <template v-else>
      <ul class="app-list">
        <li class="app-list__li-like" v-if="isLoading">
          {{ "user-op-list.loading" | globalize }}
        </li>
        <li class="app-list__li-like" v-else>
          {{ "user-op-list.nothing-here-yet" | globalize }}
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

import safeGet from 'lodash/get'

import { OperationCounterparty } from '@comcom/getters'
import { CollectionLoader } from '@/components/common'

import { Movement } from '@/js/records/movement.record'

import { api } from '@/api'

import { clearObject } from '@/utils/clearObject'
import { ErrorHandler } from '@/utils/ErrorHandler'

import { mapGetters } from 'vuex'
import { globalize } from '@/components/App/filters/filters'
import { globalizeOperationType } from '@/components/App/filters/globalizeOperationType'

import { OPERATION_DETAILS_TYPES } from '@/constants'

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
      list: [],
      masterPubKey: Vue.params.MASTER_ACCOUNT,
      isLoading: false,
    }
  },

  computed: {
    ...mapGetters([
      'kvEntryBlockedRoleId',
    ]),
  },

  methods: {
    async getList () {
      this.isLoading = true
      let response = {}
      try {
        response = await api.getWithSignature('/v3/history', {
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
      if (
        record.operationType === OPERATION_DETAILS_TYPES.createChangeRoleRequest
      ) {
        return this.getChangeRoleOperationType(record)
      } else {
        return globalizeOperationType(record.operationType)
      }
    },

    getChangeRoleOperationType (record) {
      const roleToSet = safeGet(
        record, 'operation.details.roleToSet.id'
      )
      const isBlocked = Number(roleToSet) === this.kvEntryBlockedRoleId
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
        operationType = globalize('user-op-list.block')
      } else if (isReset) {
        operationType = globalize('user-op-list-reset-to-unverified')
      } else if (isUnblocked) {
        operationType = globalize('user-op-list.unblock')
      } else {
        operationType = globalize('user-op-list.change-role-request')
      }

      return operationType
    },

    setList (data) {
      this.list = data.map(item => new Movement(item))
    },

    async extendList (data) {
      this.list = this.list.concat(
        data.map(item => new Movement(item))
      )
    },
  },
}
</script>
