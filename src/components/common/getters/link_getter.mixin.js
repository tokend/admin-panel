import api from '@/api'

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
        const response = await api.users.docsOf(this.userId).get(this.fileKey)
        this.href = response.data.url
        this.isLoaded = true
      } catch (error) {
        this.isFailed = true
      }
    }
  }
}
