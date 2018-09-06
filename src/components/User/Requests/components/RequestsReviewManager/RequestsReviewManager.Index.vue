<template>
  <div class="request-manager-details-tab" v-if="request">
    <button class="users-show__back-btn" @click="back">
      <span class="users-show__back-btn-inner">
        <mdi-chevron-left-icon/>
      </span>
      Back
    </button>
    <div class="requests-review-manager--container">
      <div class="request-rm-details-tab__row">
            <div class="request-rm-details-tab__row-item" >
              <label class="data-caption">Request details</label>
              <ul class="key-value-list">
                <li>
                  <span>Requestor</span>
                  <email-getter :address="request.requestor" is-titled />
                </li>
                <li>
                  <span>Request state</span>
                  <request-state-formatter :state="request.state" is-colored/>
                </li>
                <li>
                  <span>Requested at</span>
                  <date-formatter :date="request.record.created_at" format="DD MMM YYYY HH:mm:ss" />
                </li>
              </ul>

              <template v-if="request.rejectReason">
                <label class="data-caption danger">Reject reason</label>
                <p class="text">
                  {{request.rejectReason}}
                </p>
              </template>
            </div>

            <div class="request-rm-details-tab__row-item">


            </div>
          </div>
          <div class="request-rm-details-tab__row">
            <div class="request-rm-details-tab__row-item">
              <label class="data-caption">Request details</label>
              <ul class="key-value-list">
                <li>
                  <span>Name</span>
                  <span>
                    <template v-if="safeGet(request, 'operationDetails.details.name')">
                      {{request.operationDetails.details.name}}
                    </template>
                    <template v-else>
                      &mdash;
                    </template>
                  </span>
                </li>
                <li>
                  <span>Code</span>
                  <span>{{request.operationDetails.code}}</span>
                </li>
                <li>
                  <span>Initial preissued amount</span>
                  <asset-amount-formatter :amount="request.operationDetails.initial_preissued_amount" />
                </li>
                <li>
                  <span>Max issuance amount</span>
                  <asset-amount-formatter :amount="request.operationDetails.max_issuance_amount" />
                </li>
                <li>
                  <span>Preissuance signer</span>
                  <span>{{request.operationDetails.pre_issued_asset_signer}}</span>
                  <!-- <email-getter :address="request.operationDetails.pre_issued_asset_signer" is-titled /> -->
                </li>
                <li>
                  <span>Policies</span>
                  <asset-policies-formatter :policies="request.operationDetails.policies" />
                </li>
                <li>
                  <span>Terms</span>
                  <span>
                    <template v-if="safeGet(request, 'operationDetails.details.terms.key')">
                      <doc-link-getter :file-key="request.operationDetails.details.terms.key">Open file</doc-link-getter>
                    </template>

                    <template v-else>
                      (No document)
                    </template>
                  </span>
                </li>
              </ul>
            </div>

            <div class="request-rm-details-tab__row-item">
              <label class="data-caption">Token logo</label>
              <template v-if="safeGet(request, 'operationDetails.details.logo.key')">
                <img-getter class="request-rm-details-tab__token-logo"
                  :file-key="request.operationDetails.details.logo.key"
                  alt="Token logo"
                />
              </template>
              <template v-else>
                <p>(No logo yet)</p>
              </template>
            </div>
          </div>
          <div class="request-rm__actions app__form-actions">
            <button class="app__btn" @click="approve" :disabled="isSubmitting || request.state !== 'pending'">
              Approve
            </button>
            <button class="app__btn app__btn--danger" @click="showRejectForm" :disabled="isSubmitting || request.state !== 'pending'">
              Reject
            </button>
          </div>
    </div>
    <modal v-if="rejectForm.isShown" @close-request="hideRejectForm" max-width="40rem">
      <p class="text">Reject reason</p>

      <form class="request-rm__reject-form" id="request-reject-form"
        @submit.prevent="reject() & hideRejectForm()">
        <div class="app__form-row">
          <text-field v-model="rejectForm.reason" :label="null"/>
        </div>
      </form>

      <div class="request-rm__reject-form-actions app__form-actions">
        <button class="app__btn app__btn--danger" form="request-reject-form" :disabled="isSubmitting">
          Reject
        </button>
        <button class="app__btn-secondary" @click="hideRejectForm">
          Cancel
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
  import { EmailGetter, ImgGetter, DocLinkGetter } from '@comcom/getters'
  import {
    AssetAmountFormatter,
    DateFormatter,
    AssetPoliciesFormatter,
    RequestStateFormatter
  } from '@comcom/formatters'
  import { REQUEST_STATES } from '@/constants'

  import Modal from '@comcom/modals/Modal'
  import TextField from '@comcom/fields/TextField'
  import get from 'lodash/get'
  import api from '@/api'
  import 'mdi-vue/PencilIcon'
  import 'mdi-vue/ChevronLeftIcon'

  export default {
    props: ['id'],
    components: {
      ImgGetter,
      DocLinkGetter,
      EmailGetter,
      AssetAmountFormatter,
      DateFormatter,
      AssetPoliciesFormatter,
      RequestStateFormatter,
      TextField,
      Modal
    },
    data: _ => ({
      REQUEST_STATES,
      request: null,
      rejectForm: {
        reason: '',
        isShown: false
      },
      isSubmitting: false
    }),

    async created () {
      this.request = await api.requests.getTokenRequestById(this.id)
    },

    computed: {

    },

    methods: {
      safeGet: get,
      showRejectForm () {
        this.rejectForm.isShown = true
      },

      hideRejectForm () {
        this.rejectForm.isShown = false
      },

      back () {
        this.$router.push({ name: 'user.requests' })
      },

      async approve () {
        this.isSubmitting = true
        try {
          await api.requests.approve(this.request.record)
          this.$store.dispatch('SET_INFO', 'Token creation request approved.')
          this.$router.push({ name: 'user.requests' })
        } catch (error) {
          error.showMessage()
        }
        this.isSubmitting = false
      },

      async reject () {
        this.isSubmitting = true
        try {
          await api.requests.reject(
            {
              reason: this.rejectForm.reason
            },
            this.request.record
          )
          this.$store.dispatch('SET_INFO', 'Token creation request rejected successfully.')
          this.$router.push({ name: 'user.requests' })
        } catch (error) {
          error.showMessage()
        }
        this.isSubmitting = false
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../../../../assets/scss/colors";

  .request-rm-details-tab__row {
    display: flex;

    & + & {
      margin-top: 4rem;
    }
  }

  .request-rm-details-tab__row-item {
    flex: 1;

    & + & {
      margin-left: 4rem;
    }
  }

  .request-rm-details-tab__token-logo,
  .request-rm-details-tab__request-logo {
    margin-top: 0.5rem;
  }

  .request-rm-details-tab__token-logo {
    max-width: 16rem;
    max-height: 16rem;
  }

  .request-rm-details-tab__request-logo {
    max-width: 100%;
    max-height: 25rem;
  }

  .request-rm__actions.app__form-actions {
    margin-top: 4rem;
    max-width: 30rem;
  }

  .request-rm__reject-form {
    margin-bottom: 2rem;
  }

  .requests-review-manager--container {
    background-color: #fff;
    border-radius: 0.3rem;
    box-shadow: 0.7px 0.7px 5.6px 0.4px rgba(170, 170, 170, 0.72);
    padding: 2rem 2.5rem 2.5rem;
  }

  .users-show__back-btn {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.users-show__back-btn-inner {
  $dimension: 3.5rem;

  background: $color-content-bg;
  border-radius: 50%;
  box-shadow: 0 1px 5.6px 0.4px rgba(170, 170, 170, 0.72);
  height: $dimension;
  margin-right: 10px;
  position: relative;
  transition: .2s;
  width: $dimension;

  &:hover {
    box-shadow: 0 2px 6.6px 0.6px rgba(170, 170, 170, 0.72);
  }

  svg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
