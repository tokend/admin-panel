<template>
  <doc-link-getter :file-url="href" v-if="isLoaded">
    <slot />
  </doc-link-getter>
  <span v-else-if="isFailed" class="danger">
    {{ "user-doc-link-getter.error" | globalize }}
  </span>
  <span v-else>
    {{ "user-doc-link-getter.loading" | globalize }}
  </span>
</template>

<script>
import DocLinkGetter from './DocLinkGetter'
import LinkGetterMixin from './link_getter.mixin'

export default {
  components: {
    DocLinkGetter,
  },
  mixins: [LinkGetterMixin],
}
</script>
