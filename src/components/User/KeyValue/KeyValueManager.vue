<template>
  <div class="key-value-manager">
    <template v-if="list.length">
      <div class="key-value-manager__card">
        <div class="key-value-manager__form">
          <select-field class="key-value-manager__input"
                        v-model="updateForm.key"
                        label="Key"
          >
            <option
              v-for="item in list"
              :value="item.key"
              :key="item.key"
            >
              {{item.key}}
            </option>
          </select-field>

          <input-field v-model="updateForm.value"
                       class="key-value-manager__input"
                       label="Value"
                       placeholder="Enter new value"
          />

          <button
            class="app__btn
                 app__btn--small
                 key-value-manager__btn"
            :disabled="isPending"
            @click="setKeyValue(updateForm.key, updateForm.value)"
          >
            Update
          </button>
        </div>
      </div>
    </template>

    <div class="key-value-manager__card">
      <div class="key-value-manager__form">
        <input-field v-model="createForm.key"
                     class="key-value-manager__input"
                     label="Key"
                     placeholder="Enter new key"
        />
        <input-field v-model="createForm.value"
                     class="key-value-manager__input"
                     label="Value"
                     placeholder="Enter new value"
        />

        <select-field v-model.number="createForm.entryType"
                      class="key-value-manager__input"
                      label="Entry type"
        >
          <option
            v-for="(value, lbl) in KEY_VALUE_ENTRY_TYPE"
            :value="value"
            :key="value"
          >
            {{ lbl }}
          </option>
        </select-field>

        <button class="app__btn
                      app__btn--small
                      key-value-manager__btn"
                :disabled="isPending"
                @click="setKeyValue(createForm.key, createForm.value, createForm.entryType)"
        >
          Add
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { Sdk } from '@/sdk'
import {
  SelectField,
  InputField
} from '@comcom/fields'
import { KEY_VALUE_ENTRY_TYPE } from '../../../constants'

export default {
  components: {
    SelectField,
    InputField
  },
  data: _ => ({
    createForm: {
      key: '',
      value: '',
      entryType: KEY_VALUE_ENTRY_TYPE.uint32
    },
    updateForm: {
      key: '',
      value: ''
    },

    list: [],
    isPending: false,
    KEY_VALUE_ENTRY_TYPE
  }),
  created () {
    this.getList()
  },
  methods: {
    async setKeyValue (key, value, entryType) {
      this.isPending = true
      try {
        const operation = Sdk.base.ManageKeyValueBuilder.putKeyValue({ key, value, entryType })
        await Sdk.horizon.transactions.submitOperations(operation)
        await this.getList()

        this.$store.dispatch('SET_INFO', 'Submitted successfully')
      } catch (error) {
        console.error(error)
        if (error.showMessage) {
          error.showMessage()
        } else {
          this.$store.dispatch('SET_ERROR', 'Failed to submit operation')
        }
      }
      this.isPending = false
    },
    async getList () {
      const response = await Sdk.horizon.keyValue.getAll()
      this.list = response.data

      if (!this.list.length) {
        return
      }

      if (!this.updateForm.key) {
        const item = this.list[0]

        this.updateForm.key = item.key
        this.updateForm.value = item[`${item.type.name}Value`]
      }
    }
  },
  watch: {
    'updateForm.key' (key) {
      const item = this.list.find(elem => elem.key === key)
      this.updateForm.value = item[`${item.type.name}Value`]
    }
  }
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
