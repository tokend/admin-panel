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

      <li>
        <span>
          {{ "user-details-account.account-role" | globalize }}
        </span>
        <span>
          <div class="user-details-account__role-wrp">
            <select-field
              class="user-details-account__role-field"
              v-model="userRole"
            >
              <option
                v-for="role in kvAccountRoles"
                :value="+role"
                :key="role"
              >
                {{ role | roleIdToString }}
              </option>
            </select-field>
            <button
              v-if="isRoleChanged"
              @click="changeRole"
              :disabled="isPending"
              type="button"
              class="
                app__btn
                app__btn--small
                user-details-account__role-btn
              "
            >
              {{ "user-details-account.btn-change" | globalize }}
            </button>
          </div>
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
import { api } from '@/api'
import { Bus } from '@/utils/bus'
import { base } from '@tokend/js-sdk'

import { mapGetters } from 'vuex'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { UserRecord } from '@/js/records/user.record'

import SelectField from '@comcom/fields/SelectField'

const EVENTS = {
  updateUser: 'update-user',
}

export default {
  components: {
    SelectField,
  },

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

  data: () => ({
    isPending: false,
    userRole: '',
  }),

  computed: {
    ...mapGetters([
      'kvEntryBlockedRoleId',
      'kvAccountRoles',
    ]),

    isUserBlocked () {
      return this.user.role === this.kvEntryBlockedRoleId
    },

    isRoleChanged () {
      return +this.userRole !== this.user.role
    },

    accountState () {
      return this.isUserBlocked
        ? 'user-details-account.blocked'
        : 'user-details-account.active'
    },
  },

  async created () {
    this.userRole = this.user.role
  },

  methods: {
    async changeRole () {
      this.isPending = true
      try {
        const operation = base.CreateChangeRoleRequestBuilder
          .createChangeRoleRequest({
            requestID: '0',
            destinationAccount: this.user.address,
            accountRoleToSet: this.userRole,
            creatorDetails: {},
            allTasks: 0,
          })
        await api.postOperations(operation)
        // sometimes user role does not have time to update
        // eslint-disable-next-line promise/avoid-new
        await new Promise(resolve => setTimeout(resolve, 2000))
        this.$emit(EVENTS.updateUser)
        Bus.success('user-details-account.role-updated')
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isPending = false
    },
  },
}
</script>

<style lang="scss">
.user-details-account__role-wrp {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.user-details-account__role-btn {
  margin-left: 1rem;
  height: 3rem;
  padding: 0;
  max-width: 10rem;
}

.user-details-account__role-field {
  width: 20rem;
}
</style>
