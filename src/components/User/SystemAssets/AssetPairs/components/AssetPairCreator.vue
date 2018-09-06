<template>
  <div class="asset-pair-creator">

    <form @submit.prevent="submit" class="asset-pair-creator__form app__block">
        <h2>Create asset pair</h2>

        <div class="asset-pair-creator__form-row app__form-row">
          <input-field class="app__form-field"
                       label="Base"
                       v-model="form.base"
                       :disabled="isPending"
          />

          <input-field class="app__form-field"
                       label="Quote"
                       v-model="form.quote"
                       :disabled="isPending"
          />
        </div>


        <div class="asset-pair-creator__form-row app__form-row">
          <input-field class="app__form-field"
                       label="Price"
                       type="number" min="0" :step="DEFAULT_INPUT_STEP"
                       v-model="form.physicalPrice"
                       :disabled="isPending"
          />
        </div>

        <div class="asset-pair-creator__form-row app__form-row">
          <input-field class="app__form-field"
                       label="Physical price correction"
                       type="number" min="0" :step="DEFAULT_INPUT_STEP"
                       v-model="form.physicalPriceCorrection"
                       :disabled="isPending"
          />
          <input-field class="app__form-field"
                       label="Max price step"
                       type="number" min="0" :step="DEFAULT_INPUT_STEP"
                       v-model="form.maxPriceStep"
                       :disabled="isPending"
          />
        </div>

        <div class="asset-pair-creator__checkboxes">

          <tick-field class="asset-pair-creator__checkbox"
                      v-model="form.policies"
                      :disabled="isPending"
                      :required="false"
                      label="Is tradable"
                      title="Allowed to trade this pair on secondary market"
                      :cb-value="ASSET_PAIR_POLICIES.tradeableSecondaryMarket"
          />

          <tick-field class="asset-pair-creator__checkbox"
                      v-model="form.policies"
                      :disabled="isPending"
                      :required="false"
                      label="Physical price restriction"
                      title="If set, then prices for new offers must be greater then physical price with correction"
                      :cb-value="ASSET_PAIR_POLICIES.physicalPriceRestriction"
          />

          <tick-field class="asset-pair-creator__checkbox"
                      v-model="form.policies"
                      :disabled="isPending"
                      :required="false"
                      label="Current price restriction"
                      title="If set, then price for new offers must be in interval of (1 +- maxPriceStep)*currentPrice"
                      :cb-value="ASSET_PAIR_POLICIES.currentPriceRestriction"
          />

        </div>

        <div class="app__form-actions">
          <button class="asset-pair-creator__submit-btn app__btn"
                  :disabled="isPending">
            Create
          </button>
        </div>
      </form>

  </div>
</template>

<script>
  import { TickField, InputField } from '../../../../common/fields'
  import { ASSET_PAIR_POLICIES, DEFAULT_INPUT_STEP } from '../../../../../constants'
  import api from '@/api'

  export default {
    components: { TickField, InputField },
    data: _ => ({
      form: {
        base: '',
        quote: '',
        policies: [],
        maxPriceStep: '',
        physicalPrice: '',
        physicalPriceCorrection: ''
      },
      isPending: false,
      ASSET_PAIR_POLICIES,
      DEFAULT_INPUT_STEP
    }),
    methods: {
      async submit () {
        if (!window.confirm('Please confirm this action')) return
        this.isPending = true
        try {
          await api.assets.createPair({
            ...this.form,
            policies: this.form.policies.reduce((sum, policy) => sum | policy, 0)
          })
          this.$store.dispatch('SET_INFO', 'Pair has been created.')
          this.$router.push({ name: 'systemAssets.assetPairs.index' })
        } catch (error) {
          console.error(error)
          error.showMessage()
        }
        this.isPending = false
      }
    }
  }
</script>

<style scoped>
  .asset-pair-creator__checkboxes {
    margin: 3.5rem 0 5rem;
  }

  .asset-pair-creator__checkbox {
    margin-bottom: 1rem;
  }
</style>
