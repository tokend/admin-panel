<template>
  <div class="asset-pair-creator">
    <form @submit.prevent="submit" class="asset-pair-creator__form app__block">
      <h2>Create asset pair</h2>

      <div class="asset-pair-creator__form-row app__form-row">
        <input-field
          class="app__form-field"
          label="Base"
          v-model="form.base"
          :disabled="isPending"
        />

        <input-field
          class="app__form-field"
          label="Quote"
          v-model="form.quote"
          :disabled="isPending"
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
          :disabled="isPending"
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
          :disabled="isPending"
          show-help
        >
          <p class="asset-pair-creator__tip-message">
            <span>
              The correction of physical price in percents.
              If physical price and restriction by physical price are set,
              minimum price for this pair offer will be
            </span>
            <strong>physicalPrice * physicalPriceCorrection</strong>
          </p>
        </input-field>

        <input-field
          class="app__form-field"
          label="Max price step"
          type="number"
          min="0"
          :step="DEFAULT_INPUT_STEP"
          v-model="form.maxPriceStep"
          :disabled="isPending"
          show-help
        >
          <p class="asset-pair-creator__tip-message">
            <span>
              Maximum offer price step in percents.
              If current price restriction is set,
              the users are allowed to set an offer with price in interval
            </span>
            <strong>(1 ± maxPriceStep) * currentPrice</strong>
          </p>
        </input-field>
      </div>

      <div class="asset-pair-creator__checkboxes">
        <div class="asset-pair-creator__checkbox">
          <tick-field
            v-model="form.policies"
            :disabled="isPending"
            :required="false"
            label="Is tradable"
            :cb-value="ASSET_PAIR_POLICIES.tradeableSecondaryMarket"
            show-help
          >
            <span class="asset-pair-creator__tip-message">
              Allowed to trade this pair on secondary market
            </span>
          </tick-field>
        </div>

        <div class="asset-pair-creator__checkbox">
          <tick-field
            v-model="form.policies"
            :disabled="isPending"
            :required="false"
            label="Physical price restriction"
            :cb-value="ASSET_PAIR_POLICIES.physicalPriceRestriction"
            show-help
          >
            <span class="asset-pair-creator__tip-message">
              If set, then prices for new offers must be greater
              than physical price with correction
            </span>
          </tick-field>
        </div>

        <div class="asset-pair-creator__checkbox">
          <tick-field
            v-model="form.policies"
            :disabled="isPending"
            :required="false"
            label="Current price restriction"
            :cb-value="ASSET_PAIR_POLICIES.currentPriceRestriction"
            show-help
          >
            <p class="asset-pair-creator__tip-message">
              <span>
                If set, then price for new offers must be in interval of
              </span>
              <strong>(1 ± maxPriceStep) * currentPrice</strong>
            </p>
          </tick-field>
        </div>
      </div>

      <div class="app__form-actions">
        <button
          class="asset-pair-creator__submit-btn app__btn"
          :disabled="isPending">
          Create
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { TickField, InputField } from '@comcom/fields'

import { ASSET_PAIR_POLICIES, DEFAULT_INPUT_STEP } from '../../../../../constants'
import api from '@/api'

import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    TickField,
    InputField,
  },

  data: _ => ({
    form: {
      base: '',
      quote: '',
      policies: [],
      maxPriceStep: '',
      physicalPrice: '',
      physicalPriceCorrection: '',
    },
    isPending: false,
    ASSET_PAIR_POLICIES,
    DEFAULT_INPUT_STEP,
  }),

  methods: {
    async submit () {
      if (!window.confirm('Please confirm this action')) return
      this.isPending = true
      try {
        await api.assets.createPair({
          ...this.form,
          policies: this.form.policies.reduce((sum, policy) => sum | policy, 0),
        })

        this.$store.dispatch('SET_INFO', 'Pair has been created.')
        this.$router.push({ name: 'assets.assetPairs.index' })
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isPending = false
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
