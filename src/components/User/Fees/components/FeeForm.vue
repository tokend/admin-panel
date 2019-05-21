<template>
  <form
    class="fee-form app-list__li"
    @submit.prevent="updateFee"
  >
    <span class="app-list__cell fee-list__cell">
      <input-field
        type="number"
        min="0"
        :step="DEFAULT_INPUT_STEP"
        :disabled="formMixin.isDisabled || fee.exists"
        v-model="form.lowerBound"
        @blur="touchField('form.lowerBound')"
        :error-message="getFieldErrorMessage('form.lowerBound')"
      />
    </span>

    <span class="app-list__cell fee-list__cell">
      <input-field
        type="number"
        min="0"
        :max="DEFAULT_MAX_AMOUNT"
        :step="DEFAULT_INPUT_STEP"
        :disabled="formMixin.isDisabled || fee.exists"
        v-model="form.upperBound"
        @blur="touchField('form.upperBound')"
        :error-message="getFieldErrorMessage('form.upperBound')"
      />
      <button
        v-if="!fee.exists"
        class="fee-list__btn-max"
        type="button"
        @click="form.upperBound = DEFAULT_MAX_AMOUNT"
        :disabled="formMixin.isDisabled"
      >
        <mdi-arrow-up-icon />
      </button>
    </span>

    <span class="app-list__cell fee-list__cell">
      <input-field
        type="number"
        min="0"
        max="100"
        :step="DEFAULT_INPUT_STEP"
        :disabled="formMixin.isDisabled"
        v-model="form.percent"
        @blur="touchField('form.percent')"
        :error-message="getFieldErrorMessage('form.percent')"
      />
    </span>

    <span
      class="app-list__cell fee-list__cell"
      v-if="canSetFixedFee"
    >
      <input-field
        type="number"
        min="0"
        :step="DEFAULT_INPUT_STEP"
        :disabled="formMixin.isDisabled"
        v-model="form.fixed"
        @blur="touchField('form.fixed')"
        :error-message="getFieldErrorMessage('form.fixed')"
      />
    </span>

    <span class="app-list__cell fee-list__cell">
      <template v-if="fee.exists">
        <button
          class="app__btn app__btn--small"
          :disabled="formMixin.isDisabled"
        >
          Update
        </button>

        <button
          class="app__btn app__btn--small app__btn--danger"
          type="button"
          :disabled="formMixin.isDisabled"
          @click="deleteFee"
        >
          Delete
        </button>
      </template>

      <template v-else>
        <button
          class="app__btn app__btn--small"
          :disabled="formMixin.isDisabled"
        >
          Create
        </button>
      </template>
    </span>
  </form>
</template>

<script>
import FormMixin from '@/mixins/form.mixin'
import {
  required,
  requiredIf,
  minValue,
  maxValue,
  maxAmount,
} from '@/validators'

import { confirmAction } from '@/js/modals/confirmation_message'

import { Sdk } from '@/sdk'
import { ErrorHandler } from '@/utils/ErrorHandler'

import { xdrTypeFromValue } from '@/utils/xdrTypeFromValue'
import { DEFAULT_MAX_AMOUNT, DEFAULT_INPUT_STEP, FEE_TYPES } from '@/constants'

import 'mdi-vue/ArrowUpIcon'

const EVENTS = {
  feeUpdated: 'fee-updated',
}

export default {
  name: 'fee-form',
  mixins: [FormMixin],

  props: {
    fee: { type: Object, required: true },
    accountId: { type: String, default: '' },
    accountRole: { type: String, default: '' },
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
          minValue: minValue(this.form.upperBound),
          maxAmount,
        },
        fixed: {
          requiredIf: requiredIf(this.canSetFixedFee),
          minValue: minValue(1),
          maxAmount,
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
      return Number(this.fee.feeType) !== FEE_TYPES.offerFee &&
        Number(this.fee.feeType) !== FEE_TYPES.capitalDeploymentFee
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

    async updateFee (isDeleteMode) {
      if (!this.isFormValid() || !await confirmAction()) return

      this.disableForm()
      try {
        const opts = {
          fee: {
            feeType: xdrTypeFromValue('FeeType', Number(this.fee.feeType)),
            subtype: String(this.fee.subtype) || '0',
            asset: String(this.fee.asset),
            fixedFee: String(this.form.fixed),
            percentFee: String(this.form.percent),
            accountId: this.accountId,
            accountRole: this.accountRole,
            lowerBound: String(this.form.lowerBound),
            upperBound: String(this.form.upperBound),
          },
          isDelete: isDeleteMode,
        }
        const operation = Sdk.base.Operation.setFees(opts)

        await Sdk.horizon.transactions.submitOperations(operation)
        this.$store.dispatch('SET_INFO', 'Submitted successfully')
        this.$emit(EVENTS.feeUpdated)
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.enableForm()
    },

    async deleteFee (fee) {
      if (!await confirmAction({ title: 'Delete the fee rule?' })) return
      await this.updateFee(true)
    },
  },
}
</script>

<style>
.fee-list__cell > .input-field > .input-field__label {
  display: none;
}

.fee-list__cell > .input-field > .input-field__input {
  padding-top: 0.7rem;
}
</style>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors";

.fee-list__cell.app-list__cell {
  display: inline-flex;
  align-items: stretch;

  & > .app__btn.app__btn--small {
    padding: 0;
    min-width: inherit;
  }

  & > .app__btn + .app__btn {
    margin-left: 1rem;
  }
}

.fee-list__li--hidden-form {
  flex: 0;
  opacity: 0;
}

.fee-list__btn-max {
  display: flex;
  justify-content: center;
  min-width: 2rem;

  &:enabled:hover {
    opacity: 0.8;
    cursor: pointer;
  }

  & > svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  &:disabled {
    fill: $color-unfocused;
    cursor: default;
  }
}
</style>
