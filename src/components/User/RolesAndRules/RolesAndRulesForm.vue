<template>
  <form
    class="roles-and-rules-manager-form"
    @submit.prevent="isFormValid() && showConfirmation()">
    <div class="roles-and-rules-manager-form__content">
      <input-field
        :type="'number'"
        v-model="inputId"
        class="roles-and-rules-manager-form__input"
        :label="'roles-and-rules-form.lbl-id-input-field' | globalize"
        :placeholder="
          'roles-and-rules-form.placeholder-new-id' | globalize"
        @blur="touchField('inputId')"
        :error-message="getFieldErrorMessage(
          'inputId',
          { minValue: 0}
        )"
      />
      <form-confirmation
        v-if="formMixin.isConfirmationShown"
        :is-pending="isPending"
        @ok="submit"
        @cancel="closeConfirmation"
        :message="'roles-and-rules-form.confirm-message' | globalize"
        :ok-button-text="'roles-and-rules-form.btn-confirm' | globalize"
        :cancel-button-text="'roles-and-rules-form.btn-cancel' | globalize"
      />
      <button
        v-else
        class="app__btn roles-and-rules-form__add-btn"
        :disabled="isButtonDisabled"
        @click="tryAddKeyRule()">
        {{ "roles-and-rules-form.btn-add" | globalize }}
      </button>
    </div>
  </form>
</template>

<script>
import { InputField } from '@comcom/fields'
import FormMixin from '@/mixins/form.mixin'
import { minValue, required } from '@/validators'

const EVENTS = {
  submited: 'submited',
}

export default {
  comments: {
    InputField,
  },

  mixins: [FormMixin],

  props: {
    isButtonDisabled: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      inputId: '',
      isPending: false,
    }
  },

  validations () {
    return {
      inputId: {
        required,
        minValue: minValue(0),
      },
    }
  },
  methods: {
    submit () {
      this.isPending = true
      this.$emit(EVENTS.submited, this.inputId)
      this.isPending = false
      this.hideConfirmation()
    },

    tryAddKeyRule () {
      if (!this.isFormValid()) return
      this.showConfirmation()
    },
    closeConfirmation () {
      this.hideConfirmation()
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.roles-and-rules-manager-form {
  width: 100%;
  background-color: $color-content-bg;
  border-radius: 0.3rem;
  box-shadow: 0.07rem 0.07rem 0.56rem 0.04rem rgba(170, 170, 170, 0.72);
}

.roles-and-rules-manager-form__content {
  width: 100%;
  display: flex;
  margin-top: 3rem;
  padding: 2rem 2rem;
  justify-content: space-between;
  flex-wrap: nowrap;
}

.roles-and-rules-manager-form__input {
  margin-right: 5rem;
  max-width: 25rem;
}

.roles-and-rules-form__add-btn {
  max-height: 4.5rem;
  max-width: 20rem;
}
</style>
