import { Bus } from '@/utils/bus'
import log from 'loglevel'
import _get from 'lodash/get'
import { ErrorTracker } from '@/utils/ErrorTracker'
import { errors } from '@/js/errors'
import { globalize } from '@/components/App/filters/filters'

export class ErrorHandler {
  static process (error, errorTrackerConfig = {}) {
    const message = ErrorHandler.extractErrorMessage(error)
    Bus.error(message)

    errorTrackerConfig.message = message
    ErrorHandler.processWithoutFeedback(error, errorTrackerConfig)
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

  static extractErrorMessage (error) {
    let message

    switch (error.constructor) {
      case errors.NetworkError:
        message = 'errors.network'
        break
      case errors.UserDoesntExistError:
        message = 'errors.user-doesnt-exist'
        break
      case errors.BalanceNotFoundError:
        message = 'errors.balance-not-found'
        break
      case errors.TimeoutError:
        message = 'errors.timeout'
        break
      case errors.InternalServerError:
        message = 'errors.internal'
        break
      case errors.BadRequestError:
        message = 'errors.bad-request'
        break
      case errors.NotAllowedError:
        message = 'errors.not-allowed'
        break
      case errors.ForbiddenRequestError:
        message = 'errors.forbidden'
        break
      case errors.TFARequiredError:
        message = 'errors.tfa-required'
        break
      case errors.VerificationRequiredError:
        message = 'errors.verification-required'
        break
      case errors.NotFoundError:
        message = 'errors.not-found'
        break
      case errors.ConflictError:
        message = 'errors.conflict'
        break
      case errors.UnauthorizedError:
        message = 'errors.unauthorized'
        break
      case errors.UserExistsError:
        message = 'errors.user-exists'
        break
      case errors.TransactionError:
        let errorCode
        const errorResults = error.errorResults
        if (!errorResults) {
          const operations = _get(error, '_resultCodes.operations', [])
          errorCode = operations.find(i => i !== 'op_success') || ''
        } else {
          errorCode =
            (errorResults.find(i => i.errorCode !== 'op_success') || {})
              .errorCode
        }
        message = `transaction-errors.${errorCode}`
        break
      case errors.StorageServerError:
        message = 'errors.file-upload'
        break
      default:
        if (error.message) {
          message = error.message
        } else {
          message = 'errors.default'
        }
    }

    return globalize(message)
  }
}
