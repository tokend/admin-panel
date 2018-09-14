<template>
  <div class="token-requests-show app__block">
    <div class="token-requests-show" v-if="tokenRequest.id && !isRejecting">
      <h2>
        <template v-if="tokenRequest.type === 'asset_create'">
          Token creation request
        </template>

        <template v-else-if="tokenRequest.type === 'asset_update'">
          Token update request
        </template>

        <template v-else>
          Token request
        </template>
      </h2>
      <div class="token-requests-show__row">
        <span class="token-requests-show__key">
          Token logo
        </span>
        <template v-if="safeGet(tokenRequest, 'operationDetails.details.logo.key')">
          <img-getter class="token-requests-show__token-logo"
            :file-key="tokenRequest.operationDetails.details.logo.key"
            alt="Token logo"
          />
        </template>
      </div>
      <div class="token-requests-show__row">
        <span class="token-requests-show__key">
          Token name
        </span>
        <span class="token-requests-show__value" :title="tokenRequest.operationDetails.details.name">
          {{ tokenRequest.operationDetails.details.name || '—' }}
        </span>
      </div>

      <div class="token-requests-show__row">
        <span class="token-requests-show__key">
          Token code
        </span>
        <span class="token-requests-show__value">
          {{ tokenRequest.code || '—' }}
        </span>
      </div>

      <div class="token-requests-show__row">
        <span class="token-requests-show__key">
          External resource link
        </span>
        <span class="token-requests-show__value">
          {{ tokenRequest.externalLink || '—' }}
        </span>
      </div>

      <div class="token-requests-show__row" v-if="tokenRequest.type !== 'asset_update'">
        <span class="token-requests-show__key">
          Max issuance amount
        </span>
        <span class="token-requests-show__value">
          {{ tokenRequest.maxAmount ? localizeAmount(tokenRequest.maxAmount) : '—' }}
        </span>
      </div>

      <div class="token-requests-show__row">
        <span class="token-requests-show__key">
          Preissuance signer
        </span>
        <email-getter v-if="tokenRequest.signer"
                      class="token-requests-show__value"
                      :address="tokenRequest.signer" is-titled />
        <span v-else
              class="token-requests-show__value"
              :title="tokenRequest.signer">
          —
        </span>
      </div>

      <template v-if="tokenRequest.policies">
        <div class="token-requests-show__row token-requests-show__row--policy">
          <span class="token-requests-show__key">
            Policies
          </span>
          <div class="token-requests-show__policies-wrapper">
          <template v-for="policy in tokenRequest.operationDetails.policies">
            <span :key='policy.value'
                  class="token-requests-show__key token-requests-show__key--informative">
            {{ ASSET_POLICIES_VERBOSE[policy.value] }}
            </span>
          </template>
          </div>
        </div>
      </template>

      <template v-if="tokenRequest.state !== 'pending'">
        <div class="token-requests-show__row">
          <span class="token-requests-show__key">
            State
          </span>

          <span class="token-requests-show__value">
            {{verbozify(tokenRequest.state)}}
          </span>
        </div>
      </template>

      <template v-if="tokenRequest.state === 'rejected'">
        <div class="token-requests-show__reject-reason-wrp">
          <text-field label="Reject reason"
            :value="tokenRequest.rejectReason"
            :readonly="true"
          />
        </div>
      </template>

      <div class="token-requests-show__buttons" v-if="tokenRequest.state === 'pending'">
        <button class="app__btn"
          :disabled="isPending"
          @click="fulfill">
          Fulfill
        </button>

        <button class="app__btn-secondary"
          :disabled="isPending"
          @click="cancel"
          v-if="false && isCancellable">
          Cancel
        </button>

        <button class="app__btn-secondary"
          :disabled="isPending"
          @click="isRejecting = true"
          v-else>
          Reject
        </button>
      </div>
    </div>

    <token-request-reject-form @close="isRejecting = false"
      :assetRequest="tokenRequest"
      v-else
    />
  </div>
</template>

<script>
import Vue from 'vue'
import { ASSET_POLICIES_VERBOSE } from '@/constants'
import { confirmAction } from '../../../../js/modals/confirmation_message'
import TokenRequestRejectForm from './components/TokenRequestRejectForm'
import localize from '@/utils/localize'
import TextField from '@comcom/fields/TextField'
import { ImgGetter, EmailGetter } from '@comcom/getters'
import { verbozify } from '@/utils/verbozify'
import get from 'lodash/get'
// TODO: extract to TokenRequestForm

export default {
  components: {
    TokenRequestRejectForm,
    TextField,
    ImgGetter,
    EmailGetter
  },

  props: ['id'],

  data () {
    return {
      tokenRequest: {},
      isRejecting: false,
      isPending: false,
      ASSET_POLICIES_VERBOSE
    }
  },

  async created () {
    const requestId = this.id
    this.tokenRequest = await this.getRequest(requestId)
  },

  computed: {
    isCancellable () {
      const isPending =
        this.tokenRequest.state === 'pending'
      const isCancellableRequestor =
        this.tokenRequest.requestor === this.$store.getters.masterId
      return isPending && isCancellableRequestor
    }
  },

  methods: {
    verbozify,
    safeGet: get,
    getRequest (id) {
      return Vue.api.requests.getTokenRequestById(id)
    },

    async fulfill () {
      this.isPending = true
      if (await confirmAction()) {
        try {
          await this.tokenRequest.fulfill()
          this.$store.dispatch('SET_INFO', 'Token successfully created')
          this.$router.push({ name: 'tokens' })
        } catch (err) {
          this.$store.dispatch('SET_ERROR', 'Failed to fulfill request')
        }
      }
      this.isPending = false
    },
    async cancel () {
      this.isPending = true
      if (await confirmAction()) {
        try {
          await this.tokenRequest.cancel()
          this.$store.dispatch('SET_INFO', 'Request cancelled')
          this.$router.push({ name: 'tokens' })
        } catch (error) {
          console.error(error)
          this.$store.dispatch('SET_ERROR', 'Failed to cancel request')
        }
      }
      this.isPending = false
    },

    localizeAmount: localize
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors";

.token-requests-show {
  max-width: 64rem;
}

.token-requests-show__row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.token-requests-show__key {
  &--informative {
    color: $color-info;

    &:before {
      content: "\2713";
    }
  }
}

.token-requests-show__value {
  max-width: 24rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.token-requests-show__buttons {
  display: flex;
  margin-top: 4.5rem;

  & > button {
    flex: 0.33;
  }

  button:first-child {
    margin-right: 1rem;
  }
}

.token-requests-show__reject-reason-wrp {
  margin-top: 2rem;
}

.token-requests-show__token-logo {
  max-width: 16rem;
  max-height: 16rem;
}

.token-requests-show__policies-wrapper {
  display: flex;
  flex-direction: column;
}
</style>
