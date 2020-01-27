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
      {{ "user-details-reset.btn-reset-unverified" | globalize }}
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
        novalidate
      >
        <div class="app__form-row">
          <text-field
            :label="'user-details-reset.lbl-reject-reason' | globalize"
            :autofocus="true"
            v-model="resetForm.reason"
            @blur="touchField('resetForm.reason')"
            :error-message="getFieldErrorMessage(
              'resetForm.reason',
              { maxLength: REJECT_REASON_MAX_LENGTH }
            )"
          />
        </div>
      </form>

      <div class="app__form-actions">
        <button
          class="app__btn app__btn--danger"
          form="user-reset-form"
        >
          {{ "user-details-reset.btn-reset" | globalize }}
        </button>
        <button
          class="app__btn-secondary"
          @click="hideResetModal"
        >
          {{ "user-details-reset.btn-cancel" | globalize }}
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
import { base } from '@tokend/js-sdk'

import Modal from '@comcom/modals/Modal'

import FormMixin from '@/mixins/form.mixin'
import { required, maxLength } from '@/validators'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { confirmAction } from '@/js/modals/confirmation_message'
import { Bus } from '@/utils/bus'
import { globalize } from '@/components/App/filters/filters'
import { ChangeRoleRequest } from '@/apiHelper/responseHandlers/requests/ChangeRoleRequest'

import { api } from '@/api'
import { mapGetters } from 'vuex'

const EVENTS = {
  reset: 'reset',
  updateIsPending: 'update:isPending',
}

const REJECT_REASON_MAX_LENGTH = 255

export default {
  name: 'user-details-request',
  components: { Modal },
  mixins: [FormMixin],

  props: {
    user: {
      type: Object,
      default: _ => ({}),
    },
    verifiedRequest: {
      type: ChangeRoleRequest,
      default: _ => new ChangeRoleRequest({}),
    },
    isPending: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      resetForm: {
        reason: '',
        isShown: false,
      },
      REJECT_REASON_MAX_LENGTH,
    }
  },

  validations () {
    return {
      resetForm: {
        reason: {
          required,
          maxLength: maxLength(REJECT_REASON_MAX_LENGTH),
        },
      },
    }
  },

  computed: {
    ...mapGetters([
      'kvEntryUnverifiedRoleId',
    ]),

    canResetToUnverified () {
      return this.user.role !== this.kvEntryUnverifiedRoleId
    },
  },

  methods: {
    async resetToUnverified () {
      if (!await confirmAction({
        title: globalize('user-details-reset.are-you-sure'),
      })
      ) {
        return
      }
      this.$emit(EVENTS.updateIsPending, true)
      try {
        const operation = base.CreateChangeRoleRequestBuilder
          .createChangeRoleRequest({
            requestID: '0',
            destinationAccount: this.user.address,
            accountRoleToSet: this.kvEntryUnverifiedRoleId.toString(),
            creatorDetails: {
              resetReason: this.resetForm.reason,
              latestApprovedRequestId: this.verifiedRequest.id,
            },
            allTasks: 0,
          })
        await api.postOperations(operation)
        Bus.success('user-details-reset.account-reset-to-unverified')
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
      if (!this.isFormValid()) return

      this.hideResetModal()
      await this.resetToUnverified()
    },
  },
}
</script>

<style scoped>
.user-reset__btn {
  width: 15rem;
}
</style>
