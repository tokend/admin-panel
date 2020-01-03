<template>
  <div class="key-value-manager">
    <template v-if="list.length">
      <div class="key-value-manager__card">
        <div class="key-value-manager__form">
          <select-field
            class="key-value-manager__input"
            v-model="updateForm.key"
            :label="'key-value-manager.lbl-key-select-field' | globalize"
          >
            <option
              v-for="item in list"
              :value="item.id"
              :key="item.id">
              {{ item.id }}
            </option>
          </select-field>

          <input-field
            v-model="updateForm.value"
            class="key-value-manager__input"
            :label="'key-value-manager.lbl-value-select-field' | globalize"
            :placeholder="'key-value-manager.placeholder-new-value' | globalize"
          />

          <button
            class="app__btn
                 app__btn--small
                 key-value-manager__btn"
            :disabled="isPending"
            @click="setKeyValue(updateForm.key, updateForm.value)"
          >
            {{ "key-value-manager.btn-update" | globalize }}
          </button>
        </div>
      </div>
    </template>

    <div class="key-value-manager__card">
      <div class="key-value-manager__form">
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
            :key="value"
          >
            {{ lbl }}
          </option>
        </select-field>

        <button
          class="app__btn
                      app__btn--small
                      key-value-manager__btn"
          :disabled="isPending"
          @click="
            setKeyValue(createForm.key, createForm.value, createForm.entryType)
          "
        >
          {{ "key-value-manager.btn-add" | globalize }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { SelectField, InputField } from '@comcom/fields'

import { base } from '@tokend/js-sdk'
import { KEY_VALUE_ENTRY_TYPE } from '@/constants'
import { api } from '@/api'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/bus'
import { mapGetters } from 'vuex'

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

  data: _ => ({
    createForm: {
      key: '',
      value: '',
      entryType: KEY_VALUE_ENTRY_TYPE.uint32,
    },
    updateForm: {
      key: '',
      value: '',
    },
    list: [],
    isPending: false,
    KEY_VALUE_ENTRY_TYPE,
  }),

  computed: {
    ...mapGetters(['kvEntries']),
  },

  watch: {
    'updateForm.key' (key) {
      const item = this.list.find(elem => elem.id === key)
      const name = KEY_VALUE_TYPE_SHORT_NAME[item.value.type.name]
      this.updateForm.value = item.value[name]
    },
  },

  created () {
    this.getList()
  },

  methods: {
    async setKeyValue (key, value, entryType) {
      this.isPending = true
      try {
        const operation = base.ManageKeyValueBuilder.putKeyValue({
          key,
          value,
          entryType,
        })

        await api.postOperations(operation)
        await this.getList()

        Bus.success('Submitted successfully')
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isPending = false
    },

    async getList () {
      this.list = this.kvEntries

      if (!this.list.length) {
        return
      }

      if (!this.updateForm.key) {
        const item = this.list[0]
        const name = KEY_VALUE_TYPE_SHORT_NAME[item.value.type.name]
        this.updateForm.key = item.id
        this.updateForm.value = item.value[name]
      }
    },
  },
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.key-value-manager__card {
  background-color: $color-content-bg;
  border-radius: 0.3rem;
  box-shadow: 0.7px 0.7px 5.6px 0.4px rgba(170, 170, 170, 0.72);
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.key-value-manager__input {
  margin-left: 20px;
  margin-right: 60px;
  width: 300px;
}

.key-value-manager__btn {
  max-width: 200px;
}

.key-value-manager__form {
  width: 100%;
  display: flex;
  padding: 30px 10px;
  flex-wrap: nowrap;
}
</style>
