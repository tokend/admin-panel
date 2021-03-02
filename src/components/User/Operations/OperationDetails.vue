<template>
  <div v-if="operation.id">
    <div class="operation-details">
      <div class="app__block">
        <h2>{{ "operation-details.header" | globalize }}</h2>
        <details-reader :details="operation" />
      </div>
    </div>
  </div>
</template>

<script>
import DetailsReader from '@comcom/details/DetailsReader'
import { globalize } from '@/components/App/filters/filters'
// ToDo: get operation by operationId from server
import moment from 'moment'
import get from 'lodash/get'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { api } from '@/api'

export default {
  components: {
    DetailsReader,
  },
  props: {
    operationId: { type: String, required: true },
  },
  data: _ => ({
    userId: null,
    operation: {},
  }),
  async created () {
    this.userId = this.$route.params.id
    await this.getOperations(this.operationId)
  },
  methods: {
    async getOperations (operationId) {
      let operation = {}
      try {
        const endpoint = `/v3/history/${operationId}`
        const response = await api.getWithSignature(endpoint, {
          include: ['operation.details'],
        })
        operation = response.data
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      const operationType = operation.operation.details.type
        .replace(/operations-/g, '')
        .split('-')
        .join(' ')
      this.operation = Object.assign({}, operation, {
        operationType: operationType
          .charAt(0).toUpperCase() + operationType.slice(1),
        ledgerCloseTime: moment(operation.operation.appliedAt)
          .format('DD MMM YYYY [at] hh:mm:ss'),
        sourceAccount: operation.operation.source.id === this.masterPubKey
          ? globalize('operation-details.master') : operation.operation.source.id,
        receiverAccount: get(operation, 'operation.details.receiverAccount.id'),
        accountTo: get(operation, 'operation.details.accountTo.id'),
      })
    },
  },
}
</script>
