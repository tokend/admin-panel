import { Account, TransactionBuilder } from 'tokend-js-sdk'
import config from '@/config'
import store from '@/store'

export function envelopOperations (...operations) {
  if (!(operations && operations.length)) {
    throw new Error('envelopOperations: "operations" param is required')
  }

  const source = new Account(config.MASTER_ACCOUNT)
  const kp = store.getters.keypair

  const txBuilder = new TransactionBuilder(source)
  operations.forEach(item => txBuilder.addOperation(item))

  const tx = txBuilder.build()
  tx.sign(kp)

  return tx
    .toEnvelope()
    .toXDR()
    .toString('base64')
}
