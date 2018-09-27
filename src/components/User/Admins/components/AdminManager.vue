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

        <h3 class="admins-edit__rights-group-title">
          <span>Super administrator</span>
          <button type="button" @click="toggleSelection(TOGGLE_SELECTIONS_BY_TYPE.super)">Select group</button>
        </h3>
        <div class="admins-edit__rights-group">
          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="KYC super administrator"
            title="Сan make final review for requests that system cannot handle authomatically"
            :cb-value="SIGNER_TYPES.kycSuperAdmin"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Manage operation thresholds"
            title="Allowed to add/delete signers and trust"
            :cb-value="SIGNER_TYPES.accountManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.secondary" :disabled="isMaster || isPending" :required="false"
            label="View the list of users"
            title="Сan search for the user’s account through the users list"
            :cb-value="SIGNER_TYPES_SECONDARY.viewUserList"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.secondary" :disabled="isMaster || isPending" :required="false"
            label="View pending KYC requests"
            title="Сan view the pending KYC requests list"
            :cb-value="SIGNER_TYPES_SECONDARY.viewPendingKycRequests"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.secondary" :disabled="isMaster || isPending" :required="false"
            label="View history KYC requests"
            title="Сan view the history of KYC requests"
            :cb-value="SIGNER_TYPES_SECONDARY.viewHistoryKycRequests"
          />
        </div>

        <h3 class="admins-edit__rights-group-title">
          <span>KYC administrator</span>
          <button type="button" @click="toggleSelection(TOGGLE_SELECTIONS_BY_TYPE.kyc)">Select group</button>
        </h3>
        <div class="admins-edit__rights-group">
          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="KYC account manager"
            title="Can manage KYC of account"
            :cb-value="SIGNER_TYPES.kycAccManager"
          />
        </div>

        <h3 class="admins-edit__rights-group-title">
          <span>Issuance management</span>
          <button type="button" @click="toggleSelection(TOGGLE_SELECTIONS_BY_TYPE.issuance)">Select group</button>
        </h3>
        <div class="admins-edit__rights-group">
          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Issuance manager"
            title="Allowed to make issuance requests, review issuance, upload preissuance"
            :cb-value="SIGNER_TYPES.issuanceManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.secondary" :disabled="isMaster || isPending" :required="false"
            label="View issuance history"
            title="Сan view the issuance history"
            :cb-value="SIGNER_TYPES_SECONDARY.viewIssuanceHistory"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.secondary" :disabled="isMaster || isPending" :required="false"
            label="View the pending issuance requests"
            title="Сan view the pending issuance requests list"
            :cb-value="SIGNER_TYPES_SECONDARY.viewPendingIssuanceRequests"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Fulfill and reject the issuance requests"
            title="Allowed to review pre-issuance/issuance requests"
            :cb-value="SIGNER_TYPES.userIssuanceManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Withdraw manager"
            title="Allowed to review withdraw requests"
            :cb-value="SIGNER_TYPES.withdrawManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Super issuance manager"
            title="Super issuance manager"
            :cb-value="SIGNER_TYPES.superIssuanceManager"
          />
        </div>

        <h3 class="admins-edit__rights-group-title">
          <span>Security management</span>
          <button type="button" @click="toggleSelection(TOGGLE_SELECTIONS_BY_TYPE.security)">Select group</button>
        </h3>
        <div class="admins-edit__rights-group">
          <tick-field class="admins-edit__checkbox" v-model="signerTypes.secondary" :disabled="isMaster || isPending" :required="false"
            label="View the user's transaction history"
            title="View the user's transaction history"
            :cb-value="SIGNER_TYPES_SECONDARY.viewTransactionHistory"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Syndicate account manager"
            title="Allowed to manage syndicate account"
            :cb-value="SIGNER_TYPES.syndicateAccManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Exchange account manager"
            title="Allowed to manage exchange account"
            :cb-value="SIGNER_TYPES.exchangeAccManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Not verified account manager"
            title="Can manage not verified account and block/unblock general"
            :cb-value="SIGNER_TYPES.notVerifiedAccManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="General account manager"
            title="Allowed to create account, block/unblock, change limits for particular general account"
            :cb-value="SIGNER_TYPES.generalAccManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.secondary" :disabled="isMaster || isPending" :required="false"
            label="Search for the user's account"
            title="Search for the user's account"
            :cb-value="SIGNER_TYPES_SECONDARY.searchUserAccount"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="External system account id pool manager"
            title="External system account id pool manager"
            :cb-value="SIGNER_TYPES.externalSystemAccountIdPoolManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Key value manager"
            title="Can edit key-value set"
            :cb-value="SIGNER_TYPES.keyValueManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Events checker"
            title="Events checker"
            :cb-value="SIGNER_TYPES.eventsChecker"
          />
        </div>

        <h3 class="admins-edit__rights-group-title">
          <span>Operation management</span>
          <button type="button" @click="toggleSelection(TOGGLE_SELECTIONS_BY_TYPE.operationManager)">Select group</button>
        </h3>
        <div class="admins-edit__rights-group">
          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Direct debit operator"
            title="Direct debit operator"
            :cb-value="SIGNER_TYPES.directDebitOperator"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Invoice manager"
            title="Invoice manager"
            :cb-value="SIGNER_TYPES.invoiceManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Payment operator"
            title="Payment operator"
            :cb-value="SIGNER_TYPES.paymentOperator"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Send transactions"
            title="Allowed to send transactions"
            :cb-value="SIGNER_TYPES.txSender"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="AML alert manager"
            title="Allowed to manage AML alert"
            :cb-value="SIGNER_TYPES.amlAlertManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="AML alert reviewer"
            title="Allowed to review AML alert"
            :cb-value="SIGNER_TYPES.amlAlertReviewer"
          />
        </div>

        <h3 class="admins-edit__rights-group-title">
          <span>Balance management</span>
          <button type="button" @click="toggleSelection(TOGGLE_SELECTIONS_BY_TYPE.balanceManager)">Select group</button>
        </h3>
        <div class="admins-edit__rights-group">
          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Balance manager"
            title="Balance manager"
            :cb-value="SIGNER_TYPES.balanceManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Commission balance manager"
            title="Commission balance manager"
            :cb-value="SIGNER_TYPES.commissionBalanceManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Operational balance manager"
            title="Operational balance manager"
            :cb-value="SIGNER_TYPES.operationalBalanceManager"
          />
        </div>

        <h3 class="admins-edit__rights-group-title">
          <span>Fees management</span>
          <button type="button" @click="toggleSelection(TOGGLE_SELECTIONS_BY_TYPE.fees)">Select group</button>
        </h3>
        <div class="admins-edit__rights-group">
          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Fees manager"
            title="Allowed to manage fees"
            :cb-value="SIGNER_TYPES.feesManager"
          />
        </div>

        <h3 class="admins-edit__rights-group-title">
          <span>Limits management</span>
          <button type="button" @click="toggleSelection(TOGGLE_SELECTIONS_BY_TYPE.limits)">Select group</button>
        </h3>
        <div class="admins-edit__rights-group">
          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Limits manager"
            title="Allowed to change limits"
            :cb-value="SIGNER_TYPES.limitsManager"
          />
        </div>

        <h3 class="admins-edit__rights-group-title">
          <span>Trade administrator</span>
          <button type="button" @click="toggleSelection(TOGGLE_SELECTIONS_BY_TYPE.trade)">Select group</button>
        </h3>
        <div class="admins-edit__rights-group">
          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Asset manager"
            title="Allowed to create assets, asset pairs, update policies and set fees"
            :cb-value="SIGNER_TYPES.assetManager"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="Asset rate manager"
            title="Allowed to set physical asset price"
            :cb-value="SIGNER_TYPES.assetRateManager"
          />
        </div>

        <h3 class="admins-edit__rights-group-title">
          <span>Investment portolio administrator</span>
          <button type="button" @click="toggleSelection(TOGGLE_SELECTIONS_BY_TYPE.investment)">Select group</button>
        </h3>
        <div class="admins-edit__rights-group">
          <tick-field class="admins-edit__checkbox" v-model="signerTypes.secondary" :disabled="isMaster || isPending" :required="false"
            label="View crowdfunding campaign requests"
            title="Сan view the list of crowdfunding campaign requests"
            :cb-value="SIGNER_TYPES_SECONDARY.viewCrowdfundingCampaignRequests"
          />

          <tick-field class="admins-edit__checkbox" v-model="signerTypes.primary" :disabled="isMaster || isPending" :required="false"
            label="User asset manager"
                      title="Allowed to review sale, asset creation/update requests"
            :cb-value="SIGNER_TYPES.userAssetManager"
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
import difference from 'lodash/difference'
import accounts from '@/api/accounts'
import InputField from '@comcom/fields/InputField'
import TickField from '@comcom/fields/TickField'
import { SIGNER_TYPES, SIGNER_TYPES_SECONDARY } from '@/constants'

import { confirmAction } from '@/js/modals/confirmation_message'

const TOGGLE_SELECTIONS_BY_TYPE = {
  super: {
    primary: [SIGNER_TYPES.kycSuperAdmin, SIGNER_TYPES.accountManager],
    secondary: SIGNER_TYPES_SECONDARY.viewUserList +
               SIGNER_TYPES_SECONDARY.viewPendingKycRequests +
               SIGNER_TYPES_SECONDARY.viewHistoryKycRequests
  },
  kyc: {
    primary: [SIGNER_TYPES.kycAccManager]
  },
  issuance: {
    primary: [
      SIGNER_TYPES.issuanceManager,
      SIGNER_TYPES.userIssuanceManager,
      SIGNER_TYPES.withdrawManager,
      SIGNER_TYPES.superIssuanceManager
    ],
    secondary: SIGNER_TYPES_SECONDARY.viewIssuanceHistory +
               SIGNER_TYPES_SECONDARY.viewPendingIssuanceRequests
  },
  security: {
    primary: [
      SIGNER_TYPES.syndicateAccManager,
      SIGNER_TYPES.exchangeAccManager,
      SIGNER_TYPES.notVerifiedAccManager,
      SIGNER_TYPES.generalAccManager,
      SIGNER_TYPES.externalSystemAccountIdPoolManager,
      SIGNER_TYPES.keyValueManager,
      SIGNER_TYPES.eventsChecker
    ],
    secondary: SIGNER_TYPES_SECONDARY.viewTransactionHistory +
               SIGNER_TYPES_SECONDARY.searchUserAccount
  },
  operationManager: {
    primary: [
      SIGNER_TYPES.directDebitOperator,
      SIGNER_TYPES.invoiceManager,
      SIGNER_TYPES.paymentOperator,
      SIGNER_TYPES.txSender,
      SIGNER_TYPES.amlAlertManager,
      SIGNER_TYPES.amlAlertReviewer
    ]
  },
  balanceManager: {
    primary: [
      SIGNER_TYPES.balanceManager,
      SIGNER_TYPES.commissionBalanceManager,
      SIGNER_TYPES.operationalBalanceManager
    ]
  },
  fees: {
    primary: [SIGNER_TYPES.feesManager]
  },
  limits: {
    primary: [SIGNER_TYPES.limitsManager]
  },
  trade: {
    primary: [
      SIGNER_TYPES.assetManager,
      SIGNER_TYPES.assetRateManager
    ]
  },
  investment: {
    primary: [SIGNER_TYPES.userAssetManager],
    secondary: SIGNER_TYPES_SECONDARY.viewCrowdfundingCampaignRequests
  }
}

export default {
  name: 'manage-admin',

  components: {
    InputField,
    TickField
  },

  data () {
    return {
      SIGNER_TYPES,
      SIGNER_TYPES_SECONDARY,
      TOGGLE_SELECTIONS_BY_TYPE,

      params: {
        accountId: '',
        name: '',
        weight: '',
        signerIdentity: '',
        signerType: 0
      },

      signerTypes: {
        primary: [],
        secondary: 0
      },
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
      if (!this.validate()) return
      if (!await confirmAction()) return

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
            this.signerTypes.primary.push(item.value)
          })

          this.params.name = signer.signer_name.split(':')[0]
          this.signerTypes.secondary = Number(signer.signer_name.split(':')[1])
          if (!this.signerTypes.secondary) this.signerTypes.secondary = 0

          this.$store.commit('CLOSE_LOADER')
        }).catch((err) => {
          console.error(err)
          this.$store.commit('CLOSE_LOADER')
        })
    },

    async addAdmin () {
      this.params.signerType = 0
      this.signerTypes.primary.forEach(el => {
        this.params.signerType += Number(el)
      })

      const signerTypesSecondary = this.signerTypes.secondary

      this.params.name = `${this.params.name}:${signerTypesSecondary}`

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
      this.signerTypes.primary.forEach(el => {
        this.params.signerType += Number(el)
      })

      const signerTypesSecondary = this.signerTypes.secondary

      this.params.name = `${this.params.name}:${signerTypesSecondary}`

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

      if (this.signerTypes.primary.length === 0 && !this.isMaster) {
        this.$store.dispatch('SET_ERROR', this.formErrors.signerType.message)
        valid = false
      }

      if (this.signerTypes.primary.length === 0 && this.signerTypes.secondary === 0) {
        this.$store.dispatch('SET_ERROR', 'Select at least 1 policy')
        valid = false
      }

      return valid
    },
    toggleSelection (object) {
      const signerTypes = this.signerTypes.primary
      const differences = difference(object.primary, signerTypes)
      const hasDifference = differences.length
      const secondaryСoincidence = object.secondary ? object.secondary & this.signerTypes.secondary : 1

      if (hasDifference) {
        differences.forEach(el => this.signerTypes.primary.push(el))
      } else if (!hasDifference && secondaryСoincidence) {
        object.primary.forEach(el => {
          const index = signerTypes.indexOf(el)
          if (index > -1) this.signerTypes.primary.splice(index, 1)
        })
      }

      if (secondaryСoincidence !== object.secondary) {
        this.signerTypes.secondary = object.secondary | this.signerTypes.secondary
      } else if (secondaryСoincidence === object.secondary && !hasDifference) {
        this.signerTypes.secondary -= object.secondary
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.admins-edit__rights-group {
  display: flex;
  flex-wrap: wrap;

  & > div {
    width: 50%;
  }
}

.admins-edit__rights-group-title {
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    margin-right: 24px;
  }

  &:not(:first-child) {
    margin-top: 24px;
  }
}

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
