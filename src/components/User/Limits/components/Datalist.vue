<template>
  <div class="datalist">
    <input-field
      v-model="docItem.label"
      class="datalist__input-field"
      :label="'data-list.lbl-document-type' | globalize"
      @keyup.down="onArrowDown"
      @keyup.up="onArrowUp"
      :error-message="chooseFromList"
    />
    <!-- <input type="text"
            v-model="docItem.label"
            class="datalist__input-field"
            @keyup.down="onArrowDown"
            @keyup.up="onArrowUp"
    > -->
    <ul
      class="datalist__list"
      v-if="isShowingList"
      ref="list">
      <template v-for="(item, i) in filteredList">
        <li
          class="datalist__list-item"
          :key="i"
          ref="option"
          @click="selectItemFromList(item)"
          :class="{ 'datalist__list-item__is-active': i === pointerCounter }">
          {{ item }}
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
import { InputField } from '@comcom/fields'
import { DOCUMENT_TYPES_STR } from '@/constants'
import { globalize } from '@/components/App/filters/filters'
export default {
  name: 'datalist-field',
  components: { InputField },

  props: {
    docItem: { type: Object, required: true },
  },

  data: _ => ({
    searchValue: '',
    isShowingList: false,
    pointerCounter: 0,
    DOCUMENT_TYPES_STR,
  }),

  computed: {
    filteredList () {
      const nonUnderscoreList = Object.values(DOCUMENT_TYPES_STR).map(item => item.replace(/_/g, ' '))
      return nonUnderscoreList.filter(item => {
        return item.toLowerCase()
          .includes(this.docItem.label.toLowerCase())
      })
    },
    chooseFromList () {
      let result
      for (let i = 0; i < this.filteredList.length; i++) {
        result = this.docItem.label === this.filteredList[i] || this.docItem.label === ''
      }
      return result
        ? ''
        : globalize('limits-reviewer.choose-from-list')
    },
  },

  watch: {
    'docItem.label': function () {
      this.showDatalist()
      if (this.filteredList.length === 1) {
        this.filteredList.forEach(i =>
          this.$emit('doc-type-found', this.docItem.label === i)
        )
      } else {
        this.$emit('doc-type-found', false)
      }
    },
  },

  mounted () {
    document.addEventListener('click', this.handleClickOutside)
  },

  destroyed () {
    document.removeEventListener('click', this.handleClickOutside)
  },

  methods: {
    selectItemFromList (item) {
      this.isShowingList = false
      this.searchValue = item
      this.docItem.label = item
    },

    showDatalist () {
      this.isShowingList = true
    },

    onArrowDown () {
      if (this.pointerCounter < this.filteredList.length - 1) {
        this.pointerCounter++
        this.fixScrolling()
      }
    },

    onArrowUp () {
      if (this.pointerCounter > 0) {
        this.pointerCounter--
        this.fixScrolling()
      }
    },

    handleClickOutside (event) {
      if (!this.$el.contains(event.target)) {
        this.pointerCounter = -1
        this.isShowingList = false
      }
    },

    fixScrolling () {
      const currentHeight = this.$refs.option[this.pointerCounter].clientHeight
      this.$refs.list.scrollTop = currentHeight * this.pointerCounter
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors";
.datalist {
  width: 100%;
  max-width: 28rem;
  position: relative;
}

.datalist__list {
  position: absolute;
  background: $color-content-bg;
  width: 100%;
  max-height: 8rem;
  overflow-y: scroll;
  border: 1px solid $color-sub-nav-bg;
  border-top: none;
}

.datalist__list-item {
  &:hover {
    background: $color-sub-nav-hover;
  }
}
.datalist__list-item__is-active {
  background: $color-sub-nav-hover;
}
</style>
