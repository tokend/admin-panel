<template>
  <div class="asset-pair-creator">
    <form
      class="asset-pair-creator__form app__block"
      @submit.prevent="isFormValid() && showConfirmation()"
      novalidate
    >
      <h2>{{ "asset-pair-creator.create-pair" | globalize }}</h2>

      <div class="asset-pair-creator__form-row app__form-row">
        <input-field
          class="app__form-field"
          label="Base"
          v-model="form.base"
          @blur="touchField('form.base')"
          :error-message="
            getFieldErrorMessage('form.base', { value: form.quote })
          "
          :disabled="formMixin.isDisabled"
        />

        <input-field
          class="app__form-field"
          label="Quote"
          v-model="form.quote"
          @blur="touchField('form.quote')"
          :error-message="
            getFieldErrorMessage('form.quote', { value: form.base })
          "
          :disabled="formMixin.isDisabled"
        />
      </div>

      <div class="asset-pair-creator__form-row app__form-row">
        <input-field
          class="app__form-field"
          label="Price"
          type="number"
          min="0"
          :step="DEFAULT_INPUT_STEP"
          v-model="form.physicalPrice"
          @blur="touchField('form.physicalPrice')"
          :error-message="
            getFieldErrorMessage('form.physicalPrice', {
              minValue: DEFAULT_INPUT_MIN,
              maxValue: DEFAULT_MAX_AMOUNT
            })
          "
          :disabled="formMixin.isDisabled"
        />
      </div>

      <div class="asset-pair-creator__form-row app__form-row">
        <input-field
          class="app__form-field"
          label="Physical price correction"
          type="number"
          min="0"
          :step="DEFAULT_INPUT_STEP"
          v-model="form.physicalPriceCorrection"
          @blur="touchField('form.physicalPriceCorrection')"
          :error-message="
            getFieldErrorMessage('form.physicalPriceCorrection', {
              minValue: 0,
              maxValue: DEFAULT_MAX_AMOUNT
            })
          "
          :disabled="formMixin.isDisabled"
        >
          <template slot="help">
            <p class="asset-pair-creator__tip-message">
              <span>
                {{ "asset-pair-creator.message" | globalize }}
              </span>
              <strong>{{
                "asset-pair-creator.message-prise" | globalize
              }}</strong>
            </p>
          </template>
        </input-field>

        <input-field
          class="app__form-field"
          label="Max price step (0-100%)"
          type="number"
          min="0"
          max="100"
          :step="DEFAULT_INPUT_STEP"
          v-model="form.maxPriceStep"
          @blur="touchField('form.maxPriceStep')"
          :error-message="
            getFieldErrorMessage('form.maxPriceStep', {
              minValue: 0,
              maxValue: 100
            })
          "
          :disabled="formMixin.isDisabled"
        >
          <template slot="help">
            <p class="asset-pair-creator__tip-message">
              <span>
                {{ "asset-pair-creator.message-offer" | globalize }}
              </span>
              <strong>{{
                "asset-pair-creator.message-offer-prise" | globalize
              }}</strong>
            </p>
          </template>
        </input-field>
      </div>

      <div class="asset-pair-creator__checkboxes">
        <div class="asset-pair-creator__checkbox">
          <tick-field
            v-model="form.policies"
            :disabled="formMixin.isDisabled"
            :required="false"
            label="Is tradable"
            :cb-value="ASSET_PAIR_POLICIES.tradeableSecondaryMarket"
          >
            <template slot="help">
              <span class="asset-pair-creator__tip-message">
                {{ "asset-pair-creator.asset-pair-message-trade" | globalize }}
              </span>
            </template>
          </tick-field>
        </div>

        <div class="asset-pair-creator__checkbox">
          <tick-field
            v-model="form.policies"
            :disabled="formMixin.isDisabled"
            :required="false"
            label="Physical price restriction"
            :cb-value="ASSET_PAIR_POLICIES.physicalPriceRestriction"
          >
            <template slot="help">
              <span class="asset-pair-creator__tip-message">
                {{
                  "asset-pair-creator.asset-pair-message-new-offer" | globalize
                }}
              </span>
            </template>
          </tick-field>
        </div>

        <div class="asset-pair-creator__checkbox">
          <tick-field
            v-model="form.policies"
            :disabled="formMixin.isDisabled"
            :required="false"
            label="Current price restriction"
            :cb-value="ASSET_PAIR_POLICIES.currentPriceRestriction"
          >
            <template slot="help">
              <p class="asset-pair-creator__tip-message">
                <span>
                  <!-- eslint-disable-next-line max-len -->
                  {{ "asset-pair-creator.asset-pair-message-prise-interval" | globalize }}
                </span>
                <!-- eslint-disable-next-line max-len -->
                <strong>{{ "asset-pair-creator.asset-pair-message-prise" | globalize }}</strong>
              </p>
            </template>
          </tick-field>
        </div>
      </div>

      <div class="app__form-actions">
        <form-confirmation
          v-if="formMixin.isConfirmationShown"
          :is-pending="isFormSubmitting"
          @ok="submit"
          @cancel="hideConfirmation"
        />

        <button
          v-else
          class="asset-pair-creator__submit-btn app__btn"
          :disabled="formMixin.isDisabled"
        >
          {{ "asset-pair-creator.asset-pair-create-btn" | globalize }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import FormMixin from '@/mixins/form.mixin'
import { required, minValue, maxValue, not, sameAs } from '@/validators'

import {
  ASSET_PAIR_POLICIES,
  DEFAULT_INPUT_STEP,
  DEFAULT_MAX_AMOUNT,
  DEFAULT_INPUT_MIN,
} from '@/constants'
import apiHelper from '@/apiHelper'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/bus'

export default {
  mixins: [FormMixin],

  data: _ => ({
    form: {
      base: '',
      quote: '',
      policies: [],
      maxPriceStep: '',
      physicalPrice: '',
      physicalPriceCorrection: '',
    },
    isFormSubmitting: false,
    ASSET_PAIR_POLICIES,
    DEFAULT_INPUT_STEP,
    DEFAULT_INPUT_MIN,
    DEFAULT_MAX_AMOUNT,
  }),

  validations () {
    return {
      form: {
        base: {
          required,
          not: not(
            sameAs(function () {
              return this.form.quote
            })
          ),
        },
        quote: {
          required,
          not: not(
            sameAs(function () {
              return this.form.base
            })
          ),
        },
        physicalPrice: {
          required,
          minValue: minValue(DEFAULT_INPUT_MIN),
          maxValue: maxValue(DEFAULT_MAX_AMOUNT),
        },
        maxPriceStep: {
          required,
          minValue: minValue(0),
          maxValue: maxValue(100),
        },
        physicalPriceCorrection: {
          required,
          minValue: minValue(0),
          maxValue: maxValue(DEFAULT_MAX_AMOUNT),
        },
      },
    }
  },

  methods: {
    async submit () {
      this.isFormSubmitting = true
      try {
        await apiHelper.assets.createPair({
          ...this.form,
          policies: this.form.policies.reduce((sum, policy) => sum | policy, 0),
        })

        Bus.success('Pair has been created.')
        this.$router.push({ name: 'assets.assetPairs.index' })
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isFormSubmitting = false
      this.hideConfirmation()
    },
  },
}
</script>

<style scoped>
.asset-pair-creator__checkboxes {
  margin: 3.5rem 0 5rem;
}

.asset-pair-creator__checkbox {
  margin-bottom: 1rem;
  display: flex;
}

.asset-pair-creator__tip-message {
  min-width: 20rem;
}
</style>
