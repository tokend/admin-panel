import { OpErrorCodes, TxErrorCodes } from './errorCodes'
// import
export default {
  tryParseError (err) {
    if (err.response.data.status !== 400) return false
    try {
      if (err.response.data.extras &&
        err.response.data.extras.result_codes &&
        err.response.data.extras.result_codes.transaction) {
        const stellarError = findStellarError(err)
        return stellarError || false
      } else {
        const details = err.response.data.detail
        if (details && typeof details === 'string' && details === 'You can not add an admin operation, the same already exists') {
          return details
        } else {
          return false
        }
      }
    } catch (e) {
      console.error(e)
      return false
    }
  }
}

function findStellarError (error) {
  const errorTxCode = error.response.data.extras.result_codes.transaction
  const errorOpCode = error.response.data.extras.result_codes.operations && error.response.data.extras.result_codes.operations[0]

  if (OpErrorCodes.has(errorOpCode)) {
    return OpErrorCodes.get(errorOpCode)
  } else if (TxErrorCodes.has(errorTxCode)) {
    return TxErrorCodes.get(errorTxCode)
  }

  return false
}
