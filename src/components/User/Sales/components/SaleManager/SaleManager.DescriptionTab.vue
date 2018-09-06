<template>
  <div class="sale-manager-description-tab">
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
import api from '@/api'
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
    this.getDescription(this.sale)
  },

  methods: {
    async getDescription ({ ownerId: userId, description: blobId }) {
      try {
        const blob = (await api.users.blobsOf(userId).get(blobId)).data
        this.description = blob.value
        this.isLoaded = true
      } catch (error) {
        this.isFailed = true
      }
    }
  }
}
</script>

<style scoped>
.sale-manager-description-tab__description-wrp {
  max-width: 56rem;
}
</style>
