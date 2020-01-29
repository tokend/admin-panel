<template>
  <div class="user-details-account">
    <h3>Account information</h3>
    <ul class="key-value-list">
      <li>
        <span>
          Email
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
          Account ID
        </span>
        <span :title="user.address">
          {{ user.address }}
        </span>
      </li>
      <li>
        <span>
          Account role
        </span>
        <span :title="user.role | roleIdToString">
          {{ user.role | roleIdToString }}
        </span>
      </li>

      <li>
        <span>
          Account state
        </span>
        <span>
          {{ accountState }}
        </span>
      </li>

      <template v-if="isUserBlocked && blockReason">
        <label class="data-caption">
          Block reason
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
      return this.isUserBlocked ? 'Blocked' : 'Active'
    },
  },
}
</script>
