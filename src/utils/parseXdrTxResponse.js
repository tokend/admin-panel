import { base } from '@tokend/js-sdk'

export function parseXdrTxResponse (txResponse) {
  const buffer = Buffer.from(txResponse.data.resultXdr, 'base64')
  const transaction = base.xdr.TransactionResult.fromXDR(buffer)
  return transaction.result().results()
}

export function deriveRequestIdFromKycRequestResult (txResponse, opIndex = 0) {
  const response = parseXdrTxResponse(txResponse)
  return response[opIndex]
    .tr()
    .createUpdateKycRequestResult()
    .value()
    .requestId()
    .toString()
}
