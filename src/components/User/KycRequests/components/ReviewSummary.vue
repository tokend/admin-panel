<template>
  <div class="request-list">
    <div class="request-list__list-wrp">
      <template v-if="decisions.length">
        <div class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">
              Email
            </span>
            <span class="app-list__cell">
              Role
            </span>
            <span class="app-list__cell">
              State
            </span>
          </div>
          <button
            class="app-list__li"
            v-for="decision in decisions"
            :key="decision.request.id"
            @click="$emit(EVENTS.edit, decision)"
          >
            <email-getter
              class="app-list__cell app-list__cell--important"
              :account-id="decision.request.requestor"
              is-titled
            />
            <span class="app-list__cell">
              {{ decision.request.accountRoleToSet | roleIdToString }}
            </span>
            <span class="app-list__cell">
              {{ decision.action }}
            </span>
          </button>
        </div>

        <button
          class="app__btn review-summary__btn"
          :disabled="isDecisionsSkipped"
          @click="review"
        >
          Review
        </button>
      </template>

      <template v-else>
        <p class="app__block">
          You haven't reviewed any request
        </p>
      </template>
    </div>
  </div>
</template>

<script>
import { EmailGetter } from '@comcom/getters'

import config from '@/config'

import { confirmAction } from '@/js/modals/confirmation_message'

import 'mdi-vue/PlusCircleIcon'

const EVENTS = {
  edit: 'edit',
}

export default {
  name: 'kyc-request-list',
  components: { EmailGetter },

  props: {
    decisions: { type: Array, required: true },
  },

  data () {
    return {
      ACCOUNT_ROLES: config.ACCOUNT_ROLES,
      EVENTS,
    }
  },

  computed: {
    isDecisionsSkipped () {
      return this.decisions.every(item => item.action === 'skip')
    },
  },

  methods: {
    async review () {
      if (!await confirmAction('Are you sure? This action cannot be undone')) {
        return
      }

      for (const decision of this.decisions) {
        decision.action = 'processing'
      }
    },
  },
}
</script>

<style scoped>
.review-summary__btn {
  margin-top: 4rem;
  max-width: 10rem;
}

.review-summary__status-cell {
  display: flex;
}

.review-summary__status-cell-text {
  margin-left: 0.6rem;
}
</style>
