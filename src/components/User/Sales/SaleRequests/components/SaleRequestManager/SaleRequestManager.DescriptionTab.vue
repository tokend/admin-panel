<template>
  <div class="sale-rm-description-tab">

    <template v-if="videoId">
      <label class="data-caption">Fund video</label>
      <div class="sale-rm-description-tab__video-wrp">
        <iframe :src="`https://www.youtube.com/embed/${videoId}`" allowfullscreen="true"></iframe>
      </div>
    </template>

    <template v-if="description">
      <label class="data-caption">Fund description</label>
      <div class="sale-rm-description-tab__description-wrp">
        <markdown-formatter :source="description" />
      </div>
    </template>

    <template v-else-if="isLoaded">
      <p class="text">
        (Not provided yet)
      </p>
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
import { MarkdownFormatter } from '@comcom/formatters'
import { Sdk } from '@/sdk'
import safeGet from 'lodash/get'

export default {
  components: {
    MarkdownFormatter
  },

  props: ['saleRequest'],

  data () {
    return {
      description: '',
      isLoaded: false,
      isFailed: false
    }
  },

  created () {
    this.getDescription(this.saleRequest)
  },

  computed: {
    videoId () {
      return safeGet(this.saleRequest, 'details.youtubeVideoId')
    }
  },

  methods: {
    async getDescription (saleRequest) {
      const userId = saleRequest.requestor
      const blobId = (saleRequest.details[saleRequest.details.requestType] ||
        {}).details.description
      try {
        const response = await Sdk.api.blobs.get(blobId, userId)
        this.description = response.data.value
        this.isLoaded = true
      } catch (error) {
        if (error.status === 404) {
          this.isLoaded = true
        } else {
          this.isFailed = true
        }
      }
    }
  }
}
</script>

<style scoped>
.sale-rm-description-tab__description-wrp {
  max-width: 56rem;
}
</style>
