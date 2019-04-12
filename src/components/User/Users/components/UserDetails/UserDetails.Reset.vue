<template>
  <div
    v-if="canResetToUnverified"
    class="user-reset"
  >
    <button
      class="app__btn
              app__btn-outline
              app__btn-outline--danger
              user-reset__btn"
      @click="showResetModal"
      :disabled="isPending"
    >
      Reset to unverified
    </button>
  
    <modal
      class="user-reset__modal"
      v-if="resetForm.isShown"
      @close-request="hideResetModal()"
      max-width="40rem"
    >
      <form
        class="user-reset__form"
        id="user-reset-form"
        @submit.prevent="submitResetForm"
      >
        <div class="app__form-row">
          <text-field
            label="Reset reason"
            :autofocus="true"
            v-model="resetForm.reason"
          />
        </div>
      </form>

      <div class="app__form-actions">
        <button
          class="app__btn app__btn--danger"
          form="user-reset-form"
        >
          Reset
        </button>
        <button
          class="app__btn-secondary"
          @click="hideResetModal"
        >
          Cancel
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
import { Sdk } from '@/sdk'

import { TextField } from '@comcom/fields'
import Modal from '@comcom/modals/Modal'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { confirmAction } from '@/js/modals/confirmation_message'

import config from '@/config'

const EVENTS = {
  reset: 'reset',
  updateIsPending: 'update:isPending'
}

export default {
  name: 'user-details-request',
  components: {
    Modal,
    TextField
  },

  props: {
    user: { type: Object, default: _ => ({}) },
    verifiedRequest: { type: Object, default: _ => ({}) },
    isPending: { type: Boolean, default: false }
  },

  data () {
    return {
      resetForm: {
        reason: '',
        isShown: false
      }
    }
  },

  computed: {
    canResetToUnverified () {
      return this.user.role !== config.ACCOUNT_ROLES.notVerified
    }
  },

  methods: {
    async resetToUnverified () {
      if (!await confirmAction('Are you sure? This action cannot be undone')) {
        return
      }
      this.$emit(EVENTS.updateIsPending, true)
      try {
        const operation = Sdk.base.CreateChangeRoleRequestBuilder
          .createChangeRoleRequest({
            requestID: '0',
            destinationAccount: this.user.address,
            accountRoleToSet: config.ACCOUNT_ROLES.notVerified.toString(),
            creatorDetails: {
              resetReason: this.resetForm.reason,
              latestApprovedRequestId: this.verifiedRequest.id
            },
            allTasks: 0
          })
        await Sdk.horizon.transactions.submitOperations(operation)
        this.$store.dispatch('SET_INFO', 'The user account was reset to unverified')
        this.$emit(EVENTS.reset)
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.$emit(EVENTS.updateIsPending, false)
    },

    showResetModal () {
      this.resetForm.reason = ''
      this.resetForm.isShown = true
    },

    hideResetModal () {
      this.resetForm.isShown = false
    },

    async submitResetForm () {
      this.hideResetModal()
      await this.resetToUnverified()
    }
  }
}
</script>

<style scoped>
.user-reset__btn {
  width: 15rem;
}
</style>
