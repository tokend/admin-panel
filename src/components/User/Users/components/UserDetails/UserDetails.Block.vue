<template>
    <div>
      <div class="user-block__block-user" v-if="!account.isBlocked">
        <button class="app__btn app__btn--danger" :disabled="isPending" @click="showBlockModal">
          Block user
        </button>
      </div>
      <div class="user-block__unblock-user" v-else>
        <p class="user-block__blocked-msg danger">User blocked</p>
        <button class="app__btn" :disabled="isPending" @click="unblockUser">
          Unblock user
        </button>
      </div>

      <modal class="user-block__reject-modal"
             v-if="blockForm.isShown"
             @close-request="hideBlockModal()"
             max-width="40rem">

        <form class="user-block__block-form"
              id="user-block-form"
              @submit.prevent="hideBlockModal() || blockUser()">
          <h2 class="user-block__modal-title">Set block reasons</h2>
          <div class="user-block__checkboxes-section">
            <tick-field class="user-block__checkbox"
                        v-model="blockForm.blockReasons"
                        label="Suspicious behaviour"
                        :cb-value="BLOCK_REASONS.suspiciousBehavior"
            />
            <tick-field class="user-block__checkbox"
                        v-model="blockForm.blockReasons"
                        label="Too many KYC updates"
                        :cb-value="BLOCK_REASONS.tooManyKycUpdateRequest"
            />
          </div>
        </form>

        <div class="app__form-actions user-block__reject-form-actions">
          <button class="app__btn app__btn--danger" form="user-block-form">
            Block
          </button>
          <button class="app__btn-secondary" @click="hideBlockModal">
            Cancel
          </button>
        </div>
      </modal>


    </div>
</template>

<script>
  import { BLOCK_REASONS } from '@/constants'
  import TickField from '@comcom/fields/TickField'
  import Modal from '@comcom/modals/Modal'
  import api from '@/api'

  export default {
    props: ['user', 'account', 'updateRequestEvent'],
    components: { Modal, TickField },
    data () {
      return {
        blockForm: {
          blockReasons: [],
          isShown: false
        },
        isPending: false,
        BLOCK_REASONS
      }
    },
    methods: {
      showBlockModal () {
        this.blockForm.isShown = true
      },
      async blockUser () {
        await this.updateAccountState(
          true,
          this.blockForm.blockReasons.reduce((sum, reason) => sum + reason, 0)
        )
        this.$emit(this.updateRequestEvent)
        this.$store.dispatch('SET_INFO', 'User blocked')
      },
      async unblockUser () {
        await this.updateAccountState(false, this.account.blockReasonsI)
        this.$emit(this.updateRequestEvent)
        this.$store.dispatch('SET_INFO', 'User unblocked')
      },
      hideBlockModal () {
        this.blockForm.isShown = false
      },
      async updateAccountState (isBlock, blockReasons) {
        const account = this.account
        this.isPending = true
        try {
          await api.accounts.manageAccount({
            accountType: account.accountTypeI,
            account: account.accountId,
            blockReasons,
            isBlock
          })
        } catch (error) {
          console.error(error)
          error.showMessage()
        }
        this.isPending = false
      }
    }
  }
</script>

<style scoped>
  .user-block__checkboxes-section {
    margin-bottom: 4rem;
  }

  .user-block__checkbox {
    margin: 1rem;
  }
</style>
