import { Sdk } from '@/sdk'

function parseEnvelope (envelope) {
  const buffer = new Buffer(envelope, 'base64')
  const transaction = Sdk.xdr.TransactionEnvelope.fromXDR(buffer)
  const operations = transaction.tx().operations()
  if (operations.length === 1) return Sdk.base.Operation.operationToObject(operations[0])
  return operations.map(operation => Sdk.base.Operation.operationToObject(operation)) // .operationToObject(operations)
}

console.log(parseEnvelope(global.process.argv[2]))
