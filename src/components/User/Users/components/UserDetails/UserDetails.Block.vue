<template>
  <div>
    <div class="user-block__block-user" v-if="isUserBlocked">
      <button
        class="app__btn user-block__btn"
        :disabled="isPending"
        @click="unblockUser"
      >
        Unblock user
      </button>
    </div>
    <div class="user-block__unblock-user" v-else>
      <button
        class="app__btn app__btn--danger user-block__btn"
        :disabled="isPending"
        @click="showBlockModal"
      >
        Block user
      </button>
    </div>

    <modal
      class="user-block__reject-modal"
      v-if="blockForm.isShown"
      @close-request="hideBlockModal()"
      max-width="40rem"
    >
      <form
        class="user-block__block-form"
        id="user-block-form"
        @submit.prevent="submitBlockForm"
      >
        <div class="app__form-row">
          <text-field
            label="Block reason"
            v-model="blockForm.reason"
          />
        </div>
      </form>

      <div class="app__form-actions user-block__reject-form-actions">
        <button
          class="app__btn app__btn--danger"
          form="user-block-form"
        >
          Block
        </button>
        <button
          class="app__btn-secondary"
          @click="hideBlockModal"
        >
          Cancel
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
import { Sdk } from '@/sdk'

import safeGet from 'lodash/get'

import { TextField } from '@comcom/fields'
import Modal from '@comcom/modals/Modal'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { confirmAction } from '@/js/modals/confirmation_message'

import config from '@/config'

const EVENTS = {
  updated: 'updated'
}

export default {
  name: 'user-details-block',
  components: {
    Modal,
    TextField
  },

  props: {
    latestApprovedRequest: { type: Object, default: _ => ({}) },
    user: { type: Object, default: _ => ({}) }
  },

  data () {
    return {
      ACCOUNT_ROLES: config.ACCOUNT_ROLES,
      blockForm: {
        reason: '',
        isShown: false
      },
      isPending: false
    }
  },

  computed: {
    isUserBlocked () {
      return this.user.role === config.ACCOUNT_ROLES.blocked
    }
  },

  methods: {
    async blockUser () {
      if (!await confirmAction('Are you sure?')) {
        return
      }
      this.isPending = true
      try {
        const previousAccountRole = safeGet(
          this.latestApprovedRequest,
          'requestDetails.accountRoleToSet'
        )
        const operation = Sdk.base.CreateChangeRoleRequestBuilder
          .createChangeRoleRequest({
            requestID: '0',
            destinationAccount: this.user.address,
            accountRoleToSet: config.ACCOUNT_ROLES.blocked.toString(),
            creatorDetails: {
              ...safeGet(
                this.latestApprovedRequest,
                'requestDetails.creatorDetails'
              ),
              blockReason: this.blockForm.reason,
              previousAccountRole: previousAccountRole ||
                config.ACCOUNT_ROLES.notVerified
            },
            allTasks: 0
          })
        await Sdk.horizon.transactions.submitOperations(operation)

        this.$store.dispatch('SET_INFO', 'The user account was blocked')
        this.$emit(EVENTS.updated)
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isPending = false
    },

    async unblockUser () {
      if (!await confirmAction('Are you sure?')) {
        return
      }
      this.isPending = true
      try {
        const previousAccountRole = safeGet(
          this.latestApprovedRequest,
          'requestDetails.creatorDetails.previousAccountRole'
        )
        const operation = Sdk.base.CreateChangeRoleRequestBuilder
          .createChangeRoleRequest({
            requestID: '0',
            destinationAccount: this.user.address,
            accountRoleToSet: previousAccountRole.toString(),
            creatorDetails: {
              ...safeGet(
                this.latestApprovedRequest,
                'requestDetails.creatorDetails'
              )
            },
            allTasks: 0
          })
        await Sdk.horizon.transactions.submitOperations(operation)

        this.$store.dispatch('SET_INFO', 'The user account was unblocked')
        this.$emit(EVENTS.updated)
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isPending = false
    },

    showBlockModal () {
      this.blockForm.reason = ''
      this.blockForm.isShown = true
    },

    hideBlockModal () {
      this.blockForm.isShown = false
    },

    async submitBlockForm () {
      this.hideBlockModal()
      await this.blockUser()
    }
  }
}
</script>

<style lang="scss" scoped>
.user-block__btn {
  max-width: 15rem;
  width: 100%;
}
</style>
