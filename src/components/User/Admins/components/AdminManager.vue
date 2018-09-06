<template>
  <div class="admins-edit">
    <div class="admins-edit__block app__block">
      <h2>{{addNew ? 'Add new administrator' :  'Manage administrator'}}</h2>

      <form @submit.prevent="submit" id="admins-edit-form">
        <div class="admins-edit__short-section">
          <div class="app__form-row">
            <input-field class="app__form-field"
              label="Account ID"
              v-model="params.accountId"
              :error-message="formErrors.accountId.message"
              :disabled="(isMaster && !this.addNew) || isPending"
            />
          </div>

          <div class="app__form-row">
            <input-field class="app__form-field"
              label="Name"
              v-model="params.name"
              :error-message="formErrors.name.message"
              :disabled="isMaster || isPending"
            />
          </div>

          <div class="app__form-row">
            <input-field class="app__form-field"
              label="Identity"
              type="number" min="0" max="255"
              v-model="params.signerIdentity"
              :disabled="isMaster || isPending"
            />

            <input-field class="app__form-field"
              label="Weight"
              type="number" min="1" max="255"
              v-model="params.weight"
              :disabled="isPending"
            />
          </div>
        </div>

        <h2 class="admins-edit__sub-heading">Rights</h2>
        <div class="admins-edit__checkboxes-section">
          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Reader"
            title="Can only read data from API and Horizon"
            :cb-value="SIGNER_TYPES.reader"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Not verified account manager"
            title="Can manage not verified account and block/unblock general"
            :cb-value="SIGNER_TYPES.notVerifiedAccManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="General account manager"
            title="Allowed to create account, block/unblock, change limits for particular general account"
            :cb-value="SIGNER_TYPES.generalAccManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Direct debit operator"
            title="Allowed to perform direct debit operation"
            :cb-value="SIGNER_TYPES.directDebitOperator"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Asset manager"
            title="Allowed to create assets, asset pairs, update policies and set fees"
            :cb-value="SIGNER_TYPES.assetManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Asset rate manager"
            title="Allowed to set physical asset price"
            :cb-value="SIGNER_TYPES.assetRateManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Balance manager"
            title="Allowed to create balances, spend assets from balances"
            :cb-value="SIGNER_TYPES.balanceManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Issuance manager"
            title="Allowed to make issuance requests, review issuance, upload preissuance"
            :cb-value="SIGNER_TYPES.issuanceManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Invoice manager"
            title="Allowed to create payment requests to other accounts"
            :cb-value="SIGNER_TYPES.invoiceManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Payment operator"
            title="Allowed to review payment requests"
            :cb-value="SIGNER_TYPES.paymentOperator"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Limits manager"
            title="Allowed to change limits"
            :cb-value="SIGNER_TYPES.limitsManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Account manager"
            title="Allowed to add/delete signers and trust"
            :cb-value="SIGNER_TYPES.accountManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Commission balance manager"
            title="Allowed to spend from commission balances"
            :cb-value="SIGNER_TYPES.commissionBalanceManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Operational balance manager"
            title="Allowed to spend from operational balances"
            :cb-value="SIGNER_TYPES.operationalBalanceManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Events checker"
            title="Allowed to check and trigger events"
            :cb-value="SIGNER_TYPES.eventsChecker"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Exchange account manager"
            title="Allowed to manage exchange account"
            :cb-value="SIGNER_TYPES.exchangeAccManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Corporate account manager"
            title="Allowed to manage corporate account"
            :cb-value="SIGNER_TYPES.syndicateAccManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="User asset manager"
                      title="Allowed to review sale, asset creation/update requests"
            :cb-value="SIGNER_TYPES.userAssetManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="User issuance manager"
            title="Allowed to review pre-issuance/issuance requests"
            :cb-value="SIGNER_TYPES.userIssuanceManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Withdraw manager"
            title="Allowed to review withdraw requests"
            :cb-value="SIGNER_TYPES.withdrawManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Fees manager"
            title="Allowed to manage fees"
            :cb-value="SIGNER_TYPES.feesManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="Transaction sender"
            title="Сan send transactions"
            :cb-value="SIGNER_TYPES.txSender"
          />





          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="AML alert manager"
            title="Can manage AML alert requests"
            :cb-value="SIGNER_TYPES.amlAlertManager"
          />


          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="AML alert reviewer"
            title="Can review aml alert requests"
            :cb-value="SIGNER_TYPES.amlAlertReviewer"
          />


          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="KYC account manager"
            title="Can manage KYC"
            :cb-value="SIGNER_TYPES.kycAccManager"
          />


          <tick-field class="admins-edit__checkbox" v-model="signerTypes" :disabled="isMaster || isPending" :required="false"
            label="KYC super administrator"
            title="Сan make final review for requests that system cannot handle authomatically"
            :cb-value="SIGNER_TYPES.kycSuperAdmin"
          />


        </div>
      </form>

      <!-- Buttons Row -->
      <div class="admins-edit__form-actions app__form-actions">
          <button class="app__btn"
            form="admins-edit-form"
            :disabled="buttonDisabled">
            {{addNew ? 'Add' : 'Update'}}
          </button>

          <button class="app__btn-secondary app__btn-secondary--danger"
            :disabled="buttonDisabled"
            @click="deleteAdmin"
            v-if="!addNew">
            Delete
          </button>
      </div>
      <!--/ Buttons Row -->
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Keypair } from 'tokend-js-sdk'
import accounts from '@/api/accounts'
import InputField from '@comcom/fields/InputField'
import TickField from '@comcom/fields/TickField'
import { SIGNER_TYPES } from '@/constants'

import { confirmAction } from '../../../../js/modals/confirmation_message'

export default {
  name: 'manage-admin',

  components: {
    InputField,
    TickField
  },

  data () {
    return {
      SIGNER_TYPES,

      params: {
        accountId: '',
        name: '',
        weight: '',
        signerIdentity: '',
        signerType: 0
      },

      signerTypes: [],
      testArr: [],

      test: 5,

      formErrors: {
        accountId: { error: false, message: '' },
        name: { error: false, message: '' },
        signerIdentity: { error: false, message: '' },
        signerType: { error: false, message: '' },
        weight: { error: false, message: '' }
      },

      masterPubKey: Vue.params.MASTER_ACCOUNT,
      isPending: false
    }
  },

  props: ['id'],

  computed: {
    addNew () {
      return this.id === undefined
    },

    buttonDisabled () {
      return this.$store.getters.showLoader
    },

    isMaster () {
      return this.params.accountId === this.masterPubKey
    }
  },

  created () {
    if (this.addNew || this.id === 'add') {
      return
    }
    this.loadSigner()
  },

  methods: {
    async submit () {
      if (!await confirmAction()) return
      if (!this.validate()) return

      return this.addNew
        ? this.addAdmin()
        : this.updateAdmin()
    },

    loadSigner () {
      this.$store.commit('OPEN_LOADER')

      return accounts.getSignerById(this.id)
        .then(({ signer }) => {
          this.params = {
            accountId: signer.public_key,
            weight: signer.weight,
            signerIdentity: signer.signer_identity,
            signerType: signer.signer_type_i,
            name: signer.public_key === this.masterPubKey ? 'Master' : signer.signer_name
          }

          signer.signer_types.forEach((item) => {
            this.signerTypes.push(item.value)
          })

          this.$store.commit('CLOSE_LOADER')
        }).catch((err) => {
          console.error(err)
          this.$store.commit('CLOSE_LOADER')
        })
    },

    async addAdmin () {
      this.params.signerType = 0
      this.signerTypes.forEach(el => {
        this.params.signerType += Number(el)
      })

      const request = this.params.accountId === this.masterPubKey ? accounts.manageMaster(this.params.weight) : accounts.manageSigner(this.params)

      this.$store.commit('OPEN_LOADER')
      this.isPending = true
      try {
        await request
        this.$store.commit('CLOSE_LOADER')
        this.$store.dispatch('SET_INFO', 'Pending transaction for create administrator submitted')
        this.$router.push({ name: 'admins' })
      } catch (error) {
        console.error(error)
        this.$store.commit('CLOSE_LOADER')
        error.showMessage()
      }
      this.isPending = false
    },

    async deleteAdmin () {
      if (!await confirmAction({ title: 'Are you sure you want to delete this admin?' })) return
      const data = {
        accountId: this.id,
        weight: 0,
        signerIdentity: 0,
        signerType: 0
      }

      // for master account we can change only weight
      const request = this.isMaster ? accounts.manageMaster(0) : accounts.manageSigner(data)

      this.isPending = true
      this.$store.commit('OPEN_LOADER')
      try {
        await request
        this.$store.dispatch('SET_INFO', 'Pending transaction for delete administrator submitted')
        this.$store.commit('CLOSE_LOADER')
        this.$router.push({ name: 'admins' })
      } catch (error) {
        console.error(error)
        error.showMessage()
        this.$store.commit('CLOSE_LOADER')
      }
      this.isPending = false
    },

    async updateAdmin () {
      this.params.signerType = 0
      this.signerTypes.forEach(el => {
        this.params.signerType += Number(el)
      })

      // for master account we can change only weight
      const request = this.isMaster ? accounts.manageMaster(this.params.weight) : accounts.manageSigner(this.params)

      this.$store.commit('OPEN_LOADER')
      this.isPending = true
      try {
        await request
        this.$store.commit('CLOSE_LOADER')
        this.$store.dispatch('SET_INFO', 'Pending transaction for update administrator submitted')
        this.$router.push({ name: 'admins' })
      } catch (error) {
        console.error(error)
        error.showMessage()
        this.$store.commit('CLOSE_LOADER')
      }
      this.isPending = false
    },

    validate () {
      let valid = true
      this.formErrors.accountId.message = ''
      this.formErrors.weight.message = ''

      if (!Keypair.isValidPublicKey(this.params.accountId)) {
        this.formErrors.accountId.message = 'Enter a valid account address'
        valid = false
      }

      if (this.signerTypes.length === 0 && !this.isMaster) {
        this.$store.dispatch('SET_ERROR', this.formErrors.signerType.message)
        valid = false
      }

      return valid
    }
  }
}
</script>

<style lang="scss" scoped>
.admins-edit__block.app__block {
  max-width: 64rem;
}

.admins-edit__short-section {
  max-width: 40rem;
}

.admins-edit__form-actions.app__form-actions {
  margin-top: 4rem;

  & > .app__btn,
  & > .app__btn-secondary {
    max-width: 15rem;
  }
}

h2.admins-edit__sub-heading {
  margin-top: 4rem;
  margin-bottom: 2rem;
}

.admins-edit__checkboxes-section {
  max-width: 80rem;
  display: flex;
  flex-wrap: wrap;
  margin: -0.5rem;
}

.admins-edit__checkbox {
  flex: calc(49.999999% - 1rem);
  margin: 0.5rem;
}
</style>
