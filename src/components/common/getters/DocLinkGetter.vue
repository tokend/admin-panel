<template>
  <a
    class="doc-link-getter doc-link-getter__link"
    target="_blank"
    rel="noopener"
    :href="href"
  >
    <slot />
    <mdi-open-in-new-icon class="doc-link-getter__ico" />
  </a>
</template>

<script>
import config from '@/config'
import 'mdi-vue/OpenInNewIcon'
import { DOCUMENTS_POLICIES } from '@/constants'
import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  props: {
    fileKey: {
      type: String,
      required: false,
      default: '',
    },
    fileUrl: {
      type: String,
      required: false,
      default: '',
    },
    fileType: {
      type: String,
      required: false,
      default: DOCUMENTS_POLICIES.public,
      validator: function (value) {
        return Object.values(DOCUMENTS_POLICIES).includes(value)
      },
    },
  },

  data: () => ({
    privateFileUrl: null,
  }),

  computed: {
    href () {
      if (this.fileType === DOCUMENTS_POLICIES.public) {
        return this.fileUrl || `${config.FILE_STORAGE}/${this.fileKey}`
      } else {
        return this.fileUrl || this.privateFileUrl
      }
    },
  },
  created () {
    if (this.fileType === DOCUMENTS_POLICIES.private) {
      if (!this.fileUrl) {
        this.getPrivateDocumentUrl(this.fileKey)
      }
    }
  },
  methods: {
    async getPrivateDocumentUrl (key) {
      try {
        const { data } = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature(`/documents/${key}`)
        this.privateFileUrl = data.url
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },
  },
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.doc-link-getter__link {
  &:hover {
    opacity: 0.8;
  }
}

.doc-link-getter__ico {
  width: 1.2rem;
  height: 1.2rem;
  vertical-align: middle;
  margin-left: 0.5rem;
  fill: rgba($color: $color-text, $alpha: 0.5);
}
</style>
