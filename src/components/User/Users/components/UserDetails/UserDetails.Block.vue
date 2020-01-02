<template>
  <div>
    <div class="user-block__block-user" v-if="isUserBlocked">
      <button
        class="app__btn user-block__btn"
        :disabled="isPending"
        @click="unblockUser"
      >
        {{ "user-details-block.btn-unblock-user" | globalize }}
      </button>
    </div>
    <div class="user-block__unblock-user" v-else>
      <button
        class="app__btn app__btn--danger user-block__btn"
        :disabled="isPending"
        @click="showBlockModal"
      >
        {{ "user-details-block.btn-block-user" | globalize }}
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
        novalidate
      >
        <div class="app__form-row">
          <text-field
            :label="'user-details-block.lbl-block-reason' | globalize"
            v-model="blockForm.reason"
            @blur="touchField('blockForm.reason')"
            :error-message="getFieldErrorMessage(
              'blockForm.reason',
              { maxLength: REJECT_REASON_MAX_LENGTH }
            )"
          />
        </div>
      </form>

      <div class="app__form-actions user-block__reject-form-actions">
        <button
          class="app__btn app__btn--danger"
          form="user-block-form"
        >
          {{ "user-details-block.btn-block" | globalize }}
        </button>
        <button
          class="app__btn-secondary"
          @click="hideBlockModal"
        >
          {{ "user-details-block.btn-cancel" | globalize }}
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
import { base } from '@tokend/js-sdk'

import FormMixin from '@/mixins/form.mixin'
import { required, maxLength } from '@/validators'

import Modal from '@comcom/modals/Modal'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { confirmAction } from '@/js/modals/confirmation_message'
import { Bus } from '@/utils/bus'

import { ChangeRoleRequest } from '@/apiHelper/responseHandlers/requests/ChangeRoleRequest'

import { api } from '@/api'
import { mapGetters } from 'vuex'

const EVENTS = {
  updated: 'updated',
  updateIsPending: 'update:isPending',
}

const REJECT_REASON_MAX_LENGTH = 255

export default {
  name: 'user-details-block',
  components: { Modal },
  mixins: [FormMixin],

  props: {
    latestApprovedRequest: {
      type: ChangeRoleRequest,
      default: _ => new ChangeRoleRequest({}),
    },
    verifiedRequest: {
      type: ChangeRoleRequest,
      default: _ => new ChangeRoleRequest({}),
    },
    user: {
      type: Object,
      default: _ => ({}),
    },
    isPending: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      blockForm: {
        reason: '',
        isShown: false,
      },
      REJECT_REASON_MAX_LENGTH,
    }
  },

  validations () {
    return {
      blockForm: {
        reason: {
          required,
          maxLength: maxLength(REJECT_REASON_MAX_LENGTH),
        },
      },
    }
  },

  computed: {
    ...mapGetters([
      'kvAccountRoles',
    ]),

    isUserBlocked () {
      return this.user.role === this.kvAccountRoles.blocked
    },
  },

  methods: {
    async blockUser () {
      if (!await confirmAction('Are you sure?')) {
        return
      }
      this.$emit(EVENTS.updateIsPending, true)
      try {
        const operation = base.CreateChangeRoleRequestBuilder
          .createChangeRoleRequest({
            requestID: '0',
            destinationAccount: this.user.address,
            accountRoleToSet: this.kvAccountRoles.blocked.toString(),
            creatorDetails: {
              blockReason: this.blockForm.reason,
              latestApprovedRequestId: this.latestApprovedRequest.id,
            },
            allTasks: 0,
          })
        await api.postOperations(operation)

        Bus.success('The user account was blocked')
        this.$emit(EVENTS.updated)
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.$emit(EVENTS.updateIsPending, false)
    },

    async unblockUser () {
      if (!await confirmAction('Are you sure?')) {
        return
      }
      this.$emit(EVENTS.updateIsPending, true)
      try {
        const accountRoleToSet = this.verifiedRequest.accountRoleToSet ||
          this.kvAccountRoles.unverified

        const operation = base.CreateChangeRoleRequestBuilder
          .createChangeRoleRequest({
            requestID: '0',
            destinationAccount: this.user.address,
            accountRoleToSet: accountRoleToSet.toString(),
            creatorDetails: {
              ...this.verifiedRequest.creatorDetails,
            },
            allTasks: 0,
          })
        await api.postOperations(operation)

        Bus.success('The user account was unblocked')
        this.$emit(EVENTS.updated)
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.$emit(EVENTS.updateIsPending, false)
    },

    showBlockModal () {
      this.blockForm.reason = ''
      this.blockForm.isShown = true
    },

    hideBlockModal () {
      this.blockForm.isShown = false
    },

    async submitBlockForm () {
      if (!this.isFormValid()) return

      this.hideBlockModal()
      await this.blockUser()
    },
  },
}
</script>

<style lang="scss" scoped>
.user-block__btn {
  max-width: 15rem;
  width: 100%;
}
</style>
