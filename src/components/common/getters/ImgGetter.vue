<template>
  <img :src="src">
</template>

<script>
import config from '@/config'
export default {
  props: {
    fileKey: { type: String, required: true },
  },

  computed: {
    src () {
      return `${config.FILE_STORAGE}/${this.fileKey}`
    },
  },
}
</script>

<style scoped>

</style>
