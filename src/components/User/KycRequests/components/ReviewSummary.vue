<template>
  <div class="request-list">
    <div class="request-list__list-wrp">
      <template v-if="filteredRequests && filteredRequests.length">
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
            v-for="request in filteredRequests"
            :key="request.id"
          >
            <email-getter
              class="app-list__cell app-list__cell--important"
              :account-id="request.requestor"
              is-titled
            />
            <span class="app-list__cell app-list__cell--right">
              {{ request.accountRoleToSet | roleIdToString }}
            </span>
            <span class="app-list__cell app-list__cell--right">
              {{ request.state }}
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
    filteredRequests () {
      return this.requests.filter(item => item.state !== 'pending')
    },
  },
}
</script>

<style scoped>
</style>
