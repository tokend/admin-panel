import { documentsManager } from '@/api'

export default {
  props: {
    fileKey: { type: String, default: '' },
  },

  data () {
    return {
      href: '',
      isLoaded: false,
      isFailed: false,
      isNoFile: false,
    }
  },

  watch: {
    fileKey () { this.getHref() },
  },

  created () {
    this.getHref()
  },

  methods: {
    async getHref () {
      this.isLoaded = false
      this.isFailed = false

      try {
        if (!this.fileKey) {
          this.isNoFile = true
          this.isFailed = true
          return
        }

        const data = await documentsManager
          .getDocumentUrlByKey(this.fileKey)
        this.href = data
        this.isLoaded = true
      } catch (error) {
        this.isFailed = true
      }
    },
  },
}
