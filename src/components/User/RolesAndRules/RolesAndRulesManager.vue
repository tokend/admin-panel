<template>
  <div class="roles-and-rules-manager">
    <template v-if="isLoaded">
      <template v-if="isLoadFailed">
        <p>
          {{ 'roles-and-rules-manager.loading-error-msg' | globalize }}
        </p>
      </template>
      <template v-else>
        <div class="app-list-filters">
          <select-field
            class="roles-and-rules-manager__select"
            v-model="selectedRoleId"
          >
            <option
              v-for="item in filteredRolesList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.id | roleIdToString }}
            </option>
          </select-field>
        </div>
        <roles-and-rules-form
          :selected-role="selectedRole"
          @submitted="getRoles()"
        />
        <h2 class="roles-and-rules-manager__table-title">
          {{ 'roles-and-rules-manager.table-title' | globalize }}
        </h2>
        <div class="roles-and-rules-manager__table-header">
          <span
            class="
              roles-and-rules-manager__li-title
              secondary roles-and-rules-manager__li-title-id
            "
          >
            {{ 'roles-and-rules-manager.id-title' | globalize }}
          </span>
          <span
            class="
              roles-and-rules-manager__li-title
              secondary roles-and-rules-manager__li-title-resource
            "
          >
            {{ 'roles-and-rules-manager.resource-title' | globalize }}
          </span>
          <span
            class="
              roles-and-rules-manager__li-title
              secondary roles-and-rules-manager__li-title-action
            "
          >
            {{ 'roles-and-rules-manager.action-title' | globalize }}
          </span>
        </div>
        <ul class="roles-and-rules-manager__ul">
          <li
            class="roles-and-rules-manager__li"
            v-for="item in selectedRole.rules"
            :key="item.id"
          >
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
                class="
                  roles-and-rules-manager__li-column
                  roles-and-rules-manager__li-resource
                "
              >
                {{ item.resource.type.name }}
              </span>
              <span
                class="
                  roles-and-rules-manager__li-column
                  roles-and-rules-manager__li-action
                "
              >
                {{ item.action.name }}
              </span>
              <div class="roles-and-rules-manager__li-btn-wrp">
                <button
                  class="
                    app__btn
                    app__btn--danger roles-and-rules-manager__remove-btn
                  "
                  :disabled="isRemoveButtonsDisabled"
                  @click.stop="showModal(item.id)"
                >
                  {{ 'roles-and-rules-manager.btn-remove' | globalize }}
                </button>
              </div>
            </button>
          </li>
        </ul>
      </template>
    </template>

    <template v-else>
      <p>
        {{ "roles-and-rules-manager.loading" | globalize }}
      </p>
    </template>

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
          {{ 'roles-and-rules-manager.btn-ca:ncel' | globalize }}
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
import Modal from '@comcom/modals/Modal'
import RolesAndRulesForm from './RolesAndRulesForm.vue'
import DetailsReader from '@comcom/details/DetailsReader'
import apiHelper from '@/apiHelper'

import { api, loadingDataViaLoop } from '@/api'
import { SelectField } from '@comcom/fields'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { Bus } from '@/utils/bus'
import { ADMIN_CONST } from '@/constants'
import { RoleRecord } from '@/js/records/role.record'
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
      selectedRoleId: '',
      isShowModal: false,
      idToRemove: '',
      isRemoveButtonsDisabled: false,
      itemToShow: null,
      isLoaded: false,
      isLoadFailed: false,
    }
  },

  computed: {
    selectedRole () {
      return this.filteredRolesList.find(item => {
        return item.id === this.selectedRoleId
      })
    },
    filteredRolesList () {
      return this.rolesList.filter(item => +item.id !== ADMIN_CONST.ROLE_ID)
    },
  },

  async created () {
    try {
      await this.getRoles()
      this.selectedRoleId = this.filteredRolesList[0].id
    } catch (error) {
      ErrorHandler.process(error)
    }
  },
  methods: {
    async getRoles () {
      try {
        const response = await api.get(`/v3/account_roles`, {
          include: 'rules',
          page: {
            limit: 100,
          },
        })
        this.rolesList = await loadingDataViaLoop(response)
        this.rolesList.map(item => new RoleRecord(item))
      } catch (error) {
        ErrorHandler.process(error)
        this.isLoadFailed = true
      }
      this.isLoaded = true
    },

    showModal (id) {
      this.idToRemove = id
      this.isShowModal = true
    },

    hideModal () {
      this.idToRemove = ''
      this.isShowModal = false
    },

    async deleteRule (id) {
      this.hideModal()
      this.isRemoveButtonsDisabled = true
      const ruleToDelete = this.selectedRole.rules.find(item => item.id === id)
      const index = this.selectedRole.rules.indexOf(ruleToDelete)
      this.selectedRole.rules.splice(index, 1)
      try {
        await apiHelper.requests.updateRole(this.selectedRole)
        await this.getRoles()
        Bus.success('roles-and-rules-manager.remove-successfully')
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isRemoveButtonsDisabled = false
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
  font-size: 2.5rem;
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
