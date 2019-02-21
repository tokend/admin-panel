<template>
  <div class="operation-counterparty">
    {{ counterparty }}
  </div>
</template>
<script>
  import { OP_TYPES } from '@/constants'
  import get from 'lodash/get'

  export default {
    props: ['operation'],
    data: _ => ({
      counterparty: 'counterparty',
      noCounterpartyStr: '-',
      manyCounterpartyStr: 'many'
    }),
    methods: {
      getCounterparty (operation) {
        switch (operation.typeI) {
          case OP_TYPES.createIssuanceRequest:
            return operation.participants.find(p => !p.balanceId).accountId
          case OP_TYPES.manageOffer:
            if (operation.orderBookId && operation.orderBookId !== '0') {
              return this.noCounterpartyStr
            }
            const counterparties = operation.participants
            .filter(p => p.accountId !== operation.sourceAccount)
            if (counterparties.length > 1) {
              return this.manyCounterpartyStr
            } else {
              return get(counterparties[0], 'accountId')
            }
          case OP_TYPES.checkSaleState:
            return operation.baseAsset
          case OP_TYPES.payment:
            return operation.from
          case OP_TYPES.paymentV2:
            return operation.from
          case OP_TYPES.createWithdrawalRequest:
            return operation.creatorDetails.address
          case OP_TYPES.reviewRequest:
            if (operation.sourceAccount === 'Master') {
              return this.noCounterpartyStr
            }
            return operation.participants.find(p => {
              return p.accountId !== operation.sourceAccount
            }).accountId
          default:
            return this.noCounterpartyStr
        }
      }
    },
    created () {
      this.counterparty = this.getCounterparty(this.operation)
    }
  }
</script>
<style scoped lang="scss">
  .operation-counterparty {
    width: 100%;
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
</style>
