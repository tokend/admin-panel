const merge = require('webpack-merge')
const env = require('./default.env')

module.exports = merge(env, {
  NODE_ENV: '"dev"',
  HORIZON_SERVER: '"http://localhost:8000"',
  STORAGE_SERVER: '"http://localhost:9000/api"',
  KEY_SERVER_ADMIN: '"http://localhost:8006"',
  NETWORK_PASSPHRASE: '"TokenD Developer Network"'
})
