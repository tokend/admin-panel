<template>
  <div>
    <div class="operation-details">
      <div class="app__block">
        <h2>Operation details</h2>
        <div class="operation-details__op-details-wrp">
          <details-reader :details="operation" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DetailsReader from '../../common/details/DetailsReader'

// ToDo: get operation by operationId from server
import moment from 'moment'
import get from 'lodash/get'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { ApiCallerFactory } from '@/api-caller-factory'
import { clearObject } from '@/utils/clearObject'

export default {
  components: {
    DetailsReader
  },
  props: {
    operationId: { type: String, required: true }
  },
  data: _ => ({
    userId: null,
    operation: {}
  }),
  async created () {
    window.scroll(0, 0)
    this.userId = this.$route.params.id
    await this.getOperations(this.operationId)
  },
  methods: {
    async getOperations (operationId) {
      let response = {}
      try {
        response = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature('/v3/history', {
            page: { order: 'desc' },
            filter: clearObject({
              account: this.userId
            }),
            include: ['operation.details']
          })
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      response.data.filter(item => {
        if (item.id === this.operationId) {
          const operationType = item.operation.details.type
            .replace(/operations-/g, '')
            .split('-')
            .join(' ')
          this.operation = Object.assign({}, item, {
            operationType: operationType.charAt(0).toUpperCase() + operationType.slice(1),
            ledgerCloseTime: moment(item.operation.appliedAt).format('DD MMM YYYY [at] hh:mm:ss'),
            sourceAccount: item.operation.source.id === this.masterPubKey ? 'Master' : item.operation.source.id,
            receiverAccount: get(item, 'operation.details.receiverAccount.id'),
            accountTo: get(item, 'operation.details.accountTo.id')
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
</style>
