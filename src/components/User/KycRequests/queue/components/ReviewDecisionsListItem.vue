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
      :title="decision.state | localizeDecisionState | globalize"
    >
      {{ decision.state | localizeDecisionState | globalize }}
    </span>

    <span
      class="app-list__cell"
      :title="decision.reason"
    >
      {{ decision.reason || '&mdash;' }}
    </span>

    <span
      class="app-list__cell"
      :title="decision.tasks.toAdd | localizeTasks | globalize"
    >
      {{ decision.tasks.toAdd || '&mdash;' }}
    </span>

    <span
      class="app-list__cell"
      :title="decision.tasks.toRemove | localizeTasks | globalize"
    >
      {{ decision.tasks.toRemove || '&mdash;' }}
    </span>
  </button>
</template>

<script>
import { EmailGetter } from '@comcom/getters'

import { ReviewDecision } from '../wrappers/ReviewDecision'
import { DECISION_STATES } from '../constants/decision-states'

import { mapGetters } from 'vuex'

const EVENTS = {
  click: 'click',
}

export default {
  name: 'review-decisions-list-item',
  components: { EmailGetter },

  filters: {
    localizeDecisionState (state) {
      return {
        [DECISION_STATES.approve]: 'review-decisions-list-item.approve',
        [DECISION_STATES.approving]: 'review-decisions-list-item.approving',
        [DECISION_STATES.approved]: 'review-decisions-list-item.approved',
        [DECISION_STATES.error]: 'review-decisions-list-item.error',
        [DECISION_STATES.reject]: 'review-decisions-list-item.reject',
        [DECISION_STATES.rejecting]: 'review-decisions-list-item.rejecting',
        [DECISION_STATES.rejected]: 'review-decisions-list-item.rejected',
        [DECISION_STATES.skip]: 'review-decisions-list-item.skip',
        [DECISION_STATES.none]: 'review-decisions-list-item.none',
      }[state]
    },

    localizeTasks (tasks) {
      let tasksDescriptions = []

      if (tasks & this.kvChangeRoleTasks.submitAutoVerification) {
        tasksDescriptions
          .push('review-decisions-list-item.submit-auto-verification')
      }
      if (tasks & this.kvChangeRoleTasks.completeAutoVerification) {
        tasksDescriptions
          .push('review-decisions-list-item.complete-auto-verification')
      }
      if (tasks & this.kvChangeRoleTasks.manualReviewRequired) {
        tasksDescriptions
          .push('review-decisions-list-item.manual-review-required')
      }
      if (tasks & this.kvChangeRoleTasks.default) {
        tasksDescriptions.push('review-decisions-list-item.default')
      }

      return tasksDescriptions.join('\n')
    },
  },

  props: {
    decision: { type: ReviewDecision, required: true },
  },

  data () {
    return {
      EVENTS,
    }
  },

  computed: {
    ...mapGetters([
      'kvChangeRoleTasks',
    ]),
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
