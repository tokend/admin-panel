<template>
  <div class="system-assets-index">
    <div class="system-assets-index__heading-row">
      <h2>Assets</h2>

      <div class="system-assets-index__actions">
        <router-link class="system-assets-index__create-btn app__btn app__btn--iconed"
          :to="{ name: 'systemAssets.new' }">
          <mdi-plus-icon/> Create asset
        </router-link>
      </div>
    </div>

    <div class="system-assets-index__list-wrp">
      <asset-list/>
    </div>
  </div>
</template>

<script>
import 'mdi-vue/PlusIcon'

import AssetList from './components/AssetList'

export default {
  components: { AssetList }
}
</script>

<style lang="scss" scoped>
.system-assets-index__heading-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  max-width: 64rem;

  &:not(:first-of-type) {
    margin-top: 5.5rem;
  }

  & > h2 {
    margin-bottom: 0;
  }
}

.system-assets-index__actions {
  flex: 1;
  max-width: 17rem;
}

.system-assets-index__create-btn {
  font-weight: 600;
  text-decoration: none;

  &.app__btn {
    padding: 0.9rem;
  }

  & > svg {
    margin-left: -1rem;
    margin-right: 0.7rem;
  }
}
</style>
