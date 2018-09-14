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
        switch (operation.type_i) {
          case OP_TYPES.createIssuanceRequest:
            return operation.participants.find(p => !p.balance_id).account_id
          case OP_TYPES.manageOffer:
            if (operation.orderBookId && operation.orderBookId !== '0') {
              return this.noCounterpartyStr
            }
            const counterparties = operation.participants
            .filter(p => p.account_id !== operation.source_account)
            if (counterparties.length > 1) {
              return this.manyCounterpartyStr
            } else {
              return get(counterparties[0], 'account_id')
            }
          case OP_TYPES.checkSaleState:
            return operation.base_asset
          case OP_TYPES.payment:
            return operation.from
          case OP_TYPES.paymentV2:
            return operation.from
          case OP_TYPES.createWithdrawalRequest:
            return operation.external_details.address
          case OP_TYPES.reviewRequest:
            if (operation.source_account === 'Master') {
              return this.noCounterpartyStr
            }
            return operation.participants.find(p => {
              return p.account_id !== operation.source_account
            }).account_id
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
