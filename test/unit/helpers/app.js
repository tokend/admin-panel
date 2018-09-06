import VeeValidate from 'vee-validate'
import { Validator } from 'vee-validate'

Validator.installDateTimeValidators(moment)
Validator.extend('accountId', {
  getMessage: field => 'The ' + field + ' invalid.',
  validate: value => StellarBase.Keypair.isValidPublicKey(value)
})
Vue.use(VeeValidate)