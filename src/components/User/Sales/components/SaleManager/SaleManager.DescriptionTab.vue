<template>
  <div class="sale-manager-description-tab">
    <label class="data-caption">
      {{ "sale-manager-description-tab.label-sale-video" | globalize }}
    </label>
    <template v-if="sale.details.youtubeVideoId">
      <iframe
        class="sale-manager-description-tab__video"
        :src="`https://www.youtube.com/embed/${sale.details.youtubeVideoId}`"
        allowfullscreen="true"
      />
    </template>

    <template v-else>
      <p class="text">
        {{ "sale-manager-description-tab.no-video-provided" | globalize }}
      </p>
    </template>

    <label class="data-caption">
      {{ "sale-manager-description-tab.sale-description" | globalize }}
    </label>
    <template v-if="description">
      <div class="sale-manager-description-tab__description-wrp">
        <markdown-formatter :source="description" />
      </div>
    </template>

    <template v-else-if="isLoaded">
      <p class="text">
        {{ "sale-manager-description-tab.not-provided-yet" | globalize }}
      </p>
    </template>

    <template v-else-if="isFailed">
      <p class="text danger">
        {{ "sale-manager-description-tab.error" | globalize }}
      </p>
    </template>

    <template v-else>
      <p class="text">
        {{ "sale-manager-description-tab.loading" | globalize }}
      </p>
    </template>
  </div>
</template>

<script>
import { MarkdownFormatter } from '@comcom/formatters'
import { api } from '@/api'

export default {
  components: {
    MarkdownFormatter,
  },

  props: {
    sale: { type: Object, required: true },
  },

  data () {
    return {
      description: '',
      isLoaded: false,
      isFailed: false,
    }
  },

  created () {
    this.loadDescription()
  },

  methods: {
    async loadDescription () {
      try {
        const { description: blobId } = this.sale.details
        const userId = this.sale.owner.id
        const endpoint = `/accounts/${userId}/blobs/${blobId}`
        const { data } = await api.getWithSignature(endpoint)
        this.description = JSON.parse(data.value)
        this.isLoaded = true
      } catch (error) {
        this.isFailed = true
      }
    },
  },
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
