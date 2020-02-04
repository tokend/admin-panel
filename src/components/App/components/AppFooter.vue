<template>
  <footer class="app-footer">
    <div class="app-footer__top-part">
      <span class="app-footer-copyright">
        {{ "app-footer.copyrighted" | globalize({currentYear: currentYear}) }}
      </span>
      <language-picker />
    </div>
    <template v-if="buildVersion && needVersion">
      <p class="app-footer__version">
        {{ buildVersion | formatVersion }}
      </p>
    </template>
  </footer>
</template>

<script>
import config from '@/config'
import LanguagePicker from '@/components/App/components/LanguagePicker'
export default {
  components: { LanguagePicker },
  props: {
    needVersion: { type: Boolean, default: true },
  },
  data () {
    return {
      buildVersion: config.BUILD_VERSION,
    }
  },
  computed: {
    currentYear () {
      return new Date().getFullYear()
    },
  },
}
</script>

<style lang="scss" scoped>
  @import "~@/assets/scss/colors";

  .app-footer {
    text-align: center;
    color: $color-text;
  }

  .app-footer__top-part {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .app-footer-copyright {
    margin-right: 1rem;
    font-size: 1.4rem;
  }

  .app-footer__version {
    font-size: 1.2rem;
    color: $color-text-secondary;
    text-align: center;
  }
</style>
