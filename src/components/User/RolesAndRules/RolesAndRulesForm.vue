<template>
  <form
    class="roles-and-rules-form"
    @submit.prevent="isFormValid() && showConfirmation()"
    novalidate
  >
    <div class="roles-and-rules-form__content">
      <input-field
        type="number"
        v-model="inputId"
        class="roles-and-rules-form__input"
        :label="'roles-and-rules-form.lbl-id-input-field' | globalize"
        :placeholder="
          'roles-and-rules-form.placeholder-new-id' | globalize"
        @blur="touchField('inputId')"
        :error-message="getFieldErrorMessage(
          'inputId',
          { minValue: 0 }
        )"
        :disabled="formMixin.isDisabled"
      />
      <form-confirmation
        v-if="formMixin.isConfirmationShown"
        :is-pending="isPending"
        @ok="submit"
        @cancel="hideConfirmation"
        :message="'roles-and-rules-form.confirm-message' | globalize"
        :ok-button-text="'roles-and-rules-form.btn-confirm' | globalize"
        :cancel-button-text="'roles-and-rules-form.btn-cancel' | globalize"
      />
      <button
        v-else
        class="app__btn roles-and-rules-form__add-btn"
        :disabled="!isFormValid() || formMixin.isDisabled"
        @click.stop="showConfirmation"
      >
        {{ 'roles-and-rules-form.btn-add' | globalize }}
      </button>
    </div>
  </form>
</template>

<script>
import { InputField } from '@comcom/fields'
import FormMixin from '@/mixins/form.mixin'
import { minValue, required, Admin, ruleAlreadyAdded, ruleDoesNotExist } from '@/validators'
import { api, loadingDataViaLoop } from '@/api'

const EVENTS = {
  submited: 'submited',
}

export default {
  comments: {
    InputField,
  },

  mixins: [FormMixin],

  props: {
    rules: {
      type: Array,
      default: () => [],
    },
  },

  data () {
    return {
      inputId: '',
      isPending: false,
      allRulesId: [],
    }
  },

  computed: {
    rulesId () {
      const data = this.rules.map(item => {
        return item.id
      })
      return data
    },
  },
  async created () {
    const allRules = await this.getRules()
    this.allRulesId = allRules.map(item => { return item.id })
  },

  validations () {
    return {
      inputId: {
        required,
        minValue: minValue(0),
        Admin,
        idIsAlreadyAdded: ruleAlreadyAdded(this.rulesId),
        idDoesNotExist: ruleDoesNotExist(this.allRulesId),
      },
    }
  },
  methods: {
    async getRules () {
      const response = await api.get(`/v3/account_rules`, {
        page: {
          limit: 100,
        },
      })
      const data = await loadingDataViaLoop(response)
      return data
    },
    submit () {
      if (!this.isFormValid()) return
      this.isPending = true
      this.$emit(EVENTS.submited, this.inputId)
      this.isPending = false
      this.hideConfirmation()
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.roles-and-rules-form {
  width: 100%;
  background-color: $color-content-bg;
  border-radius: 0.3rem;
  box-shadow: 0.07rem 0.07rem 0.56rem 0.04rem rgba(170, 170, 170, 0.72);
}

.roles-and-rules-form__content {
  width: 100%;
  display: flex;
  margin-top: 3rem;
  padding: 2rem 2rem;
  justify-content: space-between;
  flex-wrap: nowrap;
}

.roles-and-rules-form__input {
  margin-right: 5rem;
  max-width: 25rem;
}

.roles-and-rules-form__add-btn {
  max-height: 4.5rem;
  max-width: 20rem;
}
</style>
