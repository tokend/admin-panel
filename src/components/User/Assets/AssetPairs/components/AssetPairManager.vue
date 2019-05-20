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
            min="0"
            :step="DEFAULT_INPUT_STEP"
            v-model="form.price"
            :disabled="isSubmitting"
          />
        </div>

        <div class="app__form-actions">
          <button
            class="asset-pair-manager__submit-btn app__btn"
            :disabled="isSubmitting">
            Update
          </button>
        </div>
      </form>
    </template>

    <template v-if="isLoaded">
      <form
        @submit.prevent="updatePolicy"
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
            v-model="form.physicalPriceCorrection"
            :disabled="isSubmitting"
            show-help
          >
            <p class="asset-pair-manager__tip-message">
              <span>
                The correction of physical price in percents.
                If physical price and restriction by physical price are set,
                minimum price for this pair offer will be
              </span>
              <strong>physicalPrice * physicalPriceCorrection</strong>
            </p>
          </input-field>
        </div>

        <div class="asset-pair-manager__form-row app__form-row">
          <input-field
            class="app__form-field"
            label="Max price step"
            type="number"
            min="0"
            :step="DEFAULT_INPUT_STEP"
            v-model="form.maxPriceStep"
            :disabled="isSubmitting"
            show-help
          >
            <p class="asset-pair-manager__tip-message">
              <span>
                Maximum offer price step in percents.
                If current price restriction is set,
                the users are allowed to set an offer with price in interval
              </span>
              <strong>(1 ± maxPriceStep) * currentPrice</strong>
            </p>
          </input-field>
        </div>

        <div class="asset-pair-manager__checkboxes">
          <tick-field
            class="asset-pair-manager__checkbox"
            v-model="form.policies"
            :disabled="isSubmitting"
            :required="false"
            label="Is tradable"
            :cb-value="ASSET_PAIR_POLICIES.tradeableSecondaryMarket"
            show-help
          >
            <span class="asset-pair-manager__tip-message">
              Allowed to trade this pair on secondary market
            </span>
          </tick-field>

          <tick-field
            class="asset-pair-manager__checkbox"
            v-model="form.policies"
            :disabled="isSubmitting"
            :required="false"
            label="Physical price restriction"
            :cb-value="ASSET_PAIR_POLICIES.physicalPriceRestriction"
            show-help
          >
            <span class="asset-pair-manager__tip-message">
              If set, then prices for new offers must be greater
              than physical price with correction
            </span>
          </tick-field>

          <tick-field
            class="asset-pair-manager__checkbox"
            v-model="form.policies"
            :disabled="isSubmitting"
            :required="false"
            label="Current price restriction"
            :cb-value="ASSET_PAIR_POLICIES.currentPriceRestriction"
            show-help
          >
            <p class="asset-pair-manager__tip-message">
              <span>
                If set, then price for new offers must be in interval of
              </span>
              <strong>(1 ± maxPriceStep) * currentPrice</strong>
            </p>
          </tick-field>
        </div>

        <button
          class="asset-pair-manager__submit-btn app__btn"
          :disabled="isSubmitting"
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
import InputField from '@comcom/fields/InputField'
import TickField from '@comcom/fields/TickField'

import { confirmAction } from '@/js/modals/confirmation_message'

import api from '@/api'
import { Sdk } from '@/sdk'

import { DEFAULT_INPUT_STEP } from '@/constants'
import { ASSET_PAIR_POLICIES } from '@/constants/'

import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    InputField,
    TickField,
  },

  props: {
    base: { type: String, required: true },
    quote: { type: String, required: true },
  },

  data () {
    return {
      DEFAULT_INPUT_STEP,
      ASSET_PAIR_POLICIES,
      pair: {},
      form: {
        price: '',
        physicalPriceCorrection: '',
        maxPriceStep: '',
        policies: [],
      },
      isLoaded: false,
      isSubmitting: false,
    }
  },

  async created () {
    await this.getPair()
    this.form.price = this.pair.physicalPrice
    this.form.physicalPriceCorrection = this.pair.physicalPriceCorrection
    this.form.maxPriceStep = this.pair.maxPriceStep
    this.form.policies = this.pair.policies.map(policy => policy.value)
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
      this.pair.physicalPrice = this.form.price
      this.pair.policies = this.form.policies
        .reduce((sum, policy) => sum | policy, 0)
      this.submit({ updatePrice: true })
    },

    async updatePolicy () {
      this.pair.physicalPriceCorrection = this.form.physicalPriceCorrection
      this.pair.maxPriceStep = this.form.maxPriceStep

      this.pair.policies = this.form.policies
        .reduce((sum, policy) => sum | policy, 0)
      this.submit({ updatePolicy: true })
    },

    async submit (action) {
      if (!await confirmAction()) return
      this.isSubmitting = true
      try {
        await api.assets.updatePair({ ...this.pair, ...action })
        this.$store.dispatch('SET_INFO', 'Pair has been updated.')
        this.$router.push({ name: 'assets.assetPairs.index' })
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isSubmitting = false
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
