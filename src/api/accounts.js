import { Sdk } from '@/sdk'

export default {

  async manageSigner (params) {
    const signer = {
      pubKey: params.accountId.trim(),
      weight: +params.weight,
      signerType: +params.signerType,
      identity: +params.signerIdentity
    }
    if (params.name) signer.name = params.name

    const operation = Sdk.base.SetOptionsBuilder.setOptions({
      signer
    })
    const response = await Sdk.horizon.transactions.submitOperations(operation)
    return response.data
  },

  async manageMaster (weight) {
    const operation = Sdk.base.SetOptionsBuilder.setOptions({
      masterWeight: Number(weight)
    })
    const response = await Sdk.horizon.transactions.submitOperations(operation)
    return response.data
  }
}
