<template>
  <a class="doc-link-getter doc-link-getter__link"
    target="_blank"
    rel="noopener"
    :href="href"
  ><slot/><mdi-open-in-new-icon class="doc-link-getter__ico" /></a>
</template>

<script>
import config from '@/config'
import 'mdi-vue/OpenInNewIcon'
export default {
  props: ['fileKey', 'fileUrl'],

  computed: {
    href () {
      return this.fileUrl || `${config.STORAGE_SERVER}/${this.fileKey}`
    }
  }
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
