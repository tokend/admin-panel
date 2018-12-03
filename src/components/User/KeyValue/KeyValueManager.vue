<template>
  <div class="key-value-manager">
    <div class="key-value-manager__card">

      <template v-if="list.length">
        <div class="key-value-manager__form">
          <select-field class="key-value-manager__filter"
                        v-model="key"
                        label="Key"
                        @input="selectKey"
          >
            <option
              v-for="item in list"
              :value="item.key"
              :key="item.key"
            >
              {{item.key}}
            </option>
          </select-field>

          <input-field v-model="value"
                       class="fee-list__filter key-value-manager__input"
                       label="Value"
                       placeholder="Enter new value"
          />
          <button
            class="app__btn
                 app__btn--small
                 key-value-manager__btn"
            :disabled="isPending"
            @click="setNewValue()"
          >
            Save
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import api from '@/api'
import {
  SelectField,
  InputField
} from '@comcom/fields'

export default {
  components: {
    SelectField,
    InputField
  },
  data: _ => ({
    key: null,
    value: null,
    list: null,

    isPending: false
  }),
  created () {
    this.getList()
  },
  methods: {
    selectKey () {
      const item = this.list
        .find(elem => elem.key === this.key)

      this.value = item[`${item.type.name}Value`]
    },
    async setNewValue () {
      this.isPending = true
      try {
        await api.keyValue.setNew({
          key: this.key,
          value: this.value
        })
        await this.getList()
        this.$store.dispatch('SET_INFO', 'Submitted successfully')
      } catch (error) {
        console.error(error)
        error.showMessage()
      }
      this.isPending = false
    },
    async getList () {
      const { data: list } = await api.keyValue.getList()
      this.list = list
      if (!list.length) {
        return
      }
      if (!this.key) {
        this.key = list[0].key
      }
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
  }
</style>
