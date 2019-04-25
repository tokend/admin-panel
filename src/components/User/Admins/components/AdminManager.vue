<template>
  <div class="admin-manager">
    <div class="admin-manager__block app__block">
      <h2>
        {{ addNew ? 'Add new administrator' : 'Manage administrator' }}
      </h2>

      <form
        @submit.prevent="submit"
        id="admin-manager-form"
      >
        <div class="admin-manager__short-section">
          <div class="app__form-row">
            <input-field
              class="app__form-field"
              label="Account ID"
              v-model="form.accountId"
              :error-message="formErrors.accountId.message"
              :disabled="!addNew || isPending"
            />
          </div>

          <div class="app__form-row">
            <input-field
              class="app__form-field"
              label="Name"
              v-model="form.name"
              :disabled="isMaster || isPending"
            />
          </div>

          <div class="app__form-row">
            <input-field
              class="app__form-field"
              label="Identity"
              type="number"
              min="0"
              max="255"
              v-model="form.identity"
              :disabled="isMaster || isPending"
            />

            <input-field
              class="app__form-field"
              label="Weight"
              type="number"
              min="1"
              max="1000"
              v-model="form.weight"
              :disabled="isMaster || isPending"
            />
          </div>

          <div
            class="app__form-row"
            v-if="signerRoles.length"
          >
            <div class="app__form-field">
              <select-field
                class="app__form-field"
                label="Signer role"
                v-model="form.signerRoleId"
                :disabled="isMaster || isPending"
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
                      isMaster || isPending
                  }"
                >
                  {{ form.signerRoleId | deriveRoleDescription(signerRoles) }}
                </p>
              </template>
            </div>
          </div>
        </div>
      </form>

      <div class="admin-manager__form-actions app__form-actions">
        <button
          class="app__btn"
          form="admin-manager-form"
          :disabled="isPending"
        >
          {{ addNew ? 'Add' : 'Update' }}
        </button>

        <button
          class="app__btn-secondary app__btn-secondary--danger"
          :disabled="isPending"
          @click="deleteAdmin"
          v-if="!addNew"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import InputField from '@comcom/fields/InputField'
import SelectField from '@comcom/fields/SelectField'

import { confirmAction } from '@/js/modals/confirmation_message'
import { Sdk } from '@/sdk'
import { ApiCallerFactory } from '@/api-caller-factory'
import { ErrorHandler } from '@/utils/ErrorHandler'

const MASTER_ROLE_ID = 1

export default {
  name: 'admin-manager',

  components: {
    InputField,
    SelectField,
  },

  filters: {
    deriveRoleDescription (roleId, signerRoles = []) {
      return (signerRoles.find(item => +item.id === +roleId) || {}).description
    },
  },

  props: {
    id: { type: String, default: '' },
  },

  data () {
    return {
      form: {
        accountId: '',
        name: '',
        weight: '',
        identity: '',
        signerRoleId: '',
      },

      signer: {
        account: {},
        role: {},
      },

      signerRoles: [],

      formErrors: {
        accountId: { error: false, message: '' },
      },

      masterPubKey: Vue.params.MASTER_ACCOUNT,
      MASTER_ROLE_ID,
      isPending: false,
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
      const { data } = await ApiCallerFactory
        .createCallerInstance()
        .getWithSignature(`/v3/accounts/${this.masterPubKey}/signers`)
      return (data || []).find(item => item.id === accountId)
    },

    async initSignerRolesPicker () {
      const signerRoles = await ApiCallerFactory
        .createStubbornCallerInstance()
        .stubbornGet('/v3/signer_roles')
      this.signerRoles = signerRoles.data
        .filter(item => {
          return (item.details || {}).adminRole || +item.id === +MASTER_ROLE_ID
        })
        .map(item => {
          if (+item.id === +MASTER_ROLE_ID) {
            return {
              id: item.id,
              name: 'Master',
              description: 'The root admin of the system',
            }
          }

          return {
            id: item.id,
            name: (item.details || {}).name || `Unnamed (${item.id})`,
            description: (item.details || {}).description || '(No description)',
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
          ? 'Master'
          : signer.details.name,
      }

      this.$store.commit('CLOSE_LOADER')
    },

    async submit () {
      if (!this.validate()) return
      if (!await confirmAction()) return

      return this.addNew
        ? this.addAdmin()
        : this.updateAdmin()
    },

    async addAdmin () {
      await this.submitTx(Sdk.base.ManageSignerBuilder.createSigner)
    },

    async updateAdmin () {
      await this.submitTx(Sdk.base.ManageSignerBuilder.updateSigner)
    },

    async deleteAdmin () {
      const confirmationTxt = 'Are you sure you want to delete this admin?'
      if (await confirmAction({ title: confirmationTxt })) {
        await this.submitTx(Sdk.base.ManageSignerBuilder.deleteSigner)
      }
    },

    async submitTx (operationConstructor) {
      this.isPending = true
      this.$store.commit('OPEN_LOADER')

      try {
        const opts = this.buildManageSignerOperationOpts()
        const operation = operationConstructor(opts)
        await Sdk.horizon.transactions.submitOperations(operation)

        this.$store.dispatch('SET_INFO', 'Successfully submitted')
        this.$router.push({ name: 'admins' })
      } catch (error) {
        ErrorHandler.process(error)
      }

      this.isPending = false
      this.$store.commit('CLOSE_LOADER')
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

    validate () {
      let valid = true
      this.formErrors.accountId.message = ''

      if (!Sdk.base.Keypair.isValidPublicKey(this.form.accountId)) {
        this.formErrors.accountId.message = 'Enter a valid account address'
        valid = false
      }

      return valid
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
