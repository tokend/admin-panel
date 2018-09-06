<template>
  <span class="verbose-formatter">
    {{converted}}
  </span>
</template>

<script>
export default {
  props: ['string'],

  computed: {
    converted () {
      const str = this.string
      return str.charAt(0).toUpperCase() + str.slice(1).split('_').join(' ')
    }
  }
}
</script>

<style scoped>

</style>
