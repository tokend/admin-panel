import { Bus } from '@/utils/bus'
import log from 'loglevel'
import _get from 'lodash/get'
import { ErrorTracker } from '@/utils/ErrorTracker'
import { errors } from '@/js/errors'
import { TX_ERRORS } from '@/constants/tx-errors'

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
        message = 'Network error. Please re-check your internet connection and try again.'
        break
      case errors.UserDoesntExistError:
        message = "This user doesn't exist in system."
        break
      case errors.BalanceNotFoundError:
        message = 'The user does not have this asset balance yet.'
        break
      case errors.TimeoutError:
        message = 'Timeout exceeded. Please re-check your internet connection and try again.'
        break
      case errors.InternalServerError:
        message = 'Something bad happened. Please try again later or contact the system owner.'
        break
      case errors.BadRequestError:
        message = 'You don’t have permission to complete this action'
        break
      case errors.NotAllowedError:
        message = "Your account don't have permissions to perform this request."
        break
      case errors.ForbiddenRequestError:
        message = 'Request forbidden.'
        break
      case errors.TFARequiredError:
        message = '2FA required.'
        break
      case errors.VerificationRequiredError:
        message = 'Verification required.'
        break
      case errors.NotFoundError:
        message = 'Such item not found.'
        break
      case errors.ConflictError:
        message = 'Such item already exists.'
        break
      case errors.UnauthorizedError:
        message = 'Access denied.'
        break
      case errors.UserExistsError:
        message = 'User with such email already exists.'
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
        message = TX_ERRORS[errorCode]
        break
      case errors.StorageServerError:
        message = 'Cannot upload a file to the storage. Please upload another file or try again later.'
        break
      default:
        if (error.message) {
          message = error.message
        } else {
          message = 'Something bad happened. Please try again later or contact the system owner.'
        }
    }

    return message
  }
}
