<template>
  <div class="rule-manager app__block">
    <h2>
      {{ "rule-manager.header" | globalize }}
    </h2>

    <form
      @submit.prevent="isFormValid() && showConfirmation()"
      novalidate
    >
      <select-field
        class="app__form-field app__form-field--halved"
        :label="'rule-manager.lbl-action' | globalize"
        v-model="form.action"
        :disabled="formMixin.isDisabled"
      >
        <option value="" />
        <option
          v-for="(action, key) in actionRules"
          :key="key"
          :value="action"
        >
          {{ formatAction(action) }}
        </option>
      </select-field>

      <div class="app__form-row">
        <input-field
          class="app__form-field"
          :label="'rule-manager.lbl-name' | globalize"
          v-model="form.ruleName"
          :disabled="formMixin.isDisabled"
        />
      </div>

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          :label="'rule-manager.lbl-forbids' | globalize"
          v-model="form.forbids"
          :disabled="formMixin.isDisabled"
        />
      </div>

      <div class="app__form-actions">
        <form-confirmation
          v-if="formMixin.isConfirmationShown"
          :is-pending="isFormSubmitting"
          @ok="submit"
          @cancel="hideConfirmation"
          :message="'rule-manager.please-recheck-form' | globalize"
          :ok-button-text="'rule-manager.btn-confirm' | globalize"
          :cancel-button-text="'rule-manager.btn-cancel' | globalize"
        />

        <button
          v-else
          class="app__btn"
          :disabled="formMixin.isDisabled"
        >
          <span v-if="isRuleExist">
            {{ "rule-manager.btn-update-rule" | globalize }}
          </span>
          <span v-else>
            {{ "rule-manager.btn-create-rule" | globalize }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import FormMixin from '@/mixins/form.mixin'

import { api } from '@/api'

import { Bus } from '@/utils/bus'
import { base } from '@tokend/js-sdk'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { ACCOUNT_RULE_ACTIONS, SIGNER_RULE_ACTIONS } from '@/constants/rule-actions'
import { xdrTypeFromValue } from '@/utils/xdrTypeFromValue'
import {
  accountRuleActionsFilter,
  signerRuleActionsFilter,
} from '@/components/App/filters/filters'

export default {
  name: 'rule-manager',

  mixins: [FormMixin],

  props: {
    rule: { type: Object, default: () => {} },
    isAccountRules: { type: Boolean, required: true },
  },

  data () {
    return {
      form: {
        ruleName: '',
        action: '',
      },
    }
  },

  computed: {
    isRuleExist () {
      return false
    },

    actionRules () {
      return this.isAccountRules
        ? ACCOUNT_RULE_ACTIONS
        : SIGNER_RULE_ACTIONS
    },
  },

  methods: {
    async submit () {
      try {
        const operation = base.ManageAccountRuleBuilder.create({
          resource: {
            type: 'SIGNER_ROLE',
          },
          action: xdrTypeFromValue('AccountRuleAction', Number(this.form.action)),
          forbids: false,
          details: JSON.stringify('234'),
        })

        await api.postOperations(operation)
        Bus.success('rule-manager.submitted-successfully')
        this.$router.push({ name: 'assets.systemAssets.index' })
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.hideConfirmation()
    },
    formatAction (val) {
      return this.isAccountRules
        ? accountRuleActionsFilter(val)
        : signerRuleActionsFilter(val)
    },
  },
}
</script>

<style lang="scss" scoped>

</style>
