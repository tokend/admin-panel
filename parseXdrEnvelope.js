const base = require('@tokend/js-sdk').base

function parseEnvelope (envelope) {
  const buffer = Buffer.from(envelope, 'base64')
  const transaction = base.xdr.TransactionEnvelope.fromXDR(buffer)
  const operations = transaction.tx().operations()

  if (operations.length === 1) {
    return base.Operation.operationToObject(operations[0])
  }

  return operations
    .map(operation => base.Operation.operationToObject(operation))
}

// eslint-disable-next-line no-console
console.log(parseEnvelope(global.process.argv[2]))
