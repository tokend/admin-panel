<template>
  <div class="sale-manager-corporate-tab">
    <template v-if="isLoaded">
      <div class="sale-manager-corporate-tab__details-wrp">
        <label class="data-caption">Syndicate user details</label>
        <ul class="key-value-list">
          <li>
            <span>Name</span>
            <span>{{corporate.name}}</span>
          </li>
          <li>
            <span>Founded</span>
            <date-formatter :date="corporate.found_date" format="DD MMM YYYY" />
          </li>
          <li>
            <span>Headquarters</span>
            <span>{{corporate.headquarters}}</span>
          </li>
          <li>
            <span>Homepage</span>
            <span>{{corporate.homepage}}</span>
          </li>
          <li>
            <span>Industry / Tags</span>
            <span>{{corporate.industry}}</span>
          </li>
          <li>
            <span>Team size</span>
            <span>{{corporate.team_size}}</span>
          </li>
          <li>
            <span>Company</span>
            <span>{{corporate.company}}</span>
          </li>
        </ul>
      </div>
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
import { Sdk } from '@/sdk'
import { DateFormatter } from '@comcom/formatters'
import SyndicateMember from '@comcom/SyndicateMember'
import SocialLinks from '@comcom/SocialLinks'
import { BLOB_TYPES } from '../../../../../constants'

import _get from 'lodash/get'

export default {
  components: {
    DateFormatter,
    SyndicateMember,
    SocialLinks
  },

  props: ['sale', 'saleRequest', 'user', 'blobId'],

  data () {
    return {
      corporate: {},
      isLoaded: false,
      isFailed: false
    }
  },
  created () {
    this.getSyndicate({
      ownerId: _get(this.sale, 'ownerId') ||
               _get(this.saleRequest, 'requestor') ||
               _get(this.user, 'id'),
      blobId: this.blobId
    })
  },

  methods: {
    async getSyndicate ({ ownerId: owner, blobId }) {
      try {
        const response = blobId
          ? await Sdk.api.blobs.get(blobId, owner)
          : await Sdk.api.blobs.getAll({
            type: BLOB_TYPES.syndicateKyc | BLOB_TYPES.kycForm
          }, owner)
        this.corporate = JSON.parse(
          response.data.value || response.data[0].value
        )
        this.isLoaded = true
      } catch (error) {
        console.error(error)
        this.isFailed = true
      }
    }
  }
}
</script>

<style scoped lang="scss">
.sale-manager-corporate-tab__details-wrp {
  max-width: 48rem;
}
</style>
