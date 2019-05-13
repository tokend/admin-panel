import store from '@/store'
import log from 'loglevel'
import _get from 'lodash/get'
import { ErrorTracker } from '@/utils/ErrorTracker'

export class ErrorHandler {
  static process (error, errorTrackerConfig = {}) {
    ErrorHandler.processWithoutFeedback(error, errorTrackerConfig)
    const message = ErrorHandler.extractErrorMessage(error)
    ErrorHandler.showFeedback(message)
  }

  static processWithoutFeedback (error, errorTrackerConfig = {}) {
    log.error(error)
    ErrorHandler.trackMessage(error, errorTrackerConfig)
  }

  static trackMessage (error, opts = {}) {
    const { message = '', skipTrack = false } = opts
    if (!skipTrack) {
      const msg = message || ErrorHandler.extractErrorMessage(error)
      ErrorTracker.trackMessage(msg)
    }
  }

  static showFeedback (message) {
    store.dispatch('SET_ERROR', message)
  }

  static extractErrorMessage (error) {
    if (typeof error === 'string') {
      return error
    }

    const serverError = _get(error, 'meta.extras.resultCodes.messages[0]')
    if (serverError) {
      return serverError
    }

    const isSignatureFailed =
      _get(error, 'originalError.response.data.extras.invalid_field') ===
      'signature'
    if (isSignatureFailed) {
      return 'Signature is not valid'
    }

    if (error.message) {
      return error.message
    }

    return 'Unknown error occurred, please contact us at dev@distributedlab.com'
  }
}
