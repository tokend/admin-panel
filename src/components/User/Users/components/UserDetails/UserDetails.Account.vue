<template>
  <div class="user-details-account">
    <h3>Account information</h3>
    <ul class="key-value-list">
      <li>
        <span>Email</span>
        <span :title="user.email">{{user.email}}</span>
      </li>
      <li>
        <span>Account ID</span>
        <span :title="user.id">{{user.id}}</span>
      </li>
      <li>
        <span>Account type</span>
        <span :title="ACCOUNT_TYPES_VERBOSE[account.accountType]">{{ACCOUNT_TYPES_VERBOSE[account.accountType]}}</span>
      </li>

      <li>
        <span>Account state</span>
        <account-state-getter class="app-list__cell" :accountId="user.id" />
      </li>

      <template v-if="user.state === USER_STATES_STR.rejected">
        <label class="data-caption">Reject reason</label>
        <p class="text">
          {{user.rejectReason}}
        </p>
      </template>
    </ul>

  </div>
</template>

<script>
import { USER_STATES_STR } from '@/constants'
import { AccountStateGetter } from '@comcom/getters'
const ACCOUNT_TYPES_VERBOSE = {
  AccountTypeNotVerified: 'Not verified',
  AccountTypeGeneral: 'General',
  AccountTypeSyndicate: 'Syndicate'
}

export default {
  components: {
    AccountStateGetter
  },
  data () {
    return {
      USER_STATES_STR,
      ACCOUNT_TYPES_VERBOSE
    }
  },

  props: ['user', 'account']
}
</script>

<style scoped>

</style>
