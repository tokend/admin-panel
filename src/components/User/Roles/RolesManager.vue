<template>
  <div class="roles-manager">
    <template v-if="isLoaded">
      <template v-if="isLoadFailed">
        <div class="app-list">
          <div class="app-list__li-like">
            <p class="danger">
              {{ "roles-manager.error" | globalize }}
            </p>
          </div>
        </div>
      </template>
      <template v-else>
        <div v-if="list.length && rules.length" class="roles__card">
          <div class="roles__form">
            <select-field
              class="roles__input"
              v-model="form.role"
              :disabled="formMixin.isDisabled"
              :label="'roles-manager.lbl-key-select-field' | globalize"
            >
              <option value="" />
              <option
                v-for="item in list"
                :value="item.id"
                :key="item.id"
              >
                {{ item.nameOrId }}
              </option>
            </select-field>
          </div>
        </div>

        <div class="roles__card">
          <div class="roles__form">
            <template v-if="rules.length">
              <input-field
                class="app__form-field roles__role-name"
                :label="'roles-manager.role-name' | globalize"
                v-model="form.roleName"
                :disabled="formMixin.isDisabled"
              />

              <div class="roles__rules-wrp">
                <h4 class="roles__rules-title">
                  {{ 'roles-manager.rules-title' | globalize }}
                </h4>
                <div class="roles__rules">
                  <tick-field
                    class="roles__rule"
                    v-for="item in rules"
                    :key="item.id"
                    :label="item.nameOrId"
                    v-model="form.rules"
                    :cb-value="item.id"
                    :disabled="formMixin.isDisabled"
                  />
                </div>
              </div>

              <div class="roles__actions">
                <div
                  v-if="isRoleSelected"
                  class="roles__actions-selected-rule"
                >
                  <button
                    class="app__btn
                      app__btn--small
                      roles__btn
                    "
                    @click="submit(ACTIONS.update)"
                    :disabled="formMixin.isDisabled"
                  >
                    {{ "roles-manager.btn-update" | globalize }}
                  </button>

                  <button
                    class="app__btn
                      app__btn--small
                      app__btn--danger
                      roles__btn
                    "
                    @click="submit(ACTIONS.remove)"
                    :disabled="formMixin.isDisabled"
                  >
                    {{ "roles-manager.btn-remove" | globalize }}
                  </button>
                </div>

                <button
                  v-else
                  class="app__btn
                    app__btn--small
                    roles__btn
                  "
                  @click="submit(ACTIONS.create)"
                  :disabled="formMixin.isDisabled"
                >
                  {{ "roles-manager.btn-create" | globalize }}
                </button>
              </div>
            </template>
            <template v-else>
              <p>{{ "roles-manager.no-rules-created-yet" | globalize }}</p>
            </template>
          </div>
        </div>
      </template>
    </template>
    <template v-else>
      <div class="app-list">
        <div class="app-list__li-like">
          <p>{{ "roles-manager.loading" | globalize }}</p>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import FormMixin from '@/mixins/form.mixin'

import { api, loadingDataViaLoop } from '@/api'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { base } from '@tokend/js-sdk'
import { Bus } from '@/utils/bus'
import { Role } from '@/js/records/role.record'
import { Rule } from '@/js/records/rule.record'
import { confirmAction } from '@/js/modals/confirmation_message'

const ACTIONS = {
  create: 'create',
  update: 'update',
  remove: 'remove',
}

export default {
  name: 'roles',
  mixins: [FormMixin],

  data: _ => ({
    form: {
      role: '',
      rules: [],
      roleName: '',
    },
    list: [],
    rules: [],
    isLoaded: false,
    isLoadFailed: false,
    isRoleSelected: false,
    ACTIONS,
  }),

  watch: {
    'form.role' (val) {
      if (val) {
        this.isRoleSelected = true
        const role = this.list.find(role => role.id === this.form.role)
        this.form.rules = role.rulesIDs
        this.form.roleName = role.name
      } else {
        this.isRoleSelected = false
        this.clearFields()
      }
    },
  },

  async created () {
    await this.loadRulesAndRoles()
  },

  methods: {
    async getList () {
      const response = await api.getWithSignature('/v3/account_roles', {
        include: ['rules'],
        page: {
          limit: 100,
        },
      })
      const roles = await loadingDataViaLoop(response)
      this.list = roles.map(role => new Role(role))
    },

    async getRules () {
      const response = await api.getWithSignature('/v3/account_rules', {
        page: {
          limit: 100,
        },
      })
      const rules = await loadingDataViaLoop(response)
      this.rules = rules.map(rule => new Rule(rule))
    },

    async submit (actionType) {
      if (actionType === ACTIONS.remove && !await confirmAction()) {
        return
      }

      this.disableForm()

      const operation = this.buildRoleOperation(actionType)
      try {
        await api.postOperations(operation)
        await this.loadRulesAndRoles()
        if (actionType !== ACTIONS.update) {
          this.clearFields()
        }
        const successMessage = this.successMessage(actionType)
        Bus.success(successMessage)
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.enableForm()
    },

    buildRoleOperation (actionType) {
      switch (actionType) {
        case ACTIONS.create:
          return base.ManageAccountRoleBuilder.create({
            ruleIDs: this.form.rules,
            details: {
              ...(this.form.roleName
                ? { name: this.form.roleName }
                : {}
              ),
            },
          })
        case ACTIONS.update:
          return base.ManageAccountRoleBuilder.update({
            ruleIDs: this.form.rules,
            roleId: this.form.role,
            details: {
              ...(this.form.roleName
                ? { name: this.form.roleName }
                : {}
              ),
            },
          })
        case ACTIONS.remove:
          return base.ManageAccountRoleBuilder.remove({
            roleId: this.form.role,
          })
      }
    },

    successMessage (actionType) {
      let successMessage = ''

      switch (actionType) {
        case ACTIONS.create:
          successMessage = 'roles-manager.role-created-successfully'
          break
        case ACTIONS.update:
          successMessage = 'roles-manager.role-updated-successfully'
          break
        case ACTIONS.remove:
          successMessage = 'roles-manager.role-removed-successfully'
          break
      }
      return successMessage
    },

    async loadRulesAndRoles () {
      this.isLoaded = false
      this.isLoadFailed = false
      try {
        await this.getList()
        await this.getRules()
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
        this.isLoadFailed = true
      }
      this.isLoaded = true
    },
  },
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.roles__card {
  background-color: $color-content-bg;
  border-radius: 0.3rem;
  box-shadow: 0.7px 0.7px 5.6px 0.4px rgba(170, 170, 170, 0.72);
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.roles__input {
  margin-right: 6rem;
  width: 300px;
}

.roles__btn {
  max-width: 20rem;
}

.roles__form {
  width: 100%;
  display: flex;
  padding: 3rem 1rem;
  flex-direction: column;
}

.roles__rules {
  display: flex;
  flex-wrap: wrap;
}

.roles__rule {
  width: 10rem;
}

.roles__role-name {
  width: 30rem;
}

.roles__actions {
  margin-top: 2rem;
}

.roles__rules-wrp {
  display: flex;
  flex-direction: column;
}

.roles__rules-title {
  margin-top: 3rem;
}
</style>
