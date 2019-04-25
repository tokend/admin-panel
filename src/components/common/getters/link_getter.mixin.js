import { Sdk } from '@/sdk'

export default {
  data () {
    return {
      href: '',
      isLoaded: false,
      isFailed: false,
      isNoFile: false,
    }
  },

  props: ['fileKey'],

  created () {
    this.getHref()
  },

  watch: {
    fileKey () { this.getHref() },
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
        const { data } = await Sdk.api.documents.get(this.fileKey)
        this.href = data.url
        this.isLoaded = true
      } catch (error) {
        this.isFailed = true
      }
    },
  },
}
