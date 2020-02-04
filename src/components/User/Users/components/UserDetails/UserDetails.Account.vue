<template>
  <div class="user-details-account">
    <h3>{{ "user-details-account.header" | globalize }}</h3>
    <ul class="key-value-list">
      <li>
        <span>
          {{ "user-details-account.mail" | globalize }}
        </span>

        <template v-if="user.email">
          <span :title="user.email">
            {{ user.email }}
          </span>
        </template>
        <template v-else>
          <span>
            -
          </span>
        </template>
      </li>
      <li>
        <span>
          {{ "user-details-account.account-id" | globalize }}
        </span>
        <span :title="user.address">
          {{ user.address }}
        </span>
      </li>
      <li>
        <span>
          {{ "user-details-account.account-role" | globalize }}
        </span>
        <span :title="user.role | roleIdToString">
          {{ user.role | roleIdToString }}
        </span>
      </li>

      <li>
        <span>
          {{ "user-details-account.account-state" | globalize }}
        </span>
        <span>
          {{ accountState | globalize }}
        </span>
      </li>

      <template v-if="isUserBlocked && blockReason">
        <label class="data-caption">
          {{ "user-details-account.block-reason" | globalize }}
        </label>
        <p class="text">
          {{ blockReason }}
        </p>
      </template>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { UserRecord } from '@/js/records/user.record'

export default {
  props: {
    user: {
      type: UserRecord,
      default: () => {},
    },
    blockReason: {
      type: String,
      default: '',
    },
  },

  computed: {
    ...mapGetters([
      'kvEntryBlockedRoleId',
    ]),

    isUserBlocked () {
      return this.user.role === this.kvEntryBlockedRoleId
    },

    accountState () {
      return this.isUserBlocked
        ? 'user-details-account.blocked'
        : 'user-details-account.active'
    },
  },
}
</script>
