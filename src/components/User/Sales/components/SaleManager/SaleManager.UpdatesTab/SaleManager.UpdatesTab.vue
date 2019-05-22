<template>
  <div class="sale-manager-corporate-tab">
    <template v-if="isLoaded">
      <template v-if="updates.length">
        <timeline-item
          class="timeline__timeline-item"
          v-for="(item, i) in updates"
          :key="i"
          :title="item.title"
          :date="item.date"
          :message="item.message"
        />
      </template>
      <template v-else>
        <div class="no-data-msg__wrapper">
          <h2>No updates yet...</h2>
        </div>
      </template>
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
</template>

<script>
import TimelineItem from './TimelineItem'

import { Sdk } from '@/sdk'
import { BLOB_TYPES } from '@/constants'

import _get from 'lodash/get'

import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    TimelineItem,
  },

  props: {
    sale: { type: Object, required: true },
  },

  data () {
    return {
      updates: {},
      isLoaded: false,
      isFailed: false,
    }
  },

  created () {
    this.getUpdates({
      ownerId: _get(this.sale, 'owner.id'),
    })
  },

  methods: {
    async getUpdates ({ ownerId: owner }) {
      try {
        const response = await Sdk.api.blobs.getAll({
          fund_id: this.sale.id,
          type: BLOB_TYPES.saleUpdate,
        }, owner)
        this.updates = response.data.map(attr => JSON.parse(attr.value))
        this.isLoaded = true
      } catch (e) {
        ErrorHandler.processWithoutFeedback(e)
        this.isFailed = true
      }
    },
  },
}
</script>
