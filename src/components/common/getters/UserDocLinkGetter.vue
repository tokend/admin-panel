<template>
  <doc-link-getter :file-url="href" v-if="isLoaded">
    <slot />
  </doc-link-getter>
  <span v-else-if="isFailed" class="danger">
    {{ "user-doc-link-getter.failed-load-doc" | globalize }}
  </span>
  <span v-else>
    {{ "user-doc-link-getter.failed-load-def" | globalize }}
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
