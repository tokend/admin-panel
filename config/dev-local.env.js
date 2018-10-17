const merge = require('webpack-merge')
const env = require('./alice.env')

module.exports = merge(env, {
  NODE_ENV: "'development'"
})
