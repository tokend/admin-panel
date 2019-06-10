<template>
  <div class="asset-manager">
    <div
      class="asset-manager__current-wrp"
      v-if="asset.availableForIssuance && asset.issued"
    >
      <div class="asset-manager__current-issuance-details">
        <span class="available">
          <span class="highlight amount text">
            {{ asset.availableForIssuance }}&nbsp;•&nbsp;
          </span>
          <label class="label">
            available for issuance
          </label>
        </span>
        <span class="issued">
          <span class="highlight amount text">
            {{ asset.issued }}&nbsp;•&nbsp;
          </span>
          <label class="label">
            issued
          </label>
        </span>
      </div>
    </div>

    <form
      @submit.prevent="submit"
      novalidate
    >
      <div class="asset-manager__image-field-wrp">
        <label class="asset-manager__image-lbl">
          Upload asset logo
        </label>
        <image-field
          :file-key="safeGet(asset, `creatorDetails.logo.key`)"
          @change="onFileChange($event, DOCUMENT_TYPES.assetLogo)"
        />
      </div>

      <div class="app__form-row">
        <input-field
          class="app__form-field"
          label="Asset name"
          v-model="asset.creatorDetails.name"
          name="asset-name"
          @blur="touchField('asset.creatorDetails.name')"
          :error-message="getFieldErrorMessage(
            'asset.creatorDetails.name',
            { maxLength: ASSET_NAME_MAX_LENGTH }
          )"
          :disabled="formMixin.isDisabled"
        />

        <input-field
          class="app__form-field"
          label="Asset code"
          v-model="asset.id"
          :disabled="isExistingAsset || formMixin.isDisabled"
          name="asset-code"
          @blur="touchField('asset.id')"
          :error-message="getFieldErrorMessage(
            'asset.id',
            { maxLength: ASSET_CODE_MAX_LENGTH }
          )"
        />
      </div>

      <div class="app__form-row">
        <input-field
          class="app__form-field"
          label="Issuer public key"
          v-model="asset.preissuedAssetSigner"
          :disabled="isExistingAsset || formMixin.isDisabled"
          name="issuer-key"
          @blur="touchField('asset.preissuedAssetSigner')"
          :error-message="getFieldErrorMessage('asset.preissuedAssetSigner')"
        />

        <input-field
          v-if="!isExistingAsset"
          type="number"
          min="0"
          :max="asset.maxIssuanceAmount"
          class="app__form-field"
          label="Initial preissued amount"
          v-model="asset.initialPreissuedAmount"
          :disabled="isExistingAsset || formMixin.isDisabled"
          name="initial-preissued"
          @blur="touchField('asset.initialPreissuedAmount')"
          :error-message="getFieldErrorMessage(
            'asset.initialPreissuedAmount',
            { minValue: 0, maxValue: asset.maxIssuanceAmount }
          )"
        />

        <input-field
          v-else
          v-model="asset.availableForIssuance"
          class="app__form-field"
          label="Available for issuance"
          :disabled="true"
          name="available-issuance"
        />
      </div>

      <div class="app__form-row">
        <input-field
          class="app__form-field app__form-field--halved"
          type="number"
          min="0"
          :step="selectedAssetStep(trailingDigitsCount)"
          label="Maximum assets"
          v-model="asset.maxIssuanceAmount"
          :disabled="isExistingAsset || formMixin.isDisabled"
          name="max-assets"
          @blur="touchField('asset.maxIssuanceAmount')"
          :error-message="getFieldErrorMessage(
            'asset.maxIssuanceAmount',
            {
              minValue: DEFAULT_INPUT_MIN,
              maxValue: DEFAULT_MAX_AMOUNT
            }
          )"
        />

        <!--
          the field is disabled due to omitted testing
          session of trailingDigits
        -->
        <input-field
          class="app__form-field app__form-field--halved"
          type="number"
          min="0"
          step="1"
          max="6"
          label="Trailing digits count"
          v-model="asset.trailingDigits"
          :disabled="isExistingAsset || formMixin.isDisabled"
          name="trailing-digits-count"
          @blur="touchField('asset.trailingDigits')"
          :error-message="getFieldErrorMessage(
            'asset.trailingDigits',
            { minValue: 0, maxValue: 6 }
          )"
        />
      </div>

      <div class="app__form-row">
        <select-field
          class="app__form-field app__form-field--halved"
          label="Asset type"
          v-model="asset.type"
          :disabled="isExistingAsset || formMixin.isDisabled"
          name="asset-type"
          @blur="touchField('asset.type')"
          :error-message="getFieldErrorMessage('asset.type')"
        >
          <option :value="ASSET_TYPES.default">
            Default
          </option>
          <option :value="ASSET_TYPES.kycRequired">
            KYC required
          </option>
        </select-field>
      </div>

      <div class="asset-manager__file-input-wrp">
        <span>Terms</span>
        <div class="asset-manager__file-input-inner">
          <label
            class="app__upload-btn app__btn app__btn--info"
            for="file-select"
          >
            Select File
          </label>
          <input
            class="app__upload-input"
            id="file-select"
            type="file"
            :disabled="formMixin.isDisabled"
            accept="application/pdf, image/*"
            @change="onFileChange($event, DOCUMENT_TYPES.assetTerms)"
          >
          <span class="asset-manager__file-name">
            <template v-if="termsSelectedFileName">
              {{ termsSelectedFileName }}
            </template>

            <template v-else-if="termsUrl">
              <a
                :href="termsUrl"
                target="_blank"
                rel="noopener"
              >
                {{ safeGet(asset, 'creatorDetails.terms.name') }}
              </a>
            </template>
          </span>
        </div>
      </div>

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="asset.policies.value"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.transferable]"
          :cb-value="ASSET_POLICIES.transferable"
          :disabled="formMixin.isDisabled"
        />
      </div>

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="asset.policies.value"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.baseAsset]"
          :cb-value="ASSET_POLICIES.baseAsset"
          :disabled="formMixin.isDisabled"
        />
      </div>

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="asset.policies.value"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.statsQuoteAsset]"
          :cb-value="ASSET_POLICIES.statsQuoteAsset"
          :disabled="formMixin.isDisabled"
        />
      </div>

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="asset.policies.value"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.withdrawable]"
          :cb-value="ASSET_POLICIES.withdrawable"
          :disabled="formMixin.isDisabled"
        />
      </div>

      <!-- eslint-disable max-len -->
      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="asset.policies.value"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.issuanceManualReviewRequired]"
          :cb-value="ASSET_POLICIES.issuanceManualReviewRequired"
          :disabled="formMixin.isDisabled"
        />
      </div>
      <!-- eslint-enable max-len -->

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="asset.creatorDetails.isFiat"
          label="Fiat asset"
          :disabled="formMixin.isDisabled"
        />
      </div>

      <div class="asset-manager-advanced__block">
        <div class="asset-manager-advanced__heading">
          <h3>Advanced</h3>
          <button
            class="app__btn-secondary app__btn-secondary--iconed"
            @click.prevent="isShownAdvanced = !isShownAdvanced"
          >
            <mdi-chevron-up-icon v-if="isShownAdvanced" />
            <mdi-chevron-down-icon v-else />
          </button>
        </div>
      </div>

      <template v-if="isShownAdvanced">
        <div class="app__form-row">
          <tick-field
            title="Use Coinpayments service for deposition"
            class="app__form-field"
            v-model="asset.creatorDetails.isCoinpayments"
            label="Use Coinpayments"
            :disabled="formMixin.isDisabled"
          />
        </div>
        <div class="app__form-row">
          <input-field
            class="app__form-field app__form-field--halved"
            type="number"
            label="External system type"
            name="External system type"
            v-model="asset.creatorDetails.externalSystemType"
            :required="false"
            :disabled="formMixin.isDisabled"
          />
        </div>
      </template>

      <div class="app__form-actions">
        <button
          class="app__btn"
          :disabled="formMixin.isDisabled"
        >
          {{ isExistingAsset ? 'Update asset' : 'Create asset' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { confirmAction } from '@/js/modals/confirmation_message'

import FormMixin from '@/mixins/form.mixin'
import {
  required,
  accountId,
  minValue,
  maxValue,
  maxLength,
  alphaNum,
} from '@/validators'

import { base } from '@tokend/js-sdk'
import { api, documentsManager } from '@/api'

import safeGet from 'lodash/get'

import config from '@/config'

import { Bus } from '@/utils/bus'
import { fileReader } from '@/utils/file-reader'

import { mapGetters } from 'vuex'
import { getters } from '@/store/types'

import {
  ASSET_POLICIES,
  DEFAULT_INPUT_STEP,
  DEFAULT_INPUT_MIN,
  DEFAULT_MAX_AMOUNT,
  DOCUMENT_TYPES,
  ASSET_POLICIES_VERBOSE,
} from '@/constants'

import { ErrorHandler } from '@/utils/ErrorHandler'
const ASSET_CODE_MAX_LENGTH = 16
const ASSET_NAME_MAX_LENGTH = 255

export default {
  mixins: [FormMixin],

  props: {
    assetCode: { type: String, default: '' },
  },

  data () {
    return {
      isShownAdvanced: false,

      asset: {
        id: '',
        preissuedAssetSigner: config.MASTER_ACCOUNT,
        policies: {
          value: 0,
        },
        initialPreissuedAmount: '0',
        maxIssuanceAmount: '0',
        availableForIssuance: '0',
        trailingDigits: '6',
        assetType: '0',
        creatorDetails: {
          isFiat: false,
          name: '',
          logo: {},
          terms: {},
          externalSystemType: '',
          isCoinpayments: false,
        },
      },

      [DOCUMENT_TYPES.assetTerms]: {
        file: null,
        mime: null,
        name: null,
      },

      [DOCUMENT_TYPES.assetLogo]: {
        file: null,
        mime: null,
        name: null,
      },

      DOCUMENT_TYPES,
      ASSET_POLICIES,
      DEFAULT_INPUT_STEP,
      DEFAULT_INPUT_MIN,
      DEFAULT_MAX_AMOUNT,
      ASSET_POLICIES_VERBOSE,
      ASSET_TYPES: config.ASSET_TYPES,
      ASSET_CODE_MAX_LENGTH,
      ASSET_NAME_MAX_LENGTH,
    }
  },

  validations () {
    return {
      asset: {
        id: {
          required,
          maxLength: maxLength(ASSET_CODE_MAX_LENGTH),
          alphaNum,
        },
        preissuedAssetSigner: { required, accountId },
        maxIssuanceAmount: {
          required,
          minValue: minValue(DEFAULT_INPUT_MIN),
          maxValue: maxValue(DEFAULT_MAX_AMOUNT),
        },
        initialPreissuedAmount: {
          required,
          minValue: minValue(0),
          maxValue: maxValue(this.asset.maxIssuanceAmount),
        },
        trailingDigits: {
          required,
          minValue: minValue(0),
          maxValue: maxValue(6),
        },
        type: { required },
        creatorDetails: {
          name: {
            required,
            maxLength: maxLength(ASSET_NAME_MAX_LENGTH),
          },
        },
      },
    }
  },

  computed: {
    ...mapGetters({ userAddress: getters.GET_USER_ADDRESS }),

    isExistingAsset () {
      return !!this.assetCode
    },

    termsSelectedFileName () {
      return this[DOCUMENT_TYPES.assetTerms].name
    },

    termsUrl () {
      if (safeGet(this.asset, 'creatorDetails.terms.key')) {
        return `${config.FILE_STORAGE}/${safeGet(this.asset, 'creatorDetails.terms.key')}`
      }
      return ''
    },
  },

  created () {
    if (this.isExistingAsset) {
      this.getAsset()
    }
  },

  methods: {
    safeGet,

    async getAsset () {
      try {
        const endpoint = `/v3/assets/${this.assetCode}`
        const { data } = await api.getWithSignature(endpoint, {
          include: ['owner'],
        })
        data.creatorDetails = data.creatorDetails || data.details
        Object.assign(this.asset, data)
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async submit () {
      if (!this.isFormValid()) return
      if (!await confirmAction()) return

      this.disableForm()
      try {
        await Promise.all([
          this.uploadFile(DOCUMENT_TYPES.assetTerms),
          this.uploadFile(DOCUMENT_TYPES.assetLogo),
        ])

        let operation
        if (this.isExistingAsset) {
          const logo = {}
          if (this.asset.creatorDetails.logo) {
            logo.key = this.asset.creatorDetails.logo.key
            logo.type = this.asset.creatorDetails.logo.type
          }

          const terms = {}
          if (this.asset.creatorDetails.terms) {
            terms.key = this.asset.creatorDetails.terms.key
            terms.type = this.asset.creatorDetails.terms.type
            terms.name = this.asset.creatorDetails.terms.name
          }

          operation = base.ManageAssetBuilder.assetUpdateRequest({
            requestID: '0',
            code: String(this.asset.id),
            policies: Number(this.asset.policies.value),
            allTasks: 0,
            creatorDetails: {
              name: this.asset.creatorDetails.name,
              isFiat: this.asset.creatorDetails.isFiat,
              external_system_type: this.asset
                .creatorDetails.externalSystemType,
              is_coinpayments: this.asset.creatorDetails.isCoinpayments,
              logo,
              terms,
            },
          })
        } else {
          operation = base.ManageAssetBuilder.assetCreationRequest({
            requestID: '0',
            code: String(this.asset.id),
            preissuedAssetSigner: String(this.asset.preissuedAssetSigner),
            maxIssuanceAmount: String(this.asset.maxIssuanceAmount),
            policies: Number(this.asset.policies.value),
            assetType: String(this.asset.type),
            initialPreissuedAmount: String(this.asset.initialPreissuedAmount),
            trailingDigitsCount: Number(this.asset.trailingDigits),
            allTasks: 0,
            creatorDetails: {
              name: this.asset.creatorDetails.name,
              isFiat: this.asset.creatorDetails.isFiat,
              external_system_type: this.asset
                .creatorDetails.externalSystemType,
              is_coinpayments: this.asset.creatorDetails.isCoinpayments,
              logo: {
                key: this.asset.creatorDetails.logo.key,
                type: this.asset.creatorDetails.logo.type,
              },
              terms: {
                key: this.asset.creatorDetails.terms.key,
                type: this.asset.creatorDetails.terms.type,
                name: this.asset.creatorDetails.terms.name,
              },
            },
          })
        }
        await api.postOperations(operation)
        Bus.$emit('recheckConfig')

        this.$store.dispatch('SET_INFO', 'Submitted successfully.')
        this.$router.push({ name: 'assets.systemAssets.index' })
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.enableForm()
    },

    onFileChange (event, type) {
      const file = fileReader.deriveFileFromChangeEvent(event)
      this[type] = {
        file,
        mime: file.type,
        name: file.name,
      }
    },

    async uploadFile (type, mimeType) {
      if (!this[type].file) return
      const key = await documentsManager.uploadDocument({
        type: type,
        mimeType: this[type].mime,
        file: this[type].file,
        accountId: this.userAddress,
      })

      this.asset.creatorDetails[type === DOCUMENT_TYPES.assetTerms ? 'terms' : 'logo'] = {
        key: key,
        name: this[type].name,
        type: this[type].mime,
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors";

.asset-manager {
  position: relative;
  padding-top: 3rem;
}

.asset-manager__current-wrp {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: absolute;
  width: 30rem;
  top: -7rem; // WARN: magic number
  right: 0;

  .highlight {
    color: $color-info;
  }
}

.asset-manager__file-input-inner {
  display: flex;
  align-items: center;
}

.asset-manager__image-field-wrp {
  margin-bottom: 3rem;
}

.asset-manager__image-lbl {
  display: block;
  margin-bottom: 0.5rem;
}

.asset-manager__file-input-wrp {
  margin: 3rem 0;
}

.asset-manager__file-name {
  margin-left: 1rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1.2rem;
  white-space: nowrap;
}

.asset-manager__current-issuance-details {
  flex: 1;
}

.asset-manager__current-issuance-details {
  display: flex;
  flex-direction: column;

  .available,
  .issued {
    display: flex;
    line-height: 2.1rem;

    .amount {
      flex: 0.4;
      // margin-right: 0.7rem;
      text-align: right;
    }

    label {
      flex: 0.6;
    }
  }
}

.asset-manager-advanced__heading {
  color: $color-active;
  display: flex;
  line-height: 100%;
  align-items: center;

  h3 {
    margin-right: 1rem;
  }
}

.asset-manager-advanced__block {
  margin: 2rem 0;
}
</style>
