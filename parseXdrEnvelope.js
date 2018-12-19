const Sdk = require('@tokend/js-sdk').base

function parseEnvelope (envelope) {
  console.log('parseEnvelopeparseEnvelopeparseEnvelopeparseEnvelope')
  const buffer = new Buffer(envelope, 'base64')
  const transaction = Sdk.xdr.TransactionEnvelope.fromXDR(buffer)
  const operations = transaction.tx().operations()
  if (operations.length === 1) return Sdk.Operation.operationToObject(operations[0])
  return operations.map(operation => Sdk.Operation.operationToObject(operation)) // .operationToObject(operations)
}

console.log(parseEnvelope(global.process.argv[2]))
