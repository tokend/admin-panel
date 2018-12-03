import { ServerCallBuilder } from './ServerCallBuilder'
import { ManageKeyValueBuilder } from 'tokend-js-sdk'
import { envelopOperations } from './helpers/envelopOperations'

const ScopedServerCallBuilder = ServerCallBuilder.makeScope()
  .registerResource('key_value')
  .registerResource('transactions')

export default {
  getList () {
    return new ScopedServerCallBuilder()
      .key_value()
      .sign()
      .get()
  },

  /**
   * @param opts
   * @param opts.key
   * @param opts.value
   */
  setNew (opts) {
    const tx = envelopOperations(
      ManageKeyValueBuilder.putKeyValue(opts)
    )

    return new ScopedServerCallBuilder()
      .transactions()
      .post({ tx })
  }
}
