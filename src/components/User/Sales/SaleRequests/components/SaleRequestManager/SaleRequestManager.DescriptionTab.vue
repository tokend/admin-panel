<template>
  <div class="sale-rm-description-tab">
    <label class="data-caption">Opportunity video</label>
    <template v-if="videoId">
      <iframe
        class="sale-rm-description-tab__video"
        :src="`https://www.youtube.com/embed/${videoId}`"
        allowfullscreen="true"
      ></iframe>
    </template>

    <template v-else>
      <p class="text">
        (No video provided)
      </p>
    </template>

    <label class="data-caption">Opportunity description</label>
    <template v-if="description">
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
import _get from 'lodash/get'

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
    this.loadDescription()
  },

  computed: {
    videoId () {
      const valuableRequestDetailsKey = Object.keys(this.saleRequest.details)
        .find(item => !/request_type|requestType/gi.test(item))
      return _get(
        this.saleRequest,
        `details.${valuableRequestDetailsKey}.details.youtubeVideoId`
      )
    }
  },

  methods: {
    async loadDescription () {
      const userId = this.saleRequest.requestor

      const requestType = this.saleRequest.details.requestType
      const blobId = _get(
        this.saleRequest,
        `details.${requestType}.details.description`
      )

      try {
        const response = await Sdk.api.blobs.get(blobId, userId)
        this.description = JSON.parse(response.data.value)
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

.sale-rm-description-tab__video {
  width: 100%;
  height: 430px;
}
</style>
