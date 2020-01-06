<template>
  <form class="fee-form app-list__li" @submit.prevent="updateFee">
    <span class="fee-form__cell app-list__cell">
      <input-field
        type="number"
        min="0"
        :step="DEFAULT_INPUT_STEP"
        :disabled="formMixin.isDisabled || fee.exists"
        v-model="form.lowerBound"
        @blur="touchField('form.lowerBound')"
        :error-message="
          getFieldErrorMessage('form.lowerBound', {
            minValue: 0,
            maxValue: form.upperBound
          })
        "
      />
    </span>

    <span class="fee-form__cell app-list__cell">
      <input-field
        type="number"
        min="0"
        :max="DEFAULT_MAX_AMOUNT"
        :step="DEFAULT_INPUT_STEP"
        :disabled="formMixin.isDisabled || fee.exists"
        v-model="form.upperBound"
        @blur="touchField('form.upperBound')"
        :error-message="
          getFieldErrorMessage('form.upperBound', {
            minValue: form.lowerBound,
            maxValue: DEFAULT_MAX_AMOUNT
          })
        "
      />
      <button
        v-if="!fee.exists"
        class="fee-list__btn-max"
        type="button"
        @click="form.upperBound = DEFAULT_MAX_AMOUNT"
        :disabled="formMixin.isDisabled"
      >
        <i class="mdi mdi-arrow-up" />
      </button>
    </span>

    <span class="fee-form__cell app-list__cell">
      <input-field
        type="number"
        min="0"
        max="100"
        :step="DEFAULT_INPUT_STEP"
        :disabled="formMixin.isDisabled"
        v-model="form.percent"
        @blur="touchField('form.percent')"
        :error-message="
          getFieldErrorMessage('form.percent', { minValue: 0, maxValue: 100 })
        "
      />
    </span>

    <span class="fee-form__cell app-list__cell" v-if="canSetFixedFee">
      <input-field
        type="number"
        min="0"
        :step="DEFAULT_INPUT_STEP"
        :disabled="formMixin.isDisabled"
        v-model="form.fixed"
        @blur="touchField('form.fixed')"
        :error-message="
          getFieldErrorMessage('form.fixed', {
            minValue: 0,
            maxValue: DEFAULT_MAX_AMOUNT
          })
        "
      />
    </span>

    <span class="fee-form__cell app-list__cell">
      <template v-if="fee.exists">
        <button
          class="app__btn app__btn--small fee-form__btn"
          :disabled="formMixin.isDisabled"
        >
          {{ "fee-form.btn-update" | globalize }}
        </button>

        <button
          class="app__btn app__btn--small app__btn--danger fee-form__btn"
          type="button"
          :disabled="formMixin.isDisabled"
          @click="updateFee({ isDeleteMode: true })"
        >
          {{ "fee-form.btn-delete" | globalize }}
        </button>
      </template>

      <template v-else>
        <button
          class="app__btn app__btn--small fee-form__btn"
          :disabled="formMixin.isDisabled"
        >
          {{ "fee-form.btn-create" | globalize }}
        </button>
      </template>
    </span>
  </form>
</template>

<script>
import FormMixin from '@/mixins/form.mixin'
import { required, requiredIf, minValue, maxValue } from '@/validators'

import { confirmAction } from '@/js/modals/confirmation_message'

import { base } from '@tokend/js-sdk'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/bus'

import { xdrTypeFromValue } from '@/utils/xdrTypeFromValue'
import {
  DEFAULT_INPUT_MIN,
  DEFAULT_MAX_AMOUNT,
  DEFAULT_INPUT_STEP,
  FEE_TYPES,
} from '@/constants'

import { api } from '@/api'

const EVENTS = {
  feeUpdated: 'fee-updated',
}

export default {
  name: 'fee-form',
  mixins: [FormMixin],

  props: {
    fee: { type: Object, required: true },
    accountId: { type: String, default: '' },
    accountRole: { type: [Number, String], default: '' },
  },

  data () {
    return {
      form: {
        lowerBound: '0',
        upperBound: '0',
        fixed: '0',
        percent: '0',
      },
      FEE_TYPES,
      DEFAULT_INPUT_MIN,
      DEFAULT_MAX_AMOUNT,
      DEFAULT_INPUT_STEP,
    }
  },

  validations () {
    return {
      form: {
        lowerBound: {
          required,
          minValue: minValue(0),
          maxValue: maxValue(this.form.upperBound),
        },
        upperBound: {
          required,
          minValue: minValue(this.form.lowerBound),
          maxValue: maxValue(DEFAULT_MAX_AMOUNT),
        },
        fixed: {
          required: requiredIf(function () {
            return this.canSetFixedFee
          }),
          minValue: minValue(0),
          maxValue: maxValue(DEFAULT_MAX_AMOUNT),
        },
        percent: {
          required,
          minValue: minValue(0),
          maxValue: maxValue(100),
        },
      },
    }
  },

  computed: {
    canSetFixedFee () {
      return (
        Number(this.fee.feeType) !== FEE_TYPES.offerFee &&
        Number(this.fee.feeType) !== FEE_TYPES.capitalDeploymentFee &&
        Number(this.fee.feeType) !== FEE_TYPES.investFee
      )
    },
  },

  watch: {
    fee: function () {
      this.populateForm()
    },
  },

  created () {
    this.populateForm()
  },

  methods: {
    populateForm () {
      this.form.lowerBound = this.fee.lowerBound
      this.form.upperBound = this.fee.upperBound
      this.form.percent = this.fee.percent
      this.form.fixed = this.fee.fixed
    },

    async updateFee ({ isDeleteMode }) {
      if (!this.isFormValid() || !(await confirmAction())) return

      this.disableForm()
      try {
        const opts = {
          fee: {
            feeType: xdrTypeFromValue('FeeType', Number(this.fee.feeType)),
            subtype: String(this.fee.subtype) || '0',
            asset: String(this.fee.asset),
            fixedFee: String(this.form.fixed),
            percentFee: String(this.form.percent),
            accountId: this.accountId || undefined,
            accountRole: this.accountRole
              ? String(this.accountRole)
              : undefined,
            lowerBound: String(this.form.lowerBound),
            upperBound: String(this.form.upperBound),
          },
          isDelete: isDeleteMode,
        }
        const operation = base.Operation.setFees(opts)

        await api.postOperations(operation)
        Bus.success('Submitted successfully')
        this.$emit(EVENTS.feeUpdated)
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.enableForm()
    },
  },
}
</script>

<style lang="scss">
@import "~@/assets/scss/colors";

.fee-form__cell > .input-field > .input-field__label {
  display: none;
}

.fee-form__cell > .input-field > .input-field__input {
  padding-top: 0.7rem;
}

.fee-form__btn {
  max-height: 3.4rem;
  height: 100%;
}

.fee-form__cell.app-list__cell {
  display: inline-flex;
  align-items: flex-start;
  white-space: normal;

  & > .app__btn.app__btn--small {
    padding: 0;
    min-width: inherit;
  }

  & > .app__btn + .app__btn {
    margin-left: 1rem;
  }
}

.fee-list__btn-max {
  display: flex;
  justify-content: center;
  min-width: 2rem;
  margin-top: 1.2rem;

  &:enabled:hover {
    opacity: 0.8;
    cursor: pointer;
  }

  & > i {
    font-size: 1.8rem;
    vertical-align: middle;
  }

  &:disabled {
    fill: $color-unfocused;
    cursor: default;
  }
}
</style>
