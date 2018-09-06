export default {
  data: _ => ({
    form: {
      // form
    },
    resolvers: {
      resolve: () => {},
      reject: () => {}
    },
    isOpened: true,
    isResolved: false
  }),
  methods: {
    setResolvers (resolve, reject) {
      this.resolvers.resolve = resolve
      this.resolvers.reject = reject
    },
    resetResolvers () {
      this.isResolved = true
    },
    close () {
      this.resetResolvers()
      this.isOpened = false
      this.removeElement()
    },
    removeElement () {
      this.isOpened = false
      if (this.$el.parentNode) {
        this.$el.parentNode.removeChild(this.$el)
      }
    }
  }
}
