import { ManageLimitsBuilder } from 'tokend-js-sdk'

import { ServerCallBuilder } from './ServerCallBuilder'
import { envelopOperations } from './helpers/envelopOperations'

const ScopedServerCallBuilder = ServerCallBuilder.makeScope()
  .registerResource('limits')
  .registerResource('transactions')

export default {
  update (params) {
    const tx = envelopOperations(
      ManageLimitsBuilder.createLimits(params)
    )

    return new ScopedServerCallBuilder()
      .transactions()
      .post({ tx })
  }
}
