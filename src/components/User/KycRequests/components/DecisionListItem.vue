<template>
  <button
    class="app-list__li decision-list-item"
    :disabled="!isEditable"
    @click="$emit(EVENTS.click, decision)"
  >
    <email-getter
      class="app-list__cell app-list__cell--important"
      :account-id="decision.request.requestor"
      is-titled
    />
    <span class="app-list__cell">
      {{ decision.request.accountRoleToSet | roleIdToString }}
    </span>
    <span
      class="app-list__cell decision-list-item__state"
      :class="`decision-list-item__state--${decision.state}`"
    >
      {{ DECISION_STATES[decision.state] }}
    </span>
  </button>
</template>

<script>
import { EmailGetter } from '@comcom/getters'

const DECISION_STATES = {
  approve: 'Ready to approve',
  approving: 'Approving…',
  approved: 'Approved',
  error: 'Error',
  reject: 'Ready to reject',
  rejecting: 'Rejecting…',
  rejected: 'Rejected',
  skip: 'Skipped',
}

const EVENTS = {
  click: 'click',
}

export default {
  name: 'decision-list-item',
  components: { EmailGetter },

  props: {
    decision: { type: Object, required: true },
  },

  data () {
    return {
      DECISION_STATES,
      EVENTS,
    }
  },

  computed: {
    isEditable () {
      const editableStates = ['approve', 'reject', 'error', 'skip']
      return editableStates.includes(this.decision.state)
    },
  },
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors";

.decision-list-item__state--error {
  color: $color-danger;
}

.decision-list-item__state--approved,
.decision-list-item__state--rejected {
  color: $color-success;
}
</style>
