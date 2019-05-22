<template>
  <form
    class="limits-manager__limits-list-inner"
    @submit.prevent="updateLimit"
    novalidate
  >
    <div class="limits-manager__limit-row">
      <span class="limits-manager__limit-type">
        Daily
      </span>

      <input-field
        type="number"
        class="limits-manager__limit-field"
        :class="{
          'limits-manager__limit-field--unlimited':
            limits.id
        }"
        v-model="form.dailyOut"
        @blur="touchField('form.dailyOut')"
        :error-message="getFieldErrorMessage('form.dailyOut')"
        min="0"
        :max="DEFAULT_MAX_AMOUNT"
        :step="DEFAULT_INPUT_STEP"
        :placeholder="limits.id ? 'Unlimited' : 'Not set'"
        :disabled="formMixin.isDisabled"
      />
    </div>

    <div class="limits-manager__limit-row">
      <span class="limits-manager__limit-type">
        Weekly
      </span>

      <input-field
        type="number"
        class="limits-manager__limit-field"
        :class="{
          'limits-manager__limit-field--unlimited':
            limits.id
        }"
        v-model="form.weeklyOut"
        @blur="touchField('form.weeklyOut')"
        :error-message="getFieldErrorMessage('form.weeklyOut')"
        min="0"
        :max="DEFAULT_MAX_AMOUNT"
        :step="DEFAULT_INPUT_STEP"
        :placeholder="limits.id ? 'Unlimited' : 'Not set'"
        :disabled="formMixin.isDisabled"
      />
    </div>

    <div class="limits-manager__limit-row">
      <span class="limits-manager__limit-type">
        Monthly
      </span>

      <input-field
        type="number"
        class="limits-manager__limit-field"
        :class="{
          'limits-manager__limit-field--unlimited':
            limits.id
        }"
        v-model="form.monthlyOut"
        @blur="touchField('form.monthlyOut')"
        :error-message="getFieldErrorMessage('form.monthlyOut')"
        min="0"
        :max="DEFAULT_MAX_AMOUNT"
        :step="DEFAULT_INPUT_STEP"
        :placeholder="limits.id ? 'Unlimited' : 'Not set'"
        :disabled="formMixin.isDisabled"
      />
    </div>

    <div class="limits-manager__limit-row">
      <span class="limits-manager__limit-type">
        Annual
      </span>

      <input-field
        type="number"
        class="limits-manager__limit-field"
        :class="{
          'limits-manager__limit-field--unlimited':
            limits.id
        }"
        v-model="form.annualOut"
        @blur="touchField('form.annualOut')"
        :error-message="getFieldErrorMessage('form.annualOut')"
        min="0"
        :max="DEFAULT_MAX_AMOUNT"
        :step="DEFAULT_INPUT_STEP"
        :placeholder="limits.id ? 'Unlimited' : 'Not set'"
        :disabled="formMixin.isDisabled"
      />
    </div>

    <div class="limits-manager__limits-action">
      <button
        class="limits-manager__update-btn app__btn app__btn--info"
        :disabled="formMixin.isDisabled"
      >
        Update
      </button>

      <button
        type="button"
        class="limits-manager__remove-btn
               app__btn app__btn-outline
               app__btn-outline--danger"
        :disabled="formMixin.isDisabled || limits.id === 0"
        @click="removeLimit"
      >
        Remove
      </button>
    </div>
  </form>
</template>

<script>
import FormMixin from '@/mixins/form.mixin'
import { decimal, minValue, maxValue, maxAmount } from '@/validators'

import { confirmAction } from '@/js/modals/confirmation_message'

import { base } from '@tokend/js-sdk'

import { DEFAULT_MAX_AMOUNT, DEFAULT_INPUT_STEP } from '@/constants'
import { LimitsRecord } from '@/js/records/limits.record'

import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'

const EVENTS = {
  limitsUpdated: 'limits-updated',
}

export default {
  name: 'limits-update-form',
  mixins: [FormMixin],

  props: {
    limits: { type: LimitsRecord, default: null },
    accountId: { type: String, default: '' },
    accountRole: { type: [Number, String], default: '' },
  },

  data: _ => ({
    form: {
      dailyOut: '',
      weeklyOut: '',
      monthlyOut: '',
      annualOut: '',
    },
    DEFAULT_MAX_AMOUNT,
    DEFAULT_INPUT_STEP,
  }),

  validations () {
    return {
      form: {
        dailyOut: {
          decimal,
          minValue: minValue(0),
          maxValue: maxValue(this.form.weeklyOut || DEFAULT_MAX_AMOUNT),
        },
        weeklyOut: {
          decimal,
          minValue: minValue(this.form.dailyOut),
          maxValue: maxValue(this.form.monthlyOut || DEFAULT_MAX_AMOUNT),
        },
        monthlyOut: {
          decimal,
          minValue: minValue(this.form.weeklyOut),
          maxValue: maxValue(this.form.annualOut || DEFAULT_MAX_AMOUNT),
        },
        annualOut: {
          decimal,
          minValue: minValue(this.form.monthlyOut),
          maxAmount,
        },
      },
    }
  },

  computed: {
    normalizedLimits () {
      let limits = { ...this.form }

      for (const [key, value] of Object.entries(limits)) {
        if (value === '') {
          limits[key] = DEFAULT_MAX_AMOUNT
        }
      }

      return limits
    },
  },

  watch: {
    limits: function () {
      this.populateForm()
    },
  },

  created () {
    if (this.limits) {
      this.populateForm()
    }
  },

  methods: {
    populateForm () {
      this.form.dailyOut = this.convertLimitAmount(this.limits.dailyOut)
      this.form.weeklyOut = this.convertLimitAmount(this.limits.weeklyOut)
      this.form.monthlyOut = this.convertLimitAmount(this.limits.monthlyOut)
      this.form.annualOut = this.convertLimitAmount(this.limits.annualOut)
    },

    convertLimitAmount (limit) {
      if (limit) {
        return limit >= DEFAULT_MAX_AMOUNT ? '' : limit
      } else {
        return ''
      }
    },

    async updateLimit () {
      if (!this.isFormValid() || !await confirmAction()) return

      this.disableForm()
      try {
        const operation = base.ManageLimitsBuilder.createLimits({
          ...this.limits,
          ...this.normalizedLimits,
          accountRole: this.accountRole || undefined,
          accountID: this.accountId || undefined,
        })
        await ApiCallerFactory
          .createCallerInstance()
          .postOperations(operation)

        this.$store.dispatch('SET_INFO', 'Limits update saved')
        this.$emit(EVENTS.limitsUpdated)
      } catch (e) {
        ErrorHandler.process(e)
      }
      this.enableForm()
    },

    async removeLimit () {
      if (!this.isFormValid() || !await confirmAction({
        title: 'Are you sure you want to delete the limit rule?',
      })) return

      this.disableForm()
      try {
        const operation = base.ManageLimitsBuilder.removeLimits({
          id: String(this.limits.id),
        })
        await ApiCallerFactory
          .createCallerInstance()
          .postOperations(operation)
        this.$store.dispatch('SET_INFO', 'Limits removed')
        this.$emit(EVENTS.limitsUpdated)
      } catch (e) {
        ErrorHandler.process(e)
      }
      this.enableForm()
    },
  },
}
</script>

<style lang="scss">
@import "~@/assets/scss/colors";

.limits-manager__limit-row {
  display: flex;
  align-items: center;
}

.limits-manager__limits-list {
  margin-bottom: 1.7rem;
}

.limits-manager__limit-type {
  margin-right: 1rem;
  min-width: 5rem;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 1.7rem 0 0.6rem 0;
}

.limits-manager__remove-btn {
  margin-left: 0.5rem;
}

.limits-manager__limits-action {
  display: flex;
  justify-content: space-between;
  margin-top: 1.7rem;
}

.limits-manager__update-btn,
.limits-manager__remove-btn {
  min-width: 9rem;
}

.limits-manager__limit-field--unlimited {
  & .input-field__input {
    &::placeholder {
      color: $color-text;
    }
  }
}
</style>
