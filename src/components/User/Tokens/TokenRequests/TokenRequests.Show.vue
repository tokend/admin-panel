<template>
  <div class="token-requests-show app__block">
    <template v-if="isInitializing">
      <p class="text">
        Loading...
      </p>
    </template>

    <template v-else-if="isInitFailed">
      <p class="text danger">
        An error occurred. Please try again later
      </p>
    </template>

    <div
      class="token-requests-show"
      v-else-if="tokenRequest.id && !isRejecting"
    >
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
          <img-getter
            class="token-requests-show__token-logo"
            :file-key="tokenRequest.operationDetails.details.logo.key"
            alt="Token logo"
          />
        </template>
      </div>
      <div class="token-requests-show__row">
        <span class="token-requests-show__key">
          Token name
        </span>
        <span
          class="token-requests-show__value"
          :title="tokenRequest.operationDetails.details.name"
        >
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

      <div
        class="token-requests-show__row"
        v-if="tokenRequest.type !== 'asset_update'"
      >
        <span class="token-requests-show__key">
          Max issuance amount
        </span>
        <span class="token-requests-show__value">
          {{ tokenRequest.maxAmount ? localizeAmount(tokenRequest.maxAmount) : '—' }}
        </span>
      </div>

      <div
        class="token-requests-show__row"
        v-if="tokenRequest.type !== 'asset_update'"
      >
        <span class="token-requests-show__key">
          Issued amount
        </span>
        <span class="token-requests-show__value">
          {{ tokenRequest.issuedAmount }}
        </span>
      </div>

      <div class="token-requests-show__row">
        <span class="token-requests-show__key">
          Preissuance signer
        </span>
        <email-getter
          v-if="tokenRequest.signer"
          class="token-requests-show__value"
          :account-id="tokenRequest.signer"
          is-titled
        />
        <span
          v-else
          class="token-requests-show__value"
          :title="tokenRequest.signer"
        >
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
              <span
                :key='policy.value'
                class="token-requests-show__key token-requests-show__key--informative"
              >
                {{ ASSET_POLICIES_VERBOSE[policy.value] }}
              </span>
            </template>
          </div>
        </div>
      </template>

      <div class="token-requests-show__row">
        <span class="token-requests-show__key">
          Creation date
        </span>
        <date-formatter
          :date="tokenRequest.creationDate"
          format="DD MMM YYYY HH:mm:ss"
          class="token-requests-show__value"
        />
      </div>

      <div class="token-requests-show__row">
        <span class="token-requests-show__key">
          Update date
        </span>
        <date-formatter
          :date="tokenRequest.updateDate"
          format="DD MMM YYYY HH:mm:ss"
          class="token-requests-show__value"
        />
      </div>

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
          <text-field
            label="Reject reason"
            :value="tokenRequest.rejectReason"
            :readonly="true"
          />
        </div>
      </template>

      <div
        class="token-requests-show__buttons"
        v-if="tokenRequest.state === 'pending'"
      >
        <button
          class="app__btn"
          :disabled="isPending"
          @click="fulfill"
        >
          Fulfill
        </button>

        <button
          class="app__btn-secondary"
          :disabled="isPending"
          @click="isRejecting = true"
        >
          Reject
        </button>
      </div>
    </div>

    <token-request-reject-form
      @close="isRejecting = false"
      :assetRequest="tokenRequest"
      v-else-if="isRejecting"
    />
  </div>
</template>

<script>
import { Sdk } from '@/sdk'
import { ASSET_POLICIES_VERBOSE } from '@/constants'
import { confirmAction } from '../../../../js/modals/confirmation_message'
import TokenRequestRejectForm from './components/TokenRequestRejectForm'
import localize from '@/utils/localize'
import TextField from '@comcom/fields/TextField'
import { ImgGetter, EmailGetter } from '@comcom/getters'
import { DateFormatter } from '@comcom/formatters'
import { verbozify } from '@/utils/verbozify'
import { TokenRequest } from '@/api/responseHandlers/requests/TokenRequest'
import get from 'lodash/get'
import { ErrorHandler } from '@/utils/ErrorHandler'
// TODO: extract to TokenRequestForm

export default {
  components: {
    TokenRequestRejectForm,
    TextField,
    ImgGetter,
    EmailGetter,
    DateFormatter
  },

  props: ['id'],

  data () {
    return {
      tokenRequest: {},
      isRejecting: false,
      isPending: false,
      isInitializing: false,
      isInitFailed: false,
      ASSET_POLICIES_VERBOSE
    }
  },

  async created () {
    this.isInitializing = true

    try {
      const response = await Sdk.horizon.request.get(this.id)
      this.tokenRequest = new TokenRequest(response.data)
    } catch (error) {
      ErrorHandler.process(error)
      this.isInitFailed = true
    }

    this.isInitializing = false
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
    async fulfill () {
      this.isPending = true
      if (await confirmAction()) {
        try {
          await this.tokenRequest.fulfill()
          this.$store.dispatch('SET_INFO', 'Token successfully created')
          this.$router.push({ name: 'tokens' })
        } catch (error) {
          ErrorHandler.process(error)
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
