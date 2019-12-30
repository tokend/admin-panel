<template>
  <div class="sale-manager">
    <h2>{{ "sale-manager.header" | globalize }}</h2>

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

          <tab
            v-if="isSaleWhitelisted"
            name="Whitelist"
          >
            <whitelist-tab :sale="sale" />
          </tab>

          <tab name="Corporate user">
            <syndicate-tab :sale="sale" />
          </tab>
        </tabs>
      </template>

      <template v-else-if="isFailed">
        <p class="text danger">
          {{ "sale-manager.error" | globalize }}
        </p>
      </template>

      <template v-else>
        <p class="text">
          {{ "sale-manager.loading" | globalize }}
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
import WhitelistTab from './SaleManager.WhitelistTab'
import SyndicateTab from './SaleManager.SyndicateTab'

import { ErrorHandler } from '@/utils/ErrorHandler'
import { api } from '@/api'

import { SALE_DEFINITION_TYPES } from '@/constants'

export default {
  components: {
    Tabs,
    Tab,
    DetailsTab,
    DescriptionTab,
    ParticipantsTab,
    WhitelistTab,
    SyndicateTab,
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

  computed: {
    isSaleWhitelisted () {
      return this.sale.accessDefinitionType.value ===
        SALE_DEFINITION_TYPES.whitelist
    },
  },

  created () {
    this.getSale(this.id)
  },

  methods: {
    async getSale (id) {
      try {
        const { data } = await api.get(`/v3/sales/${id}`, {
          include: ['base_asset', 'default_quote_asset', 'quote_assets'],
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
