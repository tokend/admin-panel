<template>
  <div class="admin-manager">
    <div class="admin-manager__block app__block">
      <h2 v-if="addNew">
        {{ "admin-manager.add-new-admin" | globalize }}
      </h2>

      <h2 v-else>
        {{ "admin-manager.manage-admin" | globalize }}
      </h2>

      <form
        @submit.prevent="isFormValid() && showConfirmation()"
        id="admin-manager-form"
        novalidate
      >
        <div class="admin-manager__short-section">
          <div class="app__form-row">
            <input-field
              class="app__form-field"
              :label="'admin-manager.lbl-account-id' | globalize"
              v-model="form.accountId"
              :disabled="!addNew || formMixin.isDisabled"
              @blur="touchField('form.accountId')"
              :error-message="getFieldErrorMessage('form.accountId')"
            />
          </div>

          <div class="app__form-row">
            <input-field
              class="app__form-field"
              :label="'admin-manager.lbl-name' | globalize"
              v-model="form.name"
              :disabled="isMaster || formMixin.isDisabled"
              @blur="touchField('form.name')"
              :error-message="getFieldErrorMessage('form.name')"
            />
          </div>

          <div class="app__form-row">
            <input-field
              class="app__form-field"
              :label="'admin-manager.lbl-identity' | globalize"
              type="number"
              min="0"
              max="255"
              v-model="form.identity"
              :disabled="isMaster || formMixin.isDisabled"
              @blur="touchField('form.identity')"
              :error-message="getFieldErrorMessage(
                'form.identity',
                { minValue: 0, maxValue: 255 }
              )"
            />

            <input-field
              class="app__form-field"
              :label="'admin-manager.lbl-weight' | globalize"
              type="number"
              min="1"
              max="1000"
              v-model="form.weight"
              :disabled="isMaster || formMixin.isDisabled"
              @blur="touchField('form.weight')"
              :error-message="getFieldErrorMessage(
                'form.weight',
                { minValue: 1, maxValue: 1000 }
              )"
            />
          </div>

          <div
            class="app__form-row"
            v-if="signerRoles.length"
          >
            <div class="app__form-field">
              <select-field
                class="app__form-field"
                :label="'admin-manager.lbl-signer-role' | globalize"
                v-model="form.signerRoleId"
                :disabled="isMaster || formMixin.isDisabled"
                @blur="touchField('form.signerRoleId')"
                :error-message="getFieldErrorMessage('form.signerRoleId')"
              >
                <option
                  v-for="item in signerRoles"
                  :key="`admin-manager-role-${item.id}`"
                  :value="item.id"
                  :disabled="+item.id === +MASTER_ROLE_ID"
                >
                  {{ item.name }}
                </option>
              </select-field>

              <template v-if="form.signerRoleId">
                <p
                  class="admin-manager__role-description"
                  :class="{
                    'admin-manager__role-description--grayscale':
                      isMaster || formMixin.isDisabled
                  }"
                >
                  {{ form.signerRoleId | deriveRoleDescription(signerRoles) }}
                </p>
              </template>
            </div>
          </div>
        </div>

        <div class="admin-manager__form-actions app__form-actions">
          <form-confirmation
            v-if="formMixin.isConfirmationShown"
            :is-pending="isFormSubmitting"
            @ok="submit"
            @cancel="hideConfirmation"
          />

          <template v-else>
            <button
              v-if="addNew"
              class="app__btn"
              @click="isDeleteMode = false"
              :disabled="isMaster || formMixin.isDisabled"
            >
              {{ "admin-manager.btn-add" | globalize }}
            </button>

            <button
              v-else
              class="app__btn"
              @click="isDeleteMode = false"
              :disabled="isMaster || formMixin.isDisabled"
            >
              {{ "admin-manager.btn-upd" | globalize }}
            </button>

            <button
              v-if="!addNew"
              class="app__btn-secondary app__btn-secondary--danger"
              :disabled="isMaster || formMixin.isDisabled"
              @click="isDeleteMode = true"
            >
              {{ "admin-manager.btn-delete" | globalize }}
            </button>
          </template>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

import FormMixin from '@/mixins/form.mixin'
import { required, minValue, maxValue, accountId } from '@/validators'

import { confirmAction } from '@/js/modals/confirmation_message'

import { base } from '@tokend/js-sdk'
import { api, loadingDataViaLoop } from '@/api'

import { Bus } from '@/utils/bus'
import { ErrorHandler } from '@/utils/ErrorHandler'

import { globalize } from '@/components/App/filters/filters'

const MASTER_ROLE_ID = 1

export default {
  name: 'admin-manager',

  filters: {
    deriveRoleDescription (roleId, signerRoles = []) {
      return (signerRoles.find(item => +item.id === +roleId) || {}).description
    },
  },

  mixins: [FormMixin],

  props: {
    id: { type: String, default: '' },
  },

  data () {
    return {
      form: {
        accountId: '',
        name: '',
        identity: '',
        weight: '',
        signerRoleId: '',
      },

      signer: {
        account: {},
        role: {},
      },

      signerRoles: [],

      isDeleteMode: false,
      isFormSubmitting: false,

      masterPubKey: Vue.params.MASTER_ACCOUNT,
      MASTER_ROLE_ID,
    }
  },

  validations () {
    return {
      form: {
        accountId: { required, accountId },
        name: { required },
        identity: {
          required,
          minValue: minValue(0),
          maxValue: maxValue(255),
        },
        weight: {
          required,
          minValue: minValue(1),
          maxValue: maxValue(1000),
        },
        signerRoleId: { required },
      },
    }
  },

  computed: {
    addNew () {
      return !this.id
    },

    isMaster () {
      return this.signer.id === this.masterPubKey
    },
  },

  async created () {
    try {
      await this.initSignerRolesPicker()
      if (!this.addNew) {
        await this.loadSigner()
      }
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }
  },

  methods: {
    async getSignerByAccountId (accountId) {
      const endpoint = `/v3/accounts/${this.masterPubKey}/signers`
      const { data } = await api.getWithSignature(endpoint)
      return (data || []).find(item => item.id === accountId)
    },

    async initSignerRolesPicker () {
      let response = await api.getWithSignature('/v3/signer_roles')
      let signerRoles = await loadingDataViaLoop(response)
      this.signerRoles = signerRoles
        .filter(item => {
          return (item.details || {}).adminRole || +item.id === +MASTER_ROLE_ID
        })
        .map(item => {
          if (+item.id === +MASTER_ROLE_ID) {
            return {
              id: item.id,
              name: globalize('admin-manager.master'),
              description: globalize('admin-manager.root-admin-system'),
            }
          }

          return {
            id: item.id,
            name: (item.details || {}).name ||
            globalize('admin-manager.unnamed')`(${item.id})`,
            description: (item.details || {}).description ||
            globalize('admin-manager.no-description'),
          }
        })

      this.form.signerRoleId = this.form.signerRoleId ||
        this.signerRoles.find(item => item.name !== 'Master').id
    },

    async loadSigner () {
      this.$store.commit('OPEN_LOADER')

      const signer = await this.getSignerByAccountId(this.id)
      this.signer = signer
      this.form = {
        accountId: signer.id,
        weight: signer.weight,
        identity: signer.identity,
        signerRoleId: String(signer.role.id),
        name: signer.id === this.masterPubKey
          ? globalize('admin-manager.master')
          : signer.details.name,
      }

      this.$store.commit('CLOSE_LOADER')
    },

    async submit () {
      this.isFormSubmitting = true

      let action
      if (this.isDeleteMode) {
        action = this.deleteAdmin
      } else {
        action = this.addNew ? this.addAdmin : this.updateAdmin
      }

      try {
        await action()
        Bus.success('admin-manager.successfully-submitted')
        this.$router.push({ name: 'admins' })
      } catch (error) {
        ErrorHandler.process(error)
      }

      this.isFormSubmitting = false
      this.hideConfirmation()
    },

    async addAdmin () {
      await this.submitTx(base.ManageSignerBuilder.createSigner)
    },

    async updateAdmin () {
      await this.submitTx(base.ManageSignerBuilder.updateSigner)
    },

    async deleteAdmin () {
      const confirmationTxt = globalize('admin-manager.confirmation-delete-admin')
      if (await confirmAction({ title: confirmationTxt })) {
        await this.submitTx(base.ManageSignerBuilder.deleteSigner)
      }
    },

    async submitTx (operationConstructor) {
      const opts = this.buildManageSignerOperationOpts()
      const operation = operationConstructor(opts)
      await api.postOperations(operation)
    },

    buildManageSignerOperationOpts () {
      return {
        publicKey: this.form.accountId,
        roleID: String(this.form.signerRoleId || this.signer.role.id),
        weight: this.form.weight,
        identity: this.form.identity,
        details: { name: this.form.name },
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors";

.admin-manager__block.app__block {
  max-width: 64rem;
}

.admin-manager__form-actions.app__form-actions {
  margin-top: 4rem;

  & > .app__btn,
  & > .app__btn-secondary {
    max-width: 15rem;
  }
}

.admin-manager__role-description {
  margin-top: 0.8rem;
  color: rgba($color-text, 0.8);
  font-weight: bold;
  font-size: 1.4rem;

  &--grayscale {
    filter: grayscale(100%) opacity(0.75);
  }
}
</style>
