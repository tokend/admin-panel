<template>
  <div class="sale-manager-description-tab">
    <iframe
      class="sale-manager-description-tab__video"
      :src="`https://www.youtube.com/embed/${sale.details.youtubeVideoId}`"
      allowfullscreen="true"
    ></iframe>

    <template v-if="isLoaded">
      <div class="sale-manager-description-tab__description-wrp">
        <markdown-formatter :source="description" />
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
import { MarkdownFormatter } from '@comcom/formatters'
import { Sdk } from '@/sdk'
export default {
  components: {
    MarkdownFormatter
  },

  props: ['sale'],

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

  methods: {
    async loadDescription () {
      try {
        const { ownerId: userId, description: blobId } = this.sale.details
        const response = await Sdk.api.blobs.get(blobId, userId)
        const blob = response.data
        this.description = blob.value
        this.isLoaded = true
      } catch (error) {
        this.isFailed = true
      }
    }
  }
}
</script>

<style lang="scss">
@import "~@/assets/scss/colors";

.sale-manager-description-tab__description-wrp {
  max-width: 56rem;
}

.sale-manager-description-tab__video {
  width: 100%;
  height: 430px;
}
</style>
