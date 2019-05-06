<template>
  <div class="request-list">
    <div class="request-list__list-wrp">
      <template v-if="filteredOperations && filteredOperations.length">
        <div class="app-list">
          <div class="app-list__header">
            <span class="app-list__cell">
              Email
            </span>
            <span class="app-list__cell app-list__cell--right">
              Role
            </span>
            <span class="app-list__cell app-list__cell--right">
              State
            </span>
            <span class="app-list__cell app-list__cell--right">
              Status
            </span>
          </div>
          <button
            class="app-list__li"
            v-for="(item, i) in filteredOperations"
            :key="i"
          >
            <email-getter
              class="app-list__cell app-list__cell--important"
              :account-id="requests[i].requestor"
              is-titled
            />
            <span class="app-list__cell app-list__cell--right">
              {{ requests[i].accountRoleToSet }}
            </span>
            <span class="app-list__cell app-list__cell--right">
              {{ requests[i].state }}
            </span>
            <span class="app-list__cell app-list__cell--right">
              {{ 'in queue' }}
            </span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { EmailGetter } from '@comcom/getters'

import config from '@/config'

export default {
  name: 'kyc-request-list',
  components: { EmailGetter },

  props: {
    operations: { type: Array, required: true },
    requests: { type: Array, required: true },
  },

  data () {
    return {
      ACCOUNT_ROLES: config.ACCOUNT_ROLES,
    }
  },

  computed: {
    filteredOperations () {
      return this.operations.filter(item => item !== undefined)
    }
  },
}
</script>

<style scoped>
</style>
