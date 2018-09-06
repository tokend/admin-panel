<template>
  <doc-link-getter :file-url="href" v-if="isLoaded"><slot/></doc-link-getter>
  <span v-else-if="isFailed" class="danger">(Error)</span>
  <span v-else>Loading...</span>
</template>

<script>
import DocLinkGetter from './DocLinkGetter'
import LinkGetterMixin from './link_getter.mixin'

export default {
  components: {
    DocLinkGetter
  },
  mixins: [LinkGetterMixin]
}
</script>
