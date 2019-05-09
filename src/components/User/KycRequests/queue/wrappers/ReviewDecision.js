import { DECISION_ACTIONS } from '../constants/decision-actions'
import { DECISION_STATES } from '../constants/decision-states'

export class ReviewDecision {
  constructor (request, action = DECISION_ACTIONS.skip) {
    this.request = request

    this.action = action
    this.state = DECISION_STATES[this.action]

    this.reason = ''
    this.errorMessage = ''
  }

  get isEditable () {
    const editableStates = [
      DECISION_STATES.approve,
      DECISION_STATES.reject,
      DECISION_STATES.skip,
      DECISION_STATES.error,
    ]

    return editableStates.includes(this.state)
  }

  get isReadyForReview () {
    const readyForReviewStates = [
      DECISION_STATES.approve,
      DECISION_STATES.reject,
    ]

    return readyForReviewStates.includes(this.state)
  }

  approve () {
    this._setReview({ action: DECISION_ACTIONS.approve })
  }

  reject (reason) {
    this._setReview({
      action: DECISION_ACTIONS.reject,
      reason,
    })
  }

  skip () {
    this._setReview({ action: DECISION_ACTIONS.skip })
  }

  setProcessing () {
    switch (this.action) {
      case DECISION_ACTIONS.approve:
        this.state = DECISION_STATES.approving
        break
      case DECISION_ACTIONS.reject:
        this.state = DECISION_STATES.rejecting
        break
    }
  }

  setReviewed () {
    switch (this.action) {
      case DECISION_ACTIONS.approve:
        this.state = DECISION_STATES.approved
        break
      case DECISION_ACTIONS.reject:
        this.state = DECISION_STATES.rejected
        break
    }
  }

  setError (errorMessage) {
    this.state = DECISION_STATES.error
    this.errorMessage = errorMessage
  }

  _setReview ({ action, reason = '' }) {
    this.action = action
    this.state = DECISION_STATES[this.action]

    this.reason = reason
    this.errorMessage = ''
  }
}
