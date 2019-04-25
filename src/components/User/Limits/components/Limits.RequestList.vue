<template>
  <div class="request-rl">
    <template v-if="list">
      <ul class="app-list">
        <div class="app-list__header">
          <span class="app-list__cell">
            Date
          </span>
          <span class="app-list__cell">
            Request type
          </span>
          <span class="app-list__cell">
            Account Id
          </span>
          <span class="app-list__cell">
            Account email
          </span>
        </div>

        <router-link
          class="app-list__li"
          v-for="item in list"
          :key="item.id"
          :to="{ name: 'limits.reviewer', params: { id: item.id}}"
        >
          <span
            class="app-list__cell"
            :title="item.updatedAt"
          >
            {{ formatDate(item.updatedAt) }}
          </span>

          <span
            class="app-list__cell"
            :title="item.details.requestType"
          >
            {{ LIMITS_REQUEST_STATES_STR[item.details.requestType] }}
          </span>

          <span class="app-list__cell">
            {{ item.requestor }}
          </span>

          <span class="app-list__cell">
            <email-getter
              :account-id="item.requestor"
              is-titled
            />
          </span>
        </router-link>
      </ul>
    </template>

    <template v-else>
      <ul class="app-list">
        <li class="app-list__li-like">
          <template v-if="isLoading">
            Nothing here yet
          </template>
          <template v-else>
            Loading...
          </template>
        </li>
      </ul>
    </template>

    <!-- TODO: add 'More' button (when migrating to v3 endpoints)-->
  </div>
</template>

<script>
import { EmailGetter } from '@comcom/getters'
import { formatDate } from '@/utils/formatters'

import {
  ACCOUNT_TYPES,
  REQUEST_STATES,
  LIMITS_REQUEST_STATES_STR,
} from '@/constants'

export default {
  components: { EmailGetter },
  props: ['list'],
  data () {
    return {
      isLoading: false,
      isNoMoreEntries: false,
      REQUEST_STATES,
      ACCOUNT_TYPES,
      LIMITS_REQUEST_STATES_STR,
      formatDate,
    }
  },
  created () {
  },
}
</script>

<style scoped>
.request-list__filters-wrp {
  margin-bottom: 4rem;
}
</style>
