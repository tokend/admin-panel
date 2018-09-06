var merge = require('webpack-merge')
var devEnv = require('./dev-local.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"'
})
