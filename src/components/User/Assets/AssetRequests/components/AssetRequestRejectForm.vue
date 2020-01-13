<template>
  <div class="trrf">
    <h2 v-if="assetRequest.type === 'create_asset'">
      {{ "asset-request-reject-form.reject" | globalize }}
      {{ "asset-request-reject-form.create-request" | globalize }}
    </h2>

    <h2 v-else>
      {{ "asset-request-reject-form.reject" | globalize }}
      {{ "asset-request-reject-form.update-request" | globalize }}
    </h2>

    <form
      @submit.prevent="reject"
      id="trrf-form"
      novalidate>
      <div class="app__form-row">
        <text-field
          :label="'asset-request-reject-form.lbl-reject-reason' | globalize"
          v-model="form.rejectReason"
          :disabled="formMixin.isDisabled"
          @blur="touchField('form.rejectReason')"
          :error-message="
            getFieldErrorMessage('form.rejectReason', {
              maxLength: REJECT_REASON_MAX_LENGTH
            })
          "
          rows="5"
        />
      </div>

      <div class="app__form-row">
        <tick-field
          :label="'asset-request-reject-form.lbl-perm-reject' | globalize"
          v-model="isPermanentReject"
          :disabled="formMixin.isDisabled"
        />
      </div>
    </form>

    <div class="trrf__form-actions app__form-actions">
      <button
        class="app__btn app__btn--danger"
        form="trrf-form"
        :disabled="formMixin.isDisabled"
      >
        {{ "asset-request-reject-form.btn-reject" | globalize }}
      </button>
      <button
        class="app__btn-secondary"
        @click="$emit('close')"
        :disabled="formMixin.isDisabled"
      >
        {{ "asset-request-reject-form.btn-cancel" | globalize }}
      </button>
    </div>
  </div>
</template>

<script>
import FormMixin from '@/mixins/form.mixin'
import { required, maxLength } from '@/validators'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/bus'

const REJECT_REASON_MAX_LENGTH = 255

export default {
  mixins: [FormMixin],

  props: {
    assetRequest: { type: Object, required: true },
  },

  data () {
    return {
      form: {
        rejectReason: '',
      },
      isPermanentReject: false,
      REJECT_REASON_MAX_LENGTH,
    }
  },

  validations () {
    return {
      form: {
        rejectReason: {
          required,
          maxLength: maxLength(REJECT_REASON_MAX_LENGTH),
        },
      },
    }
  },

  methods: {
    async reject () {
      if (!this.isFormValid()) return

      this.disableForm()
      try {
        await this.assetRequest.reject(
          this.form.rejectReason,
          this.isPermanentReject
        )
        Bus.success('asset-request-reject-form.request-rejected')
        this.$router.push({ name: 'assets' })
      } catch (err) {
        ErrorHandler.process('asset-request-reject-form.fail-reject')
      }
      this.enableForm()
    },
  },
}
</script>

<style lang="scss" scoped>
.trrf {
  font-size: 1.6rem;

  textarea {
    width: 100%;
  }
}

.trrf__form-actions.app__form-actions {
  margin-top: 3rem;

  & > .app__btn,
  & > .app__btn-secondary {
    flex: 0.33;
  }
}
</style>
