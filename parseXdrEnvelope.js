const Operation = require('tokend-js-sdk').Operation
const xdr = require('tokend-js-sdk').xdr

function parseEnvelope (envelope) {
  const buffer = new Buffer(envelope, 'base64')
  const transaction = xdr.TransactionEnvelope.fromXDR(buffer)
  const operations = transaction.tx().operations()
  if (operations.length === 1) return Operation.operationToObject(operations[0])
  return operations.map(operation => Operation.operationToObject(operation)) // .operationToObject(operations)
}

console.log(parseEnvelope(global.process.argv[2]))
