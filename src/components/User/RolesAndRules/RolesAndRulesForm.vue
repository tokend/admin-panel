<template>
  <form
    v-if="isLoaded"
    class="roles-and-rules-form"
    @submit.prevent="showConfirmation"
    novalidate
  >
    <template
      v-if="isLoadFailed"
    >
      <p class="roles-and-rules-form__content">
        {{ 'roles-and-rules-form.loading-error-msg' | globalize }}
      </p>
    </template>
    <div
      v-else
      class="roles-and-rules-form__content"
    >
      <input-field
        type="number"
        v-model="idToAdd"
        class="roles-and-rules-form__input"
        :label="'roles-and-rules-form.lbl-id-input-field' | globalize"
        :placeholder="
          'roles-and-rules-form.placeholder-new-id' | globalize"
        @blur="touchField('idToAdd')"
        :error-message="getFieldErrorMessage(
          'idToAdd',
          { minValue: 0 }
        )"
        :disabled="formMixin.isDisabled"
      />
      <form-confirmation
        v-if="formMixin.isConfirmationShown"
        :is-pending="isPending"
        :message="'roles-and-rules-form.confirm-message' | globalize"
        @ok="submit"
        @cancel="hideConfirmation"
        :ok-button-text="'key-value-form.btn-confirm' | globalize"
        :cancel-button-text="'key-value-form.btn-cancel' | globalize"
      />
      <button
        v-else
        class="app__btn roles-and-rules-form__add-btn"
        :disabled="formMixin.isDisabled"
      >
        {{ 'roles-and-rules-form.btn-add' | globalize }}
      </button>
    </div>
  </form>
</template>

<script>
import FormMixin from '@/mixins/form.mixin'
import apiHelper from '@/apiHelper'

import { InputField } from '@comcom/fields'
import { minValue, required, isNotAdminRule, isRuleNotAdded, isRuleExists } from '@/validators'
import { api, loadingDataViaLoop } from '@/api'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/bus'
import { RuleRecord } from '@/js/records/rule.record'

const EVENTS = {
  submitted: 'submitted',
}

export default {
  name: 'roles-and-rules-form',

  comments: {
    InputField,
  },

  mixins: [FormMixin],

  props: {
    selectedRole: {
      type: Object,
      default: () => {},
    },
  },

  data () {
    return {
      idToAdd: '',
      isPending: false,
      allRules: [],
      isLoaded: false,
      isLoadFailed: false,
      EVENTS,
    }
  },

  computed: {
    rulesIds () {
      const data = this.selectedRole.rules.map(item => {
        return item.id
      })
      return data
    },
    allRulesIds () {
      return this.allRules.map(item => { return item.ruleId })
    },
  },
  async created () {
    await this.getRules()
  },

  validations () {
    return {
      idToAdd: {
        required,
        minValue: minValue(0),
        isNotAdminRule,
        idIsAlreadyAdded: isRuleNotAdded(this.rulesIds),
        idDoesNotExist: isRuleExists(this.allRulesIds),
      },
    }
  },
  methods: {
    async getRules () {
      try {
        const response = await api.get(`/v3/account_rules`, {
          page: {
            limit: 100,
          },
        })
        const data = await loadingDataViaLoop(response)
        this.allRules = data.map(item => new RuleRecord(item))
      } catch (error) {
        ErrorHandler.process(error)
        this.isLoadFailed = true
      }
      this.isLoaded = true
    },
    async submit () {
      if (!this.isFormValid()) return
      this.isPending = true
      const ruleToAdd = { id: this.idToAdd }
      this.selectedRole.rules.push(ruleToAdd)
      await apiHelper.requests.updateRole(this.selectedRole)
      this.$emit(EVENTS.submitted)
      Bus.success('roles-and-rules-form.addition-successfully')
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
