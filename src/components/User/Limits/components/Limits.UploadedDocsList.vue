<template>
  <div class="limit-uploaded-docs">
    <template v-if="list">
      <ul class="limit-uploaded-docs__list app-list">
        <li class="app-list__header">
          <span class="limit-uploaded-docs__list-cell app-list__cell">Description</span>
          <span class="limit-uploaded-docs__list-cell app-list__cell app-list__cell--center">File extension</span>
          <span class="limit-uploaded-docs__list-cell app-list__cell app-list__cell--center">Uploading date</span>
          <span class="limit-uploaded-docs__list-cell app-list__cell app-list__cell--center"><!-- view file btn --></span>
        </li>
        <li class="app-list__li limit-uploaded-docs__list-row" v-for="(item, i) in list" :key="i">
          <span class="app-list__cell" :title="item.description">
            {{ item.description }}
          </span>
          <span class="app-list__cell app-list__cell--center">
            {{ getFileExtension(item.file.name) }}
          </span>
          <span class="app-list__cell app-list__cell--center">
            {{ formatDate(uploadDate) }}
          </span>
          <span class="app-list__cell app-list__cell--center">
            <doc-link-getter :fileKey="item.file.key">
              Open
            </doc-link-getter>
          </span>
        </li>
      </ul>
    </template>

    <template v-else>
      <ul class="app-list">
        <li class="app-list__li-like">
          <template v-if="isLoading">Nothing here yet</template>
          <template v-else>Loading...</template>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
  import { formatDate } from '@/utils/formatters'
  import { DocLinkGetter } from '@comcom/getters'

  export default {
    props: ['list', 'uploadDate'],
    components: { DocLinkGetter },
    data () {
      return {
        isLoading: false,
        isNoMoreEntries: false,
        formatDate
      }
    },
    methods: {
      getFileExtension (file) {
        return file.split(/\.(?=[^.]+$)/)[1]
      }
    }
  }
</script>

<style lang="scss" scoped>
  .request-list__filters-wrp {
    margin-bottom: 4rem;
  }
  .limit-uploaded-docs__list-row { box-shadow: none; }
  .app-list__cell--center { text-align: center; }
</style>
