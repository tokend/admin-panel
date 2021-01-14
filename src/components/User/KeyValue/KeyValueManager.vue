<template>
  <div class="key-value-manager">
    <div class="key-value-manager__card">
      <div class="key-value-manager__form-add">
        <input-field
          v-model="createForm.key"
          class="key-value-manager__input"
          :label="'key-value-manager.lbl-key-input-field' | globalize"
          :placeholder="'key-value-manager.placeholder-new-key' | globalize"
          :disabled="isPending"
        />
        <input-field
          v-model="createForm.value"
          class="key-value-manager__input"
          :label="'key-value-manager.lbl-value-input-field' | globalize"
          :placeholder="'key-value-manager.placeholder-new-value' | globalize"
          :disabled="isPending"
        />

        <select-field
          v-model.number="createForm.entryType"
          class="key-value-manager__input"
          :label="'key-value-manager.lbl-entry-type' | globalize"
          :disabled="isPending"
        >
          <option
            v-for="(value, lbl) in KEY_VALUE_ENTRY_TYPE"
            :value="value"
            :key="`add-entryType-${value}`"
          >
            {{ lbl }}
          </option>
        </select-field>

        <button
          class="app__btn key-value-manager__btn"
          :disabled="isPending"
          @click="updateKeyValue(createForm)"
        >
          {{ "key-value-manager.btn-add" | globalize }}
        </button>
      </div>
    </div>

    <template v-if="keyValueList">
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

        <ul
          v-if="keyValueList"
          class="key-value-manager__ul"
        >
          <li
            class="key-value-manager__li"
            v-for="(item, i) in searchKeyValueList"
            :key="item.key+i">
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

              <span class="key-value-manager__li-type" :title="item.entryType">
                {{ item.entryType }}
              </span>
            </button>
          </li>
        </ul>
        <modal
          v-if="selectedKeyValue"
          @close-request="clearSelectedKeyValue"
          max-width="106rem"
        >
          <div class="key-value-manager__form-update">
            <div class="key-value-manager__fields">
              <input-field
                v-model="selectedKeyValue.key"
                class="key-value-manager__input"
                :label="'key-value-manager.lbl-key-input-field' | globalize"
                :placeholder="
                  'key-value-manager.placeholder-new-value' | globalize
                "
                :title="selectedKeyValue.key"
                disabled
              />

              <input-field
                v-model="selectedKeyValue.value"
                class="key-value-manager__input"
                :label="'key-value-manager.lbl-value-select-field' | globalize"
                :placeholder="
                  'key-value-manager.placeholder-new-value' | globalize
                "
                :disabled="formMixin.isDisabled"
                :title="selectedKeyValue.value"
              />

              <select-field
                v-model.number="selectedKeyValue.entryType"
                class="key-value-manager__input"
                :label="'key-value-manager.lbl-entry-type' | globalize"
                :disabled="formMixin.isDisabled"
              >
                <option
                  v-for="(value, lbl) in KEY_VALUE_ENTRY_TYPE"
                  :value="value"
                  :key="`update-entryType-${value}`"
                >
                  {{ lbl }}
                </option>
              </select-field>
            </div>

            <div class="key-value-manager__actions">
              <form-confirmation
                v-if="formMixin.isConfirmationShown"
                :is-pending="isPending"
                :message="confirmationMessage | globalize"
                @ok="updateKeyValue(selectedKeyValue)"
                @cancel="closeConfirmation"
                :ok-button-text="'key-value-manager.btn-confirm' | globalize"
                :cancel-button-text="'key-value-manager.btn-cancel' | globalize"
              />
              <div
                v-else
                class="key-value-manager__buttons"
              >
                <button
                  class="app__btn-secondary"
                  :disabled="isPending"
                  @click="clearSelectedKeyValue"
                >
                  {{ 'key-value-manager.btn-cancel' | globalize }}
                </button>
                <button
                  class="app__btn key-value-manager__btn"
                  :disabled="isPending"
                  @click="showConfirmation"
                >
                  {{ "key-value-manager.btn-update" | globalize }}
                </button>

                <button
                  class="app__btn app__btn--danger key-value-manager__btn"
                  :disabled="isPending"
                  @click="onDeleteKeyValue">
                  {{ "key-value-manager.btn-delete" | globalize }}
                </button>
              </div>
            </div>
          </div>
        </modal>
      </div>
    </template>
  </div>
</template>
<script>

import FormMixin from '@/mixins/form.mixin'
import Modal from '@comcom/modals/Modal'

import { SelectField, InputField } from '@comcom/fields'
import { base } from '@tokend/js-sdk'
import { KEY_VALUE_ENTRY_TYPE } from '@/constants'
import { api } from '@/api'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/bus'
import { mapGetters, mapActions } from 'vuex'

const KEY_VALUE_TYPE_SHORT_NAME = {
  uint32: 'u32',
  string: 'str',
  uint64: 'u64',
}

export default {
  components: {
    SelectField,
    InputField,
    Modal,
  },

  mixins: [FormMixin],

  data: _ => ({
    createForm: {
      key: '',
      value: '',
      entryType: KEY_VALUE_ENTRY_TYPE.uint32,
    },
    searchKeyOrType: '',
    selectedKeyValue: null,
    keyValueList: [],
    isPending: false,
    isOnDeleteKeyValue: false,
    KEY_VALUE_ENTRY_TYPE,
  }),

  computed: {
    ...mapGetters([
      'kvEntries',
    ]),
    confirmationMessage () {
      return this.isOnDeleteKeyValue ? 'key-value-manager.msg-delete-these-key'
        : 'key-value-manager.msg-please-recheck-all-fields'
    },

    searchKeyValueList () {
      return this.searchKeyOrType
        ? this.keyValueList.filter(i =>
          i.key.toLowerCase().includes(this.searchKeyOrType.toLowerCase()) ||
            i.entryType.toLowerCase()
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

    async updateKeyValue (keyValue) {
      this.isPending = true
      try {
        const operation = this.isOnDeleteKeyValue
          ? base.ManageKeyValueBuilder.deleteKeyValue(keyValue)
          : base.ManageKeyValueBuilder.putKeyValue(keyValue)

        await api.postOperations(operation)
        await this.getList()
        this.clearSelectedKeyValue()

        Bus.success('key-value-manager.submitted-successfully')
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isPending = false
      this.isOnDeleteKeyValue = false
      this.hideConfirmation()
    },

    async getList () {
      try {
        await this.loadKvEntries()
        this.keyValueList = this.kvEntries.map(i => {
          const name = KEY_VALUE_TYPE_SHORT_NAME[i.value.type.name]
          return {
            key: i.id,
            value: i.value[name],
            entryType: i.value.type.name,
          }
        })
      } catch (error) {
        ErrorHandler.process(error)
      }
    },

    closeConfirmation () {
      this.isOnDeleteKeyValue = false
      this.hideConfirmation()
    },

    onDeleteKeyValue () {
      this.isOnDeleteKeyValue = true
      this.showConfirmation()
    },

    selectKeyValue (item) {
      this.selectedKeyValue = {
        key: item.key,
        value: String(item.value),
        entryType: KEY_VALUE_ENTRY_TYPE[item.entryType],
      }
    },

    clearSelectedKeyValue () {
      this.selectedKeyValue = null
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
  margin-left: 2rem;
  margin-right: 6rem;
  width: 30rem;
  min-width: 10rem;

  &:last-child {
    margin-right: 0;
  }
}

.key-value-manager__form-update {
  width: 100%;
}

.key-value-manager__actions {
  display: flex;
  justify-content: flex-end;

  /deep/ .form-confirmation {
    justify-content: flex-end;
  }

  /deep/ .form-confirmation__btns {
    margin-left: 0;
  }
}

.key-value-manager__buttons {
  display: flex;
  justify-content: flex-end;

  :not(:last-child) {
    margin-right: 0.5rem;
  }
}

.key-value-manager__search-list {
  .key-value-manager__input {
    margin-left: 2.5rem;
    margin-bottom: 2rem;
    max-width: 30rem;

  }
}

.key-value-manager__fields,
.key-value-manager__form-add {
  width: 100%;
  display: flex;
  padding: 3rem 1rem;
  flex-wrap: nowrap;
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
