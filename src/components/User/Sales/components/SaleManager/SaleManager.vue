<template>
  <div class="sale-manager">
    <h2>Sale overview</h2>

    <div class="app__block">
      <template v-if="isLoaded">
        <tabs>
          <tab name="Details">
            <details-tab :sale="sale" />
          </tab>

          <tab name="Full description">
            <description-tab :sale="sale" />
          </tab>

          <tab name="Participants">
            <participants-tab :sale="sale" />
          </tab>

          <tab name="Corporate user">
            <syndicate-tab :sale="sale" />
          </tab>

          <tab name="Updates">
            <updates-tab :sale="sale" />
          </tab>
        </tabs>
      </template>

      <template v-else-if="isFailed">
        <p class="text danger">
          An error occurred. Please try again later.
        </p>
      </template>

      <template v-else>
        <p class="text">
          Loading...
        </p>
      </template>
    </div>
  </div>
</template>

<script>
import { Sdk } from '@/sdk'
import { Tabs, Tab } from '@comcom/Tabs'
import DetailsTab from './SaleManager.DetailsTab'
import DescriptionTab from './SaleManager.DescriptionTab'
import ParticipantsTab from './SaleManager.ParticipantsTab'
import SyndicateTab from './SaleManager.SyndicateTab'
import UpdatesTab from './SaleManager.UpdatesTab'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    Tabs,
    Tab,
    DetailsTab,
    DescriptionTab,
    ParticipantsTab,
    SyndicateTab,
    UpdatesTab
  },

  data () {
    return {
      sale: {},
      isLoaded: false,
      isFailed: false
    }
  },

  props: ['id'],

  created () {
    this.getSale(this.id)
  },

  methods: {
    async getSale (id) {
      try {
        const response = await Sdk.horizon.sales.get(id)
        this.sale = response.data
        this.isLoaded = true
      } catch (error) {
        ErrorHandler.process(error)
        this.isFailed = true
      }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
