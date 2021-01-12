<template>
  <div class="key-value-manager">
    <template v-if="list.length">
      <div class="key-value-manager__card">
        <div class="key-value-manager__form-update">
          <div class="key-value-manager__fields">
            <select-field
              class="key-value-manager__input"
              v-model="updateForm.key"
              :label="'key-value-manager.lbl-key-select-field' | globalize"
              :disabled="formMixin.isDisabled"
            >
              <option
                v-for="item in list"
                :value="item.id"
                :key="item.id"
              >
                {{ item.id }}
              </option>
            </select-field>

            <input-field
              v-model="updateForm.value"
              class="key-value-manager__input"
              :label="'key-value-manager.lbl-value-select-field' | globalize"
              :placeholder="
                'key-value-manager.placeholder-new-value' | globalize
              "
              :disabled="formMixin.isDisabled"
            />

            <select-field
              v-model.number="updateForm.entryType"
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
              @ok="updateKeyValue(updateForm)"
              @cancel="closeConfirmation"
              :ok-button-text="'key-value-manager.btn-confirm' | globalize"
              :cancel-button-text="'key-value-manager.btn-cancel' | globalize"
            />
            <div
              v-else
              class="key-value-manager__buttons"
            >
              <button
                class="app__btn key-value-manager__btn"
                :disabled="isPending"
                @click="showConfirmation"
              >
                {{ "key-value-manager.btn-update" | globalize }}
              </button>

              <button
                class="app__btn key-value-manager__btn"
                :disabled="isPending"
                @click="onDeleteKeyValue">
                {{ "key-value-manager.btn-delete" | globalize }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="key-value-manager__card">
      <div class="key-value-manager__form-add">
        <input-field
          v-model="createForm.key"
          class="key-value-manager__input"
          :label="'key-value-manager.lbl-key-input-field' | globalize"
          :placeholder="'key-value-manager.placeholder-new-key' | globalize"
        />
        <input-field
          v-model="createForm.value"
          class="key-value-manager__input"
          :label="'key-value-manager.lbl-value-input-field' | globalize"
          :placeholder="'key-value-manager.placeholder-new-value' | globalize"
        />

        <select-field
          v-model.number="createForm.entryType"
          class="key-value-manager__input"
          :label="'key-value-manager.lbl-entry-type' | globalize"
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
  </div>
</template>
<script>

import FormMixin from '@/mixins/form.mixin'

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
  },

  mixins: [FormMixin],

  data: _ => ({
    createForm: {
      key: '',
      value: '',
      entryType: KEY_VALUE_ENTRY_TYPE.uint32,
    },
    updateForm: {
      key: '',
      value: '',
      entryType: '',
    },
    list: [],
    isPending: false,
    KEY_VALUE_ENTRY_TYPE,
    isOnDeleteKeyValue: false,
  }),

  computed: {
    ...mapGetters([
      'kvEntries',
    ]),
    confirmationMessage () {
      return this.isOnDeleteKeyValue ? 'key-value-manager.msg-delete-these-key'
        : 'key-value-manager.msg-please-recheck-all-fields'
    },
  },

  watch: {
    'updateForm.key' (key) {
      const item = this.list.find(elem => elem.id === key)
      const name = KEY_VALUE_TYPE_SHORT_NAME[item.value.type.name]
      this.updateForm.value = item.value[name]
      this.updateForm.entryType = KEY_VALUE_ENTRY_TYPE[item.value.type.name]
    },

    'updateForm.value' (value) {
      this.updateForm.value = String(value)
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
        this.list = this.kvEntries

        if (!this.list.length) {
          return
        }

        const item = !this.updateForm.key || this.isOnDeleteKeyValue
          ? this.list[0]
          : this.list.find(elem => elem.id === this.updateForm.key)

        const name = KEY_VALUE_TYPE_SHORT_NAME[item.value.type.name]
        this.updateForm.key = item.id
        this.updateForm.value = item.value[name]
        this.updateForm.entryType = KEY_VALUE_ENTRY_TYPE[item.value.type.name]
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
  margin-bottom: 2rem;
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

  :first-child {
    margin-right: 0.5rem;
  }
}

.key-value-manager__fields,
.key-value-manager__form-add {
  width: 100%;
  display: flex;
  padding: 3rem 1rem;
  flex-wrap: nowrap;
}
</style>
