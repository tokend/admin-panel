import store from '@/store'
import log from 'loglevel'
import _get from 'lodash/get'
import * as Sentry from '@sentry/browser'

export class ErrorHandler {
  static process (error, { sentryReportTitle = '', skipSentryReport = false } = {}) {
    const message = ErrorHandler.extractErrorMessage(error)
    ErrorHandler.processWithoutFeedback(error)
    ErrorHandler.showFeedback(message)
    if (!skipSentryReport) {
      const messageForSentry = sentryReportTitle || message
      Sentry.captureMessage(messageForSentry)
    }
  }

  static processWithoutFeedback (error) {
    log.error(error)
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
