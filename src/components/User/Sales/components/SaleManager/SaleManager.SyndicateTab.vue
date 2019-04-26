<template>
  <div class="sale-manager-corporate-tab">
    <template v-if="isLoaded">
      <div class="sale-manager-corporate-tab__details-wrp">
        <label class="data-caption">Corporate user details</label>
        <ul class="key-value-list">
          <li>
            <span>Name</span>
            <span>{{corporate.name}}</span>
          </li>
          <li>
            <span>Headquarters</span>
            <span>{{corporate.headquarters}}</span>
          </li>
          <li v-if="kycAvatarKey">
            <span>Avatar</span>
            <span>
              <user-doc-link-getter :file-key="kycAvatarKey">
                Open file
              </user-doc-link-getter>
            </span>
          </li>
          <li>
            <span>Homepage</span>
            <span>{{corporate.homepage}}</span>
          </li>
          <li>
            <span>Industry</span>
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
          <li v-if="kycAvatarKey">
            <div class="sale-manager-corporate-tab__doc-view-wrp">
              <h3>Avatar</h3>
              <user-doc-getter
                class="sale-manager-corporate-tab__doc-view"
                :file-key="kycAvatarKey"
              />
            </div>
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
import { UserDocLinkGetter, UserDocGetter } from '@comcom/getters'
import { Sdk } from '@/sdk'
import { DateFormatter } from '@comcom/formatters'
import SyndicateMember from '@comcom/SyndicateMember'
import SocialLinks from '@comcom/SocialLinks'

import _get from 'lodash/get'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  components: {
    DateFormatter,
    SyndicateMember,
    UserDocLinkGetter,
    UserDocGetter,
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

  computed: {
    kycAvatarKey () {
      return _get(this.corporate, 'documents.kyc_avatar.key')
    }
  },

  created () {
    this.getCorporate({
      ownerId: _get(this.sale, 'owner.id') ||
        _get(this.saleRequest, 'requestor') ||
        _get(this.user, 'address'),
      blobId: this.blobId
    })
  },

  methods: {
    async getCorporate ({ ownerId: owner, blobId }) {
      try {
        const response = blobId
          ? await Sdk.api.blobs.get(blobId, owner)
          : await Sdk.api.blobs.get(
            (await Sdk.horizon.account.getAccountKyc(owner))
              .data.kycData.blobId
          )
        this.corporate = JSON.parse(
          response.data.value || response.data[0].value
        )
        this.isLoaded = true
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
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
