import safeGet from 'lodash/get'

export class Movement {
  constructor (record) {
    this.id = record.id

    if (record.operation) {
      this.appliedAt = safeGet(record, 'operation.appliedAt') || record.appliedAt
      this.operationDetails = record.operation
      this.operationType = safeGet(record, 'operation.details.type')
      this.sourceAccount = safeGet(record, 'operation.source.id')
      this.receiverAccount = safeGet(record, 'operation.details.receiverAccount.id')
      this.accountTo = safeGet(record, 'operation.details.accountTo.id')
    }
  }
}
