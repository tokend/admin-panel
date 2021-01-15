<template>
  <div class="key-value-manager">
    <div class="key-value-manager__card">
      <key-value-form
        @submited="updateList"
      />
    </div>
    <template v-if="keyValueList.length">
      <div class="key-value-manager__search-list">
        <input-field
          v-model="searchKeyOrType"
          class="key-value-manager__input"
          :label="'key-value-manager.lbl-search' | globalize"
          is-search
        />
      </div>

      <div class="key-value-manager__list">
        <div class="key-value-manager__table-header">
          <span class="key-value-manager__li-key secondary">
            {{ 'key-value-manager.key-title' | globalize }}
          </span>

          <span class="key-value-manager__li-value secondary">
            {{ 'key-value-manager.value-title' | globalize }}
          </span>

          <span class="key-value-manager__li-type secondary">
            {{ 'key-value-manager.entry-type-title' | globalize }}
          </span>
        </div>

        <ul class="key-value-manager__ul">
          <li
            class="key-value-manager__li"
            v-for=" item in searchKeyValueList"
            :key="item.key">
            <button
              @click="selectKeyValue(item)"
              class="key-value-manager__li-btn"
            >
              <span class="key-value-manager__li-key" :title="item.key">
                {{ item.key }}
              </span>

              <span class="key-value-manager__li-value" :title="item.value">
                {{ item.value }}
              </span>

              <span
                class="key-value-manager__li-type"
                :title="item.entryTypeName"
              >
                {{ item.entryTypeName }}
              </span>
            </button>
          </li>
        </ul>
        <modal
          v-if="selectedKeyValue.key"
          @close-request="clearSelectedKeyValue"
          max-width="106rem"
        >
          <key-value-form
            :selected-key-value="selectedKeyValue"
            is-update-form
            @submited="updateList"
            @close-modal="clearSelectedKeyValue"
          />
        </modal>
      </div>
    </template>
  </div>
</template>
<script>

import Modal from '@comcom/modals/Modal'
import KeyValueForm from './KeyValueForm'

import { InputField } from '@comcom/fields'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { mapGetters, mapActions } from 'vuex'
import { KeyValueRecord } from '@/js/records/keyValue.record'

export default {
  components: {
    InputField,
    Modal,
    KeyValueForm,
  },

  data: _ => ({
    keyValueList: [],
    selectedKeyValue: {},
    searchKeyOrType: '',
  }),

  computed: {
    ...mapGetters([
      'kvEntries',
    ]),

    searchKeyValueList () {
      return this.searchKeyOrType
        ? this.keyValueList.filter(i =>
          i.key.toLowerCase().includes(this.searchKeyOrType.toLowerCase()) ||
            i.entryTypeName.toLowerCase()
              .includes(this.searchKeyOrType.toLowerCase())
        )
        : this.keyValueList
    },
  },

  async created () {
    await this.getList()
  },

  methods: {
    ...mapActions({
      loadKvEntries: 'LOAD_KV_ENTRIES',
    }),

    async getList () {
      try {
        await this.loadKvEntries()
        this.keyValueList = this.kvEntries.map(i => new KeyValueRecord(i))
      } catch (error) {
        ErrorHandler.process(error)
      }
    },

    async updateList () {
      await this.getList()
      this.clearSelectedKeyValue()
    },

    selectKeyValue (item) {
      this.selectedKeyValue = item
    },

    clearSelectedKeyValue () {
      this.selectedKeyValue = {}
    },
  },
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.key-value-manager__card {
  background-color: $color-content-bg;
  border-radius: 0.3rem;
  box-shadow: 0.07rem 0.07rem 0.56rem 0.04rem rgba(170, 170, 170, 0.72);
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 4rem;
}

.key-value-manager__input {
  margin-left: 2.5rem;
  margin-bottom: 2rem;
  max-width: 30rem;
  min-width: 10rem;
}

.key-value-manager__table-header,
.key-value-manager__ul {
  max-width: 106rem;
}

.key-value-manager__table-header {
  width: 100%;
  display: flex;
  padding: 0 2.5rem;
  margin-bottom: 0.5rem;
}

.key-value-manager__li {
  background-color: $color-content-bg;
  border-radius: 0.3rem;
  box-shadow: 0.07rem 0.07rem 0.56rem 0.04rem rgba(170, 170, 170, 0.72);

  & + & {
    margin-top: 2rem;
  }
}

.key-value-manager__li-btn {
  width: 100%;
  display: flex;
  padding: 2rem 2.5rem;
  text-decoration: none;
  color: inherit;
}

.key-value-manager__li-key {
  width: 33%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}

.key-value-manager__li-value {
  width: 33%;
  text-align: center;
}

.key-value-manager__li-type {
  width: 33%;
  text-align: right;
}
</style>
