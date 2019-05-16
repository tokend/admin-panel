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
import { Tabs, Tab } from '@comcom/Tabs'

import DetailsTab from './SaleManager.DetailsTab'
import DescriptionTab from './SaleManager.DescriptionTab'
import ParticipantsTab from './SaleManager.ParticipantsTab'
import SyndicateTab from './SaleManager.SyndicateTab'
import UpdatesTab from './SaleManager.UpdatesTab'

import { Sdk } from '@/sdk'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { ApiCallerFactory } from '@/api-caller-factory'

export default {
  components: {
    Tabs,
    Tab,
    DetailsTab,
    DescriptionTab,
    ParticipantsTab,
    SyndicateTab,
    UpdatesTab,
  },

  props: {
    id: { type: String, required: true },
  },

  data () {
    return {
      sale: {},
      isLoaded: false,
      isFailed: false,
    }
  },

  created () {
    this.getSale(this.id)
  },

  methods: {
    async getSale (id) {
      try {
        const { data } = await ApiCallerFactory
          .createCallerInstance()
          .get(`/v3/sales/${id}`, {
            include: ['base_asset', 'default_quote_asset']
          })
        this.sale = data
        this.isLoaded = true
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
        this.isFailed = true
      }
    },
  },
}
</script>
