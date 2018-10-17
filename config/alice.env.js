const merge = require('webpack-merge')
const env = require('./default.env')

module.exports = merge(env, {
  NODE_ENV: '"dev"',
  STORAGE_SERVER: '"https://storage.alice.tokend.io/api"',
  KEY_SERVER_ADMIN: '"https://admin.alice.tokend.io/_/adks"',
  HORIZON_SERVER: '"https://api.alice.tokend.io"',
  NETWORK_PASSPHRASE: '"Tokend Alice Network!"'
})
