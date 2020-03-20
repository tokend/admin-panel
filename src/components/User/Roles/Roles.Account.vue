<template>
  <div class="key-value-manager" v-if="isLoaded">
    <template v-if="list.length">
      <div class="key-value-manager__card">
        <div class="key-value-manager__form">
          <select-field
            class="key-value-manager__input"
            v-model="form.role"
            :label="'key-value-manager.lbl-key-select-field' | globalize"
          >
            <option value="" />
            <option
              v-for="item in list"
              :value="item.id"
              :key="item.id"
            >
              {{ item.id }}
            </option>
          </select-field>

          <button
            v-if="isRoleSelected"
            class="app__btn
                 app__btn--small
                 key-value-manager__btn"
            @click="setUpdateRole()"
          >
            {{ "key-value-manager.btn-update" | globalize }}
          </button>
        </div>
      </div>
    </template>

    <div class="key-value-manager__card">
      <div class="key-value-manager__form">
        <div class="app__form-row">
          <tick-field
            v-for="item in rules"
            :key="item.id"
            class="app__form-field"
            :label="item.id"
            v-model="form.rules"
            :cb-value="item.id"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import FormMixin from '@/mixins/form.mixin'

import { KEY_VALUE_ENTRY_TYPE } from '@/constants'
import { api } from '@/api'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  name: 'account-roles',
  mixins: [FormMixin],

  data: _ => ({
    form: {
      role: '',
      rules: [],
      entryType: KEY_VALUE_ENTRY_TYPE.uint32,
    },
    list: [],
    rules: [],
    isLoaded: false,
    isRoleSelected: false,
    KEY_VALUE_ENTRY_TYPE,
  }),

  watch: {
    'form.role' (val) {
      if (val) {
        this.isRoleSelected = true
        const role = this.list.find(role => role.id === this.form.role)
        this.form.rules = role.rules.map(rules => rules.id)
      } else {
        this.isRoleSelected = false
        this.form.rules = []
      }
    },
  },

  async created () {
    await this.getList()
    await this.getRules()
    this.isLoaded = true
  },

  methods: {
    async getList () {
      try {
        const { data } = await api.getWithSignature('/v3/account_roles', {
          include: ['rules'],
          page: {
            limit: 100,
          },
        })
        this.list = data
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async getRules () {
      try {
        const { data } = await api.getWithSignature('/v3/account_rules', {
          page: {
            limit: 100,
          },
        })
        this.rules = data
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
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
