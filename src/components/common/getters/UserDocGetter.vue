<template>
  <div class="user-doc-getter">
    <div class="user-doc-getter__inner">
      <div class="user-doc-getter__link" v-if="file && isLoaded">
        <a :href="href" target="_blank" rel="noopener">
          Open file <mdi-open-in-new-icon class="user-doc-getter__ico" />
        </a>
      </div>
      <div v-if="href && isLoaded">
        <img :src="href">
      </div>
      <span v-else-if="isNoFile" class="danger">No file found</span>
      <span v-else-if="isFailed" class="danger">(Error)</span>
      <span v-else>Loading...</span>
    </div>
  </div>
</template>

<script>
  import LinkGetterMixin from './link_getter.mixin'

  export default {
    mixins: [LinkGetterMixin]
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/scss/colors';

  .user-doc-getter {
    position: relative;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .user-doc-getter__inner {
    overflow-y: auto;
    min-height: 100%;
    max-height: 405px;

    &:hover {
      .user-doc-getter__link {
        transform: none;
      }
    }
  }

  .user-doc-getter__link {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3rem;
    font-size: 1.4rem;
    transition: .2s;
    transform: translateY(-100%);
    justify-content: center;
    align-items: center;
    background: rgba(0,0,0,.25);
  }

  .user-doc-getter__ico {
    width: 1rem;
    height: 1rem;
    vertical-align: middle;
    margin-left: 0.5rem;
    fill: $color-active;
  }

  iframe, img {
    border: none;
    width: 100%;
  }

  img {
    height: auto;
  }
  iframe {
    min-height: 400px;
    height: 100%;
  }

</style>
