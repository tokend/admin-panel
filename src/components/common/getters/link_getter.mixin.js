import { Sdk } from '@/sdk'

export default {
  data () {
    return {
      href: '',
      isLoaded: false,
      isFailed: false,
      isNoFile: false
    }
  },

  props: ['userId', 'fileKey'],

  created () {
    this.getHref()
  },

  watch: {
    userId () { this.getHref() },
    fileKey () { this.getHref() }
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
        const response = await Sdk.api.documents.get(this.fileKey)
        this.href = response.url
        this.isLoaded = true
      } catch (error) {
        this.isFailed = true
      }
    }
  }
}
