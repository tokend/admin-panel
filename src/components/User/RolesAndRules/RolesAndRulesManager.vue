<template>
  <div class="roles-and-rules-manager">
    <div class="app-list-filters">
      <select-field
        class="roles-and-rules-manager__select"
        v-model="selectedRoleId"
      >
        <option
          v-for="(name, index) in rolesIdList"
          :key="index"
          :value="name">
          {{ name | roleIdToString }}
        </option>
      </select-field>
    </div>
    <roles-and-rules-form
      :rules="selectedRole.rules"
      @submited="addRule"
    />
    <h2 class="roles-and-rules-manager__table-title">
      {{ 'roles-and-rules-manager.table-title' | globalize }}
    </h2>
    <div class="roles-and-rules-manager__table-header">
      <span
        class="roles-and-rules-manager__li-title
          secondary roles-and-rules-manager__li-title-id">
        {{ 'roles-and-rules-manager.id-title' | globalize }}
      </span>
      <span
        class="roles-and-rules-manager__li-title
          secondary roles-and-rules-manager__li-title-resource">
        {{ 'roles-and-rules-manager.resource-title' | globalize }}
      </span>
      <span
        class="roles-and-rules-manager__li-title
          secondary roles-and-rules-manager__li-title-action">
        {{ 'roles-and-rules-manager.action-title' | globalize }}
      </span>
    </div>
    <ul class="roles-and-rules-manager__ul">
      <li
        class="roles-and-rules-manager__li"
        v-for="item in selectedRole.rules"
        :key="item.id">
        <button
          class="roles-and-rules-manager__li-content"
          @click="itemToShow = item"
        >
          <span
            class="roles-and-rules-manager__li-column
            roles-and-rules-manager__li-id"
          >
            {{ item.id }}
          </span>
          <span
            class="roles-and-rules-manager__li-column
            roles-and-rules-manager__li-resource">
            {{ item.resource.type.name }}
          </span>
          <span
            class="roles-and-rules-manager__li-column
            roles-and-rules-manager__li-action">
            {{ item.action.name }}
          </span>
          <div class="roles-and-rules-manager__li-btn-wrp">
            <button
              class="app__btn
              app__btn--danger roles-and-rules-manager__remove-btn"
              :disabled="isButtonsDisabled"
              @click.stop="showModal(item.id)">
              {{ 'roles-and-rules-manager.btn-remove' | globalize }}
            </button>
          </div>
        </button>
      </li>
    </ul>
    <modal
      v-if="isShowModal"
      max-width="40rem"
    >
      <p class="roles-and-rules-manager__modal-message">
        {{ 'roles-and-rules-manager.remove-message' | globalize }}
      </p>
      <div class="roles-and-rules-manager__modal-btn-wrapper">
        <button
          class="app__btn roles-and-rules-manager__modal-btn"
          @click="deleteRule(idToRemove)"
        >
          {{ 'roles-and-rules-manager.btn-submit' | globalize }}
        </button>
        <button
          class="app__btn-secondary roles-and-rules-manager__modal-btn"
          @click="hideModal"
        >
          {{ 'roles-and-rules-manager.btn-cancel' | globalize }}
        </button>
      </div>
    </modal>
    <modal
      v-if="itemToShow"
      @close-request="itemToShow = null"
      max-width="64rem"
    >
      <h2>
        {{ 'roles-and-rules-manager.rules-details' | globalize }}
      </h2>
      <details-reader
        :details="itemToShow"
        :is-omitted="false"
      />
    </modal>
  </div>
</template>

<script>
import { api, loadingDataViaLoop } from '@/api'
import { SelectField } from '@comcom/fields'
import { base } from '@tokend/js-sdk'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { RoleRecord } from '@/js/records/role.record'
import { Bus } from '@/utils/bus'
import Modal from '@comcom/modals/Modal'
import RolesAndRulesForm from './RolesAndRulesForm.vue'
import DetailsReader from '@comcom/details/DetailsReader'
import { mapGetters, mapActions } from 'vuex'
import { KeyValueRecord } from '@/js/records/keyValue.record'

const KEY_VALUE_ROLE_PREFIX = 'account_role:'
const ADMIN_ROLE_ID = '1'

export default {

  components: {
    SelectField,
    Modal,
    RolesAndRulesForm,
    DetailsReader,
  },

  data () {
    return {
      rolesList: [],
      rolesIdList: [],
      keyValueList: [],
      selectedRoleId: '',
      KEY_VALUE_ROLE_PREFIX,
      isShowModal: false,
      idToRemove: 0,
      isButtonsDisabled: false,
      itemToShow: null,
    }
  },

  computed: {
    ...mapGetters([
      'kvEntries',
    ]),
    selectedRole () {
      return this.rolesList.find(item => {
        return item.id === this.selectedRoleId
      })
    },
  },

  async created () {
    try {
      this.rolesList = await this.getRoles()
      await this.loadKvEntries()
      this.keyValueList = this.kvEntries.map(i => new KeyValueRecord(i))
      this.rolesIdList = this.getRolesId(this.rolesList)
    } catch (error) {
      ErrorHandler.process(error)
    }
  },
  methods: {
    ...mapActions({
      loadKvEntries: 'LOAD_KV_ENTRIES',
    }),
    async getRoles () {
      const response = await api.get(`/v3/account_roles`, {
        include: 'rules',
        page: {
          limit: 100,
        },
      })
      let data = await loadingDataViaLoop(response)
      return data.filter(item => item.id !== ADMIN_ROLE_ID)
    },
    getRolesId (list) {
      const idList = list.map(item => { return item.id })
        .filter(item => item !== ADMIN_ROLE_ID)
      this.selectedRoleId = idList[0]
      return idList
    },
    async updateRole () {
      try {
        const operation = base.ManageAccountRoleBuilder.update(
          new RoleRecord(this.selectedRole))
        await api.postOperations(operation)
        this.rolesList = await this.getRoles()
      } catch (error) {
        ErrorHandler.process(error)
      }
    },
    showModal (id) {
      this.idToRemove = id
      this.isShowModal = true
    },

    hideModal () {
      this.idToRemove = 0
      this.isShowModal = false
    },

    async deleteRule (id) {
      this.hideModal()
      this.isButtonsDisabled = true
      const ruleToDelete = this.selectedRole.rules.find(item => item.id === id)
      const index = this.selectedRole.rules.indexOf(ruleToDelete)
      this.selectedRole.rules.splice(index, 1)
      await this.updateRole()
      Bus.success('roles-and-rules-manager.remove-successfully')
      this.isButtonsDisabled = false
    },
    async addRule (inputId) {
      const ruleToAdd = { id: inputId }
      this.selectedRole.rules.push(ruleToAdd)
      await this.updateRole()
      Bus.success('roles-and-rules-manager.addition-successfully')
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.roles-and-rules-manager__select {
  flex: 0.333333;
}
.roles-and-rules-manager__table-title {
  margin: 5rem 0 0 0;
}

.roles-and-rules-manager__table-header {
  width: 100%;
  display: flex;
  padding: 0 2.5rem;
  margin-bottom: 0.5rem;
  margin-top: 2rem;
}

.roles-and-rules-manager__li-title {
  width: 28%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}

.roles-and-rules-manager__li-title-id {
  width: 18%;
}

.roles-and-rules-manager__li-title-resource {
  width: 32%;
}

.roles-and-rules-manager__li-title-action {
  width: 32%;
}

.roles-and-rules-manager__li {
  background-color: $color-content-bg;
  border-radius: 0.3rem;
  box-shadow: 0.07rem 0.07rem 0.56rem 0.04rem rgba(170, 170, 170, 0.72);

  & + & {
    margin-top: 2rem;
  }
}

.roles-and-rules-manager__li-btn {
  width: 100%;
}

.roles-and-rules-manager__li-content {
  width: 100%;
  display: flex;
  padding: 2rem 2.5rem;
  text-decoration: none;
  color: inherit;
  min-height: 8.6rem;
}

.roles-and-rules-manager__li-column {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  margin-top: auto;
  margin-bottom: auto;
}

.roles-and-rules-manager__li-id {
  width: 18%
}

.roles-and-rules-manager__li-resource {
  width: 32%
}

.roles-and-rules-manager__li-action {
  width: 32%
}

.roles-and-rules-manager__li-btn-wrp{
    width: 18%;
}

.roles-and-rules-manager__remove-btn {
  width: 100%;
  display: block;
  margin-left: auto;
}

.roles-and-rules-manager__modal-message {
  font-size: 22px;
  text-align: center;
  margin-bottom: 5rem;
}

.roles-and-rules-manager__modal-btn-wrapper {
  display: flex;
  margin: 0 -1rem;
}

.roles-and-rules-manager__modal-btn {
  flex: 1 1 auto;
  margin: 0 1rem;
}
</style>
