<template>
  <div class="asset-pair-manager">
    <template v-if="isLoaded">
      <form
        @submit.prevent="updatePrice"
        class="asset-pair-manager__form app__block"
      >
        <h2>Update {{ base }}/{{ quote }} pair price</h2>

        <div class="asset-pair-manager__form-row app__form-row">
          <input-field
            class="app__form-field"
            :label="`Price (${pair.quote})`"
            type="number"
            :min="DEFAULT_INPUT_MIN"
            :step="DEFAULT_INPUT_STEP"
            v-model="priceForm.price"
            @blur="touchField('priceForm.price')"
            :error-message="getFieldErrorMessage(
              'priceForm.price',
              {
                minValue: DEFAULT_INPUT_MIN,
                maxValue: DEFAULT_MAX_AMOUNT
              }
            )"
            :disabled="formMixin.isDisabled"
          />
        </div>

        <div class="app__form-actions">
          <button
            class="asset-pair-manager__submit-btn app__btn"
            :disabled="formMixin.isDisabled">
            Update
          </button>
        </div>
      </form>
    </template>

    <template v-if="isLoaded">
      <form
        @submit.prevent="updateAttributes"
        class="asset-pair-manager__form app__block"
      >
        <h2>Update {{ base }}/{{ quote }} pair attributes</h2>

        <div class="asset-pair-manager__form-row app__form-row">
          <input-field
            class="app__form-field"
            label="Physical price correction"
            type="number"
            min="0"
            :step="DEFAULT_INPUT_STEP"
            v-model="attributesForm.physicalPriceCorrection"
            @blur="touchField('attributesForm.physicalPriceCorrection')"
            :error-message="getFieldErrorMessage(
              'attributesForm.physicalPriceCorrection',
              { minValue: 0, maxValue: DEFAULT_MAX_AMOUNT }
            )"
            :disabled="formMixin.isDisabled"
          >
            <template slot="help">
              <p class="asset-pair-manager__tip-message">
                <span>
                  The correction of physical price in percents.
                  If physical price and restriction by physical price are set,
                  minimum price for this pair offer will be
                </span>
                <strong>physicalPrice * physicalPriceCorrection</strong>
              </p>
            </template>
          </input-field>
        </div>

        <div class="asset-pair-manager__form-row app__form-row">
          <input-field
            class="app__form-field"
            label="Max price step"
            type="number"
            min="0"
            max="100"
            :step="DEFAULT_INPUT_STEP"
            v-model="attributesForm.maxPriceStep"
            @blur="touchField('attributesForm.maxPriceStep')"
            :error-message="getFieldErrorMessage(
              'attributesForm.maxPriceStep',
              { minValue: 0, maxValue: 100 }
            )"
            :disabled="formMixin.isDisabled"
          >
            <template slot="help">
              <p class="asset-pair-manager__tip-message">
                <span>
                  Maximum offer price step in percents.
                  If current price restriction is set,
                  the users are allowed to set an offer with price in interval
                </span>
                <strong>(1 ± maxPriceStep) * currentPrice</strong>
              </p>
            </template>
          </input-field>
        </div>

        <div class="asset-pair-manager__checkboxes">
          <tick-field
            class="asset-pair-manager__checkbox"
            v-model="attributesForm.policies"
            :disabled="formMixin.isDisabled"
            :required="false"
            label="Is tradable"
            :cb-value="ASSET_PAIR_POLICIES.tradeableSecondaryMarket"
          >
            <template slot="help">
              <span class="asset-pair-manager__tip-message">
                Allowed to trade this pair on secondary market
              </span>
            </template>
          </tick-field>

          <tick-field
            class="asset-pair-manager__checkbox"
            v-model="attributesForm.policies"
            :disabled="formMixin.isDisabled"
            :required="false"
            label="Physical price restriction"
            :cb-value="ASSET_PAIR_POLICIES.physicalPriceRestriction"
          >
            <template slot="help">
              <span class="asset-pair-manager__tip-message">
                If set, then prices for new offers must be greater
                than physical price with correction
              </span>
            </template>
          </tick-field>

          <tick-field
            class="asset-pair-manager__checkbox"
            v-model="attributesForm.policies"
            :disabled="formMixin.isDisabled"
            :required="false"
            label="Current price restriction"
            :cb-value="ASSET_PAIR_POLICIES.currentPriceRestriction"
          >
            <template slot="help">
              <p class="asset-pair-manager__tip-message">
                <span>
                  If set, then price for new offers must be in interval of
                </span>
                <strong>(1 ± maxPriceStep) * currentPrice</strong>
              </p>
            </template>
          </tick-field>
        </div>

        <button
          class="asset-pair-manager__submit-btn app__btn"
          :disabled="formMixin.isDisabled"
        >
          Update policy
        </button>
      </form>
    </template>

    <template v-else>
      <p>
        Loading...
      </p>
    </template>
  </div>
</template>

<script>
import FormMixin from '@/mixins/form.mixin'
import { required, minValue, maxValue } from '@/validators'

import { confirmAction } from '@/js/modals/confirmation_message'

import api from '@/api'
import { Sdk } from '@/sdk'

import {
  DEFAULT_INPUT_STEP,
  DEFAULT_MAX_AMOUNT,
  DEFAULT_INPUT_MIN,
} from '@/constants'
import { ASSET_PAIR_POLICIES } from '@/constants/'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/state-bus'

export default {
  mixins: [FormMixin],

  props: {
    base: { type: String, required: true },
    quote: { type: String, required: true },
  },

  data () {
    return {
      pair: {},
      priceForm: {
        price: '',
      },
      attributesForm: {
        physicalPriceCorrection: '',
        maxPriceStep: '',
        policies: [],
      },
      isLoaded: false,
      ASSET_PAIR_POLICIES,
      DEFAULT_INPUT_STEP,
      DEFAULT_INPUT_MIN,
      DEFAULT_MAX_AMOUNT,
    }
  },

  validations () {
    return {
      priceForm: {
        price: {
          required,
          minValue: minValue(DEFAULT_INPUT_MIN),
          maxValue: maxValue(DEFAULT_MAX_AMOUNT),
        },
      },
      attributesForm: {
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

  async created () {
    await this.getPair()
    this.priceForm.price = this.pair.physicalPrice
    this.attributesForm.physicalPriceCorrection =
      this.pair.physicalPriceCorrection
    this.attributesForm.maxPriceStep = this.pair.maxPriceStep
    this.attributesForm.policies = this.pair.policies
      .map(policy => policy.value)
  },

  methods: {
    async getPair () {
      this.isLoaded = false
      try {
        const response = await Sdk.horizon.assetPairs.getAll()
        this.pair = response.data
          .find(({ base, quote }) => {
            return base === this.base && quote === this.quote
          })
        this.isLoaded = true
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async updatePrice () {
      if (!this.isFormValid('priceForm')) return

      this.pair.physicalPrice = this.priceForm.price
      this.pair.policies = this.attributesForm.policies
        .reduce((sum, policy) => sum | policy, 0)
      this.submit({ updatePrice: true })
    },

    async updateAttributes () {
      if (!this.isFormValid('attributesForm')) return

      this.pair.physicalPriceCorrection =
        this.attributesForm.physicalPriceCorrection
      this.pair.maxPriceStep = this.attributesForm.maxPriceStep

      this.pair.policies = this.attributesForm.policies
        .reduce((sum, policy) => sum | policy, 0)
      this.submit({ updatePolicy: true })
    },

    async submit (action) {
      if (!await confirmAction()) return
      this.disableForm()
      try {
        await api.assets.updatePair({ ...this.pair, ...action })
        Bus.success('Pair has been updated.')
        this.$router.push({ name: 'assets.assetPairs.index' })
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.enableForm()
    },
  },
}
</script>

<style scoped>
.asset-pair-manager {
  display: flex;
  justify-content: center;
}

.asset-pair-manager__form {
  margin-right: 30px;
  height: 100%;
}

.asset-pair-manager__checkboxes {
  margin: 4.5rem 0 4rem;
}

.asset-pair-manager__checkbox {
  margin: 0 0 1rem;
}

.asset-pair-manager__tip-message {
  min-width: 20rem;
}
</style>
