<template>
  <div class="asset-pair-manager">

    <template v-if="isLoaded">
      <form @submit.prevent="updatePrice" class="asset-pair-manager__form app__block">
        <h2>Update {{base}}/{{quote}} pair price</h2>

        <div class="asset-pair-manager__form-row app__form-row">
          <input-field class="app__form-field"
            :label="`Price (${pair.quote})`"
            type="number" min="0" :step="DEFAULT_INPUT_STEP"
            v-model="form.price"
            :disabled="isSubmitting"
          />
        </div>

        <div class="app__form-actions">
          <button class="asset-pair-manager__submit-btn app__btn"
            :disabled="isSubmitting">
            Update
          </button>
        </div>
      </form>
    </template>

    <template v-if="isLoaded">
      <form @submit.prevent="updatePolicy" class="asset-pair-manager__form app__block">
        <h2>Update {{base}}/{{quote}} pair policies</h2>


        <div class="asset-pair-manager__checkboxes">
          <tick-field class="asset-pair-manager__checkbox"
                      v-model="form.policies"
                      :disabled="isPending"
                      :required="false"
                      label="Is tradable"
                      title="Allowed to trade this pair on secondary market"
                      :cb-value="ASSET_PAIR_POLICIES.tradeableSecondaryMarket"
          />
          <tick-field class="asset-pair-manager__checkbox"
                      v-model="form.policies"
                      :disabled="isPending"
                      :required="false"
                      label="Physical price restriction"
                      title="If set, then prices for new offers must be greater then physical price with correction"
                      :cb-value="ASSET_PAIR_POLICIES.physicalPriceRestriction"
          />
          <tick-field class="asset-pair-manager__checkbox"
                      v-model="form.policies"
                      :disabled="isPending"
                      :required="false"
                      label="Current price restriction"
                      title="If set, then price for new offers must be in interval of (1 +- maxPriceStep)*currentPrice"
                      :cb-value="ASSET_PAIR_POLICIES.currentPriceRestriction"
          />
        </div>

        <button class="asset-pair-manager__submit-btn app__btn"
                :disabled="isSubmitting">
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
import api from '@/api'
import InputField from '@comcom/fields/InputField'
import TickField from '@comcom/fields/TickField'
import { DEFAULT_INPUT_STEP } from '@/constants'
import { ASSET_PAIR_POLICIES } from '@/constants/'

import { confirmAction } from '../../../../../js/modals/confirmation_message'

export default {
  props: ['base', 'quote'],

  components: {
    InputField,
    TickField
  },

  data () {
    return {
      DEFAULT_INPUT_STEP,
      ASSET_PAIR_POLICIES,
      pair: {},
      form: {
        price: '',
        policies: []
      },
      isLoaded: false,
      isSubmitting: false
    }
  },

  async created () {
    await this.getPair()
    this.form.price = this.pair.physicalPrice
    this.form.policies = this.pair.policies.map(policy => policy.value)
  },

  methods: {
    async getPair () {
      this.isLoaded = false
      try {
        const response = await api.assets.getPairs()
        this.pair = response.data
          .find(({ base, quote }) => base === this.base && quote === this.quote)
        this.isLoaded = true
      } catch (error) {
        error.showMessage()
      }
    },

    async updatePrice () {
      this.pair.physicalPrice = this.form.price
      this.submit({ updatePrice: true })
    },

    async updatePolicy () {
      this.pair.policies = this.form.policies.reduce((sum, policy) => sum | policy, 0)
      this.submit({ updatePolicy: true })
    },

    async submit (action) {
      if (!await confirmAction()) return
      this.isSubmitting = true
      try {
        await api.assets.updatePair({ ...this.pair, ...action })
        this.$store.dispatch('SET_INFO', 'Pair has been updated.')
        this.$router.push({ name: 'systemAssets.assetPairs.index' })
      } catch (error) {
        console.error(error)
        error.showMessage()
      }
      this.isSubmitting = false
    }
  }
}
</script>

<style scoped>
  .asset-pair-manager {
    display: flex;
  }

  .asset-pair-manager__form {
    margin-right: 30px;
  }

  .asset-pair-manager__checkboxes {
    margin: 6.4rem 0 4rem;
  }
  .asset-pair-manager__checkbox {
    margin: 0 0 1rem;
  }
</style>
