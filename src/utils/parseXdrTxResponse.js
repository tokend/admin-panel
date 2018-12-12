import { Sdk } from '@/sdk'
export function parseXdrTxResponse (txResponse) {
  const buffer = new Buffer(txResponse.data.resultXdr, 'base64')
  const transaction = Sdk.xdr.TransactionResult.fromXDR(buffer)
  return transaction.result().results()
}

export function deriveRequestIdFromCreateKycRequestResult (txResponse, opIndex = 0) {
  const response = parseXdrTxResponse(txResponse)
  console.log(response)
  return response[opIndex]
    .tr()
    .createUpdateKycRequestResult()
    .value()
    .requestId()
    .toString()
}
