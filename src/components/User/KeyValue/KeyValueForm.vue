<template>
  <form
    class="key-value-form"
    @submit.prevent="isFormValid() && showConfirmation()"
    novalidate
  >
    <div class="key-value-form__fields">
      <input-field
        v-model="form.key"
        class="key-value-form__input"
        :label="'key-value-form.lbl-key-input-field' | globalize"
        :placeholder="
          'key-value-form.placeholder-new-key' | globalize
        "
        :title="form.key"
        @blur="touchField('form.key')"
        :error-message="getFieldErrorMessage('form.key')"
        :disabled="isUpdateForm || formMixin.isDisabled"
      />

      <input-field
        v-model="form.value"
        class="key-value-form__input"
        :label="'key-value-form.lbl-value-input-field' | globalize"
        :placeholder="
          'key-value-form.placeholder-new-value' | globalize
        "
        :title="form.value"
        @blur="touchField('form.value')"
        :error-message="getFieldErrorMessage('form.value')"
        :disabled="formMixin.isDisabled"
      />

      <select-field
        v-model.number="form.entryType"
        class="key-value-form__input"
        :label="'key-value-form.lbl-entry-type' | globalize"
        @blur="touchField('form.entryType')"
        :error-message="getFieldErrorMessage('form.entryType')"
        :disabled="formMixin.isDisabled"
      >
        <option
          v-for="(value, lbl) in KEY_VALUE_ENTRY_TYPE"
          :value="value"
          :key="`update-entryType-${value}`"
        >
          {{ lbl }}
        </option>
      </select-field>
    </div>

    <div class="key-value-form__actions">
      <form-confirmation
        v-if="formMixin.isConfirmationShown"
        :is-pending="isPending"
        :message="confirmationMessage | globalize"
        @ok="submit"
        @cancel="closeConfirmation"
        :ok-button-text="'key-value-form.btn-confirm' | globalize"
        :cancel-button-text="'key-value-form.btn-cancel' | globalize"
      />
      <div
        v-else
        class="key-value-form__buttons"
      >
        <button
          v-if="isUpdateForm"
          class="app__btn-secondary"
          type="button"
          @click="closeModal"
          :disabled="formMixin.isDisabled"

        >
          {{ 'key-value-form.btn-cancel' | globalize }}
        </button>

        <button
          class="app__btn key-value-form__btn"
          :disabled="formMixin.isDisabled"
        >
          {{ addButtonText | globalize }}
        </button>

        <button
          v-if="isUpdateForm"
          class="app__btn app__btn--danger key-value-form__btn"
          type="button"
          :disabled="formMixin.isDisabled"
          @click="tryDeliteKeyValue">
          {{ "key-value-form.btn-delete" | globalize }}
        </button>
      </div>
    </div>
  </form>
</template>
<script>

import FormMixin from '@/mixins/form.mixin'

import { required } from '@/validators'

import { SelectField, InputField } from '@comcom/fields'
import { base } from '@tokend/js-sdk'
import { KEY_VALUE_ENTRY_TYPE } from '@/constants'
import { api } from '@/api'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/bus'
import { KeyValueRecord } from '@/js/records/keyValue.record'

const EVENTS = {
  closeModal: 'close-modal',
  submited: 'submited',
}

export default {
  components: {
    SelectField,
    InputField,
  },

  mixins: [FormMixin],

  props: {
    selectedKeyValue: {
      type: KeyValueRecord,
      default: () => new KeyValueRecord(),
    },
    isUpdateForm: {
      type: Boolean,
      default: false,
    },
  },

  data: _ => ({
    form: {
      key: '',
      value: '',
      entryType: KEY_VALUE_ENTRY_TYPE.uint32,
    },
    keyValueList: [],
    isPending: false,
    isDeleteKeyValue: false,
    KEY_VALUE_ENTRY_TYPE,
  }),

  validations () {
    return {
      form: {
        key: { required },
        value: { required },
        entryType: { required },
      },
    }
  },

  computed: {
    confirmationMessage () {
      return this.isDeleteKeyValue ? 'key-value-form.msg-delete-these-key'
        : 'key-value-form.msg-please-recheck-all-fields'
    },

    addButtonText () {
      return this.isUpdateForm ? 'key-value-form.btn-update'
        : 'key-value-form.btn-add'
    },
  },

  created () {
    if (this.selectedKeyValue.key) {
      this.form.key = this.selectedKeyValue.key
      this.form.value = this.selectedKeyValue.value
      this.form.entryType = this.selectedKeyValue.entryType
    }
  },

  methods: {
    async submit () {
      if (!this.isFormValid()) return

      this.isPending = true

      const keyValue = {
        key: this.form.key,
        value: String(this.form.value),
        entryType: this.form.entryType,
      }

      try {
        const operation = this.isDeleteKeyValue
          ? base.ManageKeyValueBuilder.deleteKeyValue(keyValue)
          : base.ManageKeyValueBuilder.putKeyValue(keyValue)

        await api.postOperations(operation)

        this.$emit(EVENTS.submited)
        Bus.success('key-value-form.submitted-successfully')
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isPending = false
      this.isDeleteKeyValue = false
      this.hideConfirmation()
    },

    closeConfirmation () {
      this.isDeleteKeyValue = false
      this.hideConfirmation()
    },

    tryDeliteKeyValue () {
      this.isDeleteKeyValue = true
      this.showConfirmation()
    },

    closeModal () {
      this.$emit(EVENTS.closeModal)
    },
  },
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.key-value-form {
  width: 100%;
}

.key-value-form__input {
  margin-left: 2rem;
  margin-right: 6rem;
  width: 30rem;
  min-width: 10rem;

  &:last-child {
    margin-right: 0;
  }
}

.key-value-form__actions {
  display: flex;
  justify-content: flex-end;

  /deep/ .form-confirmation {
    justify-content: flex-end;
  }

  /deep/ .form-confirmation__btns {
    margin-left: 0;
  }
}

.key-value-form__buttons {
  display: flex;
  justify-content: flex-end;
  margin: 0 1rem;

  :not(:last-child) {
    margin-right: 0.5rem;
  }
}

.key-value-form__fields {
  width: 100%;
  display: flex;
  padding: 3rem 1rem;
  flex-wrap: nowrap;
}
</style>
