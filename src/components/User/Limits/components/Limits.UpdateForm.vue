<template>
  <form
    class="update-limits-form"
    @submit.prevent="isFormValid() && showConfirmation()"
    novalidate
  >
    <div class="update-limits-form__row">
      <span class="update-limits-form__limit-type">
        {{ "limits-update-form.daily" | globalize }}
      </span>

      <input-field
        class="update-limits-form__field"
        :class="{
          'update-limits-form__field--unlimited':
            limits.id
        }"
        v-model="form.dailyOut"
        @blur="touchField('form.dailyOut')"
        :error-message="getFieldErrorMessage(
          'form.dailyOut',
          {
            minValue: DEFAULT_MAX_AMOUNT,
            maxValue: form.weeklyOut || DEFAULT_MAX_AMOUNT
          }
        )"
        :placeholder="checkLimitsId | globalize"
        :disabled="formMixin.isDisabled"
        type="number"
        step="0.000001"
        :max="form.weeklyOut || DEFAULT_MAX_AMOUNT"
        min="0"
      />
    </div>

    <div class="update-limits-form__row">
      <span class="update-limits-form__limit-type">
        {{ "limits-update-form.weekly" | globalize }}
      </span>

      <input-field
        class="update-limits-form__field"
        :class="{
          'update-limits-form__field--unlimited':
            limits.id
        }"
        v-model="form.weeklyOut"
        @blur="touchField('form.weeklyOut')"
        :error-message="getFieldErrorMessage(
          'form.weeklyOut',
          {
            minValue: form.dailyOut || DEFAULT_MAX_AMOUNT,
            maxValue: form.monthlyOut || DEFAULT_MAX_AMOUNT
          }
        )"
        :placeholder="checkLimitsId | globalize"
        :disabled="formMixin.isDisabled"
        type="number"
        step="0.000001"
        :max="form.monthlyOut || DEFAULT_MAX_AMOUNT"
        min="0"
      />
    </div>

    <div class="update-limits-form__row">
      <span class="update-limits-form__limit-type">
        {{ "limits-update-form.monthly" | globalize }}
      </span>

      <input-field
        class="update-limits-form__field"
        :class="{
          'update-limits-form__field--unlimited':
            limits.id
        }"
        v-model="form.monthlyOut"
        @blur="touchField('form.monthlyOut')"
        :error-message="getFieldErrorMessage(
          'form.monthlyOut',
          {
            minValue: form.weeklyOut || DEFAULT_MAX_AMOUNT,
            maxValue: form.annualOut || DEFAULT_MAX_AMOUNT
          }
        )"
        :placeholder="checkLimitsId | globalize"
        :disabled="formMixin.isDisabled"
        type="number"
        step="0.000001"
        :max="form.annualOut || DEFAULT_MAX_AMOUNT"
        min="0"
      />
    </div>

    <div class="update-limits-form__row">
      <span class="update-limits-form__limit-type">
        {{ "limits-update-form.annual" | globalize }}
      </span>

      <input-field
        class="update-limits-form__field"
        :class="{
          'update-limits-form__field--unlimited':
            limits.id
        }"
        v-model="form.annualOut"
        @blur="touchField('form.annualOut')"
        :error-message="getFieldErrorMessage(
          'form.annualOut',
          {
            minValue: form.monthlyOut || DEFAULT_MAX_AMOUNT,
            maxValue: DEFAULT_MAX_AMOUNT
          }
        )"
        :placeholder="checkLimitsId | globalize"
        :disabled="formMixin.isDisabled"
        type="number"
        step="0.000001"
        :max="DEFAULT_MAX_AMOUNT"
        min="0"
      />
    </div>

    <div class="update-limits-form__actions">
      <form-confirmation
        v-if="formMixin.isConfirmationShown"
        :is-pending="isFormSubmitting"
        :message="'limits-update-form.msg-sure' | globalize"
        ok-button-text="Yes"
        cancel-button-text="No"
        @ok="submit"
        @cancel="hideConfirmation"
      />

      <template v-else>
        <button
          class="update-limits-form__update-btn app__btn app__btn--info"
          :disabled="formMixin.isDisabled"
          @click="isDeleteMode = false"
        >
          {{ "limits-update-form.btn-update" | globalize }}
        </button>

        <button
          class="update-limits-form__remove-btn
                app__btn app__btn-outline
                app__btn-outline--danger"
          :disabled="formMixin.isDisabled || limits.id === 0"
          @click="isDeleteMode = true"
        >
          {{ "limits-update-form.btn-remove" | globalize }}
        </button>
      </template>
    </div>
  </form>
</template>

<script>
import FormMixin from '@/mixins/form.mixin'
import { decimal, minValue, maxValue } from '@/validators'

import { base } from '@tokend/js-sdk'

import { DEFAULT_MAX_AMOUNT, DEFAULT_INPUT_STEP } from '@/constants'
import { LimitsRecord } from '@/js/records/limits.record'

import { api } from '@/api'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/bus'

import { MathUtil } from '@/utils/math.util'

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
    isFormSubmitting: false,
    isDeleteMode: false,
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
          minValue: minValue(this.form.dailyOut || DEFAULT_MAX_AMOUNT),
          maxValue: maxValue(this.form.monthlyOut || DEFAULT_MAX_AMOUNT),
        },
        monthlyOut: {
          decimal,
          minValue: minValue(this.form.weeklyOut || DEFAULT_MAX_AMOUNT),
          maxValue: maxValue(this.form.annualOut || DEFAULT_MAX_AMOUNT),
        },
        annualOut: {
          decimal,
          minValue: minValue(this.form.monthlyOut || DEFAULT_MAX_AMOUNT),
          maxValue: maxValue(DEFAULT_MAX_AMOUNT),
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

    checkLimitsId () {
      return this.limits.id
        ? 'limits-update-form.placeholder-unlimited'
        : 'limits-update-form.placeholder-not-set'
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
      this.form.dailyOut = this.normalizeLimitAmount(this.limits.dailyOut)
      this.form.weeklyOut = this.normalizeLimitAmount(this.limits.weeklyOut)
      this.form.monthlyOut = this.normalizeLimitAmount(this.limits.monthlyOut)
      this.form.annualOut = this.normalizeLimitAmount(this.limits.annualOut)
    },

    normalizeLimitAmount (amount) {
      if (amount) {
        return MathUtil.compare(amount, DEFAULT_MAX_AMOUNT) >= 0
          ? ''
          : amount
      } else {
        return ''
      }
    },

    async submit () {
      this.isFormSubmitting = true

      if (this.isDeleteMode) {
        await this.removeLimit()
      } else {
        await this.updateLimit()
      }

      this.isFormSubmitting = false
      this.hideConfirmation()
    },

    async updateLimit () {
      try {
        const operation = base.ManageLimitsBuilder.createLimits({
          ...this.limits,
          ...this.normalizedLimits,
          accountRole: this.accountRole || undefined,
          accountID: this.accountId || undefined,
        })
        await api.postOperations(operation)

        Bus.success('limits-update-form.limits-update-saved')
        this.$emit(EVENTS.limitsUpdated)
      } catch (e) {
        ErrorHandler.process(e)
      }
    },

    async removeLimit () {
      try {
        const operation = base.ManageLimitsBuilder.removeLimits({
          id: String(this.limits.id),
        })

        await api.postOperations(operation)
        Bus.success('limits-update-form.limits-removed')
        this.$emit(EVENTS.limitsUpdated)
      } catch (e) {
        ErrorHandler.process(e)
      }
    },
  },
}
</script>

<style lang="scss">
@import "~@/assets/scss/colors";

.update-limits-form__row {
  display: flex;
  align-items: center;
}

.limits-manager__limits-list {
  margin-bottom: 1.7rem;
}

.update-limits-form__limit-type {
  margin-right: 1rem;
  min-width: 5rem;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 1.7rem 0 0.6rem 0;
}

.update-limits-form__remove-btn {
  margin-left: 0.5rem;
}

.update-limits-form__actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1.7rem;
}

.update-limits-form__update-btn,
.update-limits-form__remove-btn {
  min-width: 9rem;
}

.update-limits-form__field--unlimited {
  & .input-field__input {
    &::placeholder {
      color: $color-text;
    }
  }
}
</style>
