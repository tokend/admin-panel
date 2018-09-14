<template>
  <div class="operation-view">
    <div class="operation-view__row" v-for="details in operationInfo">
      <p class="operation-view__label secondary">{{ details.label }}</p>
      <p class="operation-view__value capitalized">{{ details.value }}</p>
    </div>
    <template v-if="OP_TYPES.paymentV2 === operation.type_i">
      <div class="operation-view__row">
        <p class="operation-view__label secondary">Recipient(email)</p>
        <p class="operation-view__value capitalized">
          <email-getter :address="operation.to"/>
        </p>
      </div>
    </template>
    <template v-if="operation.amount">
      <div class="operation-view__row">
        <p class="operation-view__label secondary">Converted value</p>
        <p class="operation-view__value capitalized">
          <convert-asset-pairs :amount="operation.amount" :source-asset="operation.asset || ''"/>
        </p>
      </div>
    </template>
    <div class="operation-view__row">
      <p class="operation-view__label secondary">Source(email)</p>
      <p class="operation-view__value capitalized">
        <email-getter :address="operation.source_account"/>
      </p>
    </div>
  </div>
</template>

<script>
  import { OP_TYPES, getAccountTypeLocalizer } from '@/constants'
  import { formatAssetAmount } from '@/utils/formatters'
  import { EmailGetter, ConvertAssetPairs } from '@comcom/getters'

  export default {
    name: 'operation-view',
    props: ['operation', 'user-id'],
    components: {
      EmailGetter,
      ConvertAssetPairs
    },
    data () {
      return {
        OP_TYPES,
        operationInfo: []
      }
    },
    methods: {
      parseDefaultOperationInfo (operation) {
        this.operationInfo.push({
          label: 'Type',
          value: operation.type
        })
        this.operationInfo.push({
          label: 'ID',
          value: operation.id
        })
        this.operationInfo.push({
          label: 'Date',
          value: operation.ledger_close_time
        })
        this.operationInfo.push({
          label: 'Source',
          value: operation.source_account
        })
      },
      parseCreateIssuanceRequestOperation (operation) {
        this.operationInfo.push({
          label: 'Transaction ID',
          value: operation.transaction_id
        })
        this.operationInfo.push({
          label: 'Value',
          value: formatAssetAmount(operation.amount, operation.asset)
        })
        this.operationInfo.push({
          label: 'Deposit address',
          value: this.getDepositAddress(operation.participants)
        })
        this.operationInfo.push({
          label: 'Reference',
          value: operation.reference
        })
        this.operationInfo.push({
          label: 'Transaction state',
          value: operation.state
        })
      },
      parseCreateWithdrawalRequestOperation (operation) {
        this.operationInfo.push({
          label: 'Transaction ID',
          value: operation.transaction_id
        })
        this.operationInfo.push({
          label: 'Value',
          value: formatAssetAmount(operation.amount, operation.asset)
        })
        this.operationInfo.push({
          label: 'Fixed fee',
          value: formatAssetAmount(operation.fee_fixed, operation.asset)
        })
        this.operationInfo.push({
          label: 'Percent fee',
          value: formatAssetAmount(operation.percent, '%')
        })
      },
      parsePaymentOperation (operation) {
        this.operationInfo.push({
          label: 'Transaction ID',
          value: operation.transaction_id
        })
        this.operationInfo.push({
          label: 'Transaction type',
          value: this.getTransactionType(operation)
        })
        this.operationInfo.push({
          label: 'Value',
          value: formatAssetAmount(operation.amount, operation.asset)
        })
        this.operationInfo.push({
          label: 'Fixed fee',
          value: formatAssetAmount(operation.fee_fixed, operation.asset)
        })
        this.operationInfo.push({
          label: 'Percent fee',
          value: formatAssetAmount(operation.percent, '%')
        })
        this.operationInfo.push({
          label: 'Transaction state',
          value: operation.state
        })
        this.operationInfo.push({
          label: 'Recipient address',
          value: operation.to
        })
      },
      parseSetOption (operation) {
        this.operationInfo.push({
          label: 'Operation state',
          value: operation.state
        })
        if (operation.master_weight) {
          this.operationInfo.push({
            label: 'Remove master',
            value: operation.master_weight
          })
        } else {
          this.operationInfo.push({
            label: 'Signer key',
            value: operation.signer_key
          })
          this.operationInfo.push({
            label: 'Signer weight',
            value: operation.signer_weight
          })
          this.operationInfo.push({
            label: 'Signer type',
            value: operation.signer_type
          })
        }
      },
      parseManageBalanceOption (operation) {
        this.operationInfo.push({
          label: 'Operation state',
          value: operation.state
        })
      },
      parseCreateAccountOption (operation) {
        this.operationInfo.push({
          label: 'Operation state',
          value: getAccountTypeLocalizer(operation.account_type)
        })
      },
      getOperationInfo (operation) {
        switch (operation.type_i) {
          case OP_TYPES.createIssuanceRequest:
            return this.parseCreateIssuanceRequestOperation(operation)
          case OP_TYPES.createWithdrawalRequest:
            return this.parseCreateWithdrawalRequestOperation(operation)
          case OP_TYPES.paymentV2:
            return this.parsePaymentOperation(operation)
          case OP_TYPES.payment:
            return this.parsePaymentOperation(operation)
          case OP_TYPES.setOption:
            return this.parseSetOption(operation)
          case OP_TYPES.manageBalance:
            return this.parseManageBalanceOption(operation)
          case OP_TYPES.createAccount:
            return this.parseCreateAccountOption(operation)
        }
      },
      getDepositAddress (participants) {
        return participants.find(participant => {
          return participant.account_id !== this.$store.getters.masterId
        }).account_id
      },
      getTransactionType (operation) {
        return operation.from === operation.source_account ? 'Outcoming' : 'Incoming'
      }
    },
    computed: {},
    created () {
      this.parseDefaultOperationInfo(this.operation)
      this.getOperationInfo(this.operation)
    }
  }
</script>

<style lang="scss" scoped>
  .operation-view__row {
    display: flex;
    & + & {
      margin-top: 0.5rem;
    }
  }

  .operation-view__label {
    text-align: right;
    padding-right: 2rem;
    width: 20rem;
    min-width: 20rem;
  }

  .operation-view__value {
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
