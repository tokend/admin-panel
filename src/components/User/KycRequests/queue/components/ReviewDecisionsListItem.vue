<template>
  <button
    class="app-list__li review-decisions-list-item"
    :disabled="!decision.isEditable"
    @click="$emit(EVENTS.click, decision)"
  >
    <email-getter
      class="app-list__cell app-list__cell--important"
      :account-id="decision.request.requestor"
      is-titled
    />

    <span
      class="app-list__cell"
      :title="decision.request.accountRoleToSet | roleIdToString"
    >
      {{ decision.request.accountRoleToSet | roleIdToString }}
    </span>

    <span
      class="app-list__cell review-decisions-list-item__state"
      :class="`review-decisions-list-item__state--${decision.state}`"
      :title="decision.state | localizeDecisionState"
    >
      {{ decision.state | localizeDecisionState }}
    </span>

    <span class="app-list__cell" :title="decision.reason">
      {{ decision.reason || '&mdash;' }}
    </span>

    <span
      class="app-list__cell"
      :title="decision.tasks.toAdd | localizeTasks"
    >
      {{ decision.tasks.toAdd || '&mdash;' }}
    </span>

    <span
      class="app-list__cell"
      :title="decision.tasks.toRemove | localizeTasks"
    >
      {{ decision.tasks.toRemove || '&mdash;' }}
    </span>
  </button>
</template>

<script>
import { EmailGetter } from '@comcom/getters'

import { ReviewDecision } from '../wrappers/ReviewDecision'
import { DECISION_STATES } from '../constants/decision-states'

import config from '@/config'

const EVENTS = {
  click: 'click',
}

export default {
  name: 'review-decisions-list-item',
  components: { EmailGetter },

  filters: {
    localizeDecisionState (state) {
      return {
        [DECISION_STATES.approve]: 'Ready to approve',
        [DECISION_STATES.approving]: 'Approving…',
        [DECISION_STATES.approved]: 'Approved',
        [DECISION_STATES.error]: 'Error',
        [DECISION_STATES.reject]: 'Ready to reject',
        [DECISION_STATES.rejecting]: 'Rejecting…',
        [DECISION_STATES.rejected]: 'Rejected',
        [DECISION_STATES.skip]: 'Skipped',
        [DECISION_STATES.none]: 'Not reviewed',
      }[state]
    },

    localizeTasks (tasks) {
      let tasksDescriptions = []

      if (tasks & config.CHANGE_ROLE_TASKS.submitAutoVerification) {
        tasksDescriptions.push('Submit auto verification request')
      }
      if (tasks & config.CHANGE_ROLE_TASKS.completeAutoVerification) {
        tasksDescriptions.push('Complete auto verification request')
      }
      if (tasks & config.CHANGE_ROLE_TASKS.manualReviewRequired) {
        tasksDescriptions.push('Manual review required')
      }
      if (tasks & config.CHANGE_ROLE_TASKS.default) {
        tasksDescriptions.push('Default')
      }

      return tasksDescriptions.join('\n')
    }
  },

  props: {
    decision: { type: ReviewDecision, required: true },
  },

  data () {
    return {
      EVENTS,
    }
  },
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors";

.review-decisions-list-item__state--error {
  color: $color-danger;
}

.review-decisions-list-item__state--approved,
.review-decisions-list-item__state--rejected {
  color: $color-success;
}
</style>
