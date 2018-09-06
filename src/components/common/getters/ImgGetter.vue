<template>
  <img :src="src" />
</template>

<script>
import config from '@/config'
export default {
  props: ['fileKey'],

  computed: {
    src () {
      return `${config.STORAGE_SERVER}/${this.fileKey}`
    }
  }
}
</script>

<style scoped>

</style>
