<template>
  <div class="request-rl">
    <template v-if="list">
      <ul class="app-list">
        <div class="app-list__header">
          <span class="app-list__cell">
            {{ "limits-request-list.date" | globalize }}
          </span>
          <span class="app-list__cell">
            {{ "limits-request-list.request-type" | globalize }}
          </span>
          <span class="app-list__cell">
            {{ "limits-request-list.account-id" | globalize }}
          </span>
          <span class="app-list__cell">
            {{ "limits-request-list.account-email" | globalize }}
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
            :title="item.requestDetails.creatorDetails.requestType"
          >
            {{
              LIMITS_REQUEST_STATES_STR[
                item.requestDetails.creatorDetails.requestType
              ]
            }}
          </span>

          <span class="app-list__cell">
            {{ item.requestor.id }}
          </span>

          <span class="app-list__cell">
            <email-getter
              :account-id="item.requestor.id"
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
            {{ "limits-request-list.nothing-here-yet" | globalize }}
          </template>
          <template v-else>
            {{ "limits-request-list.loading" | globalize }}
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

  props: {
    list: { type: Array, required: true },
  },

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
}
</script>

<style scoped>
.request-list__filters-wrp {
  margin-bottom: 4rem;
}
</style>
