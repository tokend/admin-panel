import { Operation } from 'tokend-js-sdk'

import config from '../config'
import server from '../utils/server'

export default {

  manageForfeitRequest (opts) {
    opts.source = config.COMMISSION_ACCOUNT
    const operation = Operation.manageForfeitRequest(opts)
    return server.submitOperation(operation, true)
  }
}
