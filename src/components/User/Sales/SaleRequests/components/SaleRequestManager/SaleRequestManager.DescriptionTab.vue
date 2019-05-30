<template>
  <div class="sale-rm-description-tab">
    <label class="data-caption">
      Sale video
    </label>
    <template v-if="videoId">
      <iframe
        class="sale-rm-description-tab__video"
        :src="`https://www.youtube.com/embed/${videoId}`"
        allowfullscreen="true"
      />
    </template>

    <template v-else>
      <p class="text">
        (No video provided)
      </p>
    </template>

    <label class="data-caption">
      Sale description
    </label>
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
import { api } from '@/api'
import _get from 'lodash/get'

export default {
  components: {
    MarkdownFormatter,
  },

  props: {
    saleRequest: { type: Object, required: true },
  },

  data () {
    return {
      description: '',
      isLoaded: false,
      isFailed: false,
    }
  },

  computed: {
    videoId () {
      return _get(
        this.saleRequest,
        `requestDetails.creatorDetails.youtubeVideoId`
      )
    },
  },

  created () {
    this.loadDescription()
  },

  methods: {
    async loadDescription () {
      const userId = this.saleRequest.requestor.id
      const blobId = _get(
        this.saleRequest,
        `requestDetails.creatorDetails.description`
      )

      try {
        const endpoint = `/accounts/${userId}/blobs/${blobId}`
        const { data } = await api.getWithSignature(endpoint)
        this.description = JSON.parse(data.value)
        this.isLoaded = true
      } catch (error) {
        if (error.status === 404) {
          this.isLoaded = true
        } else {
          this.isFailed = true
        }
      }
    },
  },
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
