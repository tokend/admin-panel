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

    <form @submit.prevent="submit">
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
          :disabled="isPending"
          v-validate="'required|max:255'"
          name="asset-name"
          :error-message="errors.first('asset-name')"
        />

        <input-field
          class="app__form-field"
          label="Asset code"
          v-model="asset.id"
          :disabled="isExistingAsset || isPending"
          v-validate="'required|alpha_num|max:16'"
          name="asset-code"
          :error-message="errors.first('asset-code')"
        />
      </div>

      <div class="app__form-row">
        <input-field
          class="app__form-field"
          label="Issuer public key"
          v-model="asset.preIssuanceAssetSigner"
          :disabled="isExistingAsset || isPending"
          v-validate="'required|alpha_num'"
          name="issuer-key"
          :error-message="errors.first('issuer-key')"
        />

        <input-field
          v-if="!isExistingAsset"
          class="app__form-field"
          label="Initial preissued amount"
          v-model="asset.initialPreissuedAmount"
          :disabled="isExistingAsset || isPending"
          v-validate="'required|decimal'"
          name="initial-preissued"
          :error-message="errors.first('initial-preissued')"
        />

        <input-field
          v-else
          v-model="asset.availableForIssuance"
          class="app__form-field"
          label="Available for issuance"
          :disabled="true"
          v-validate="'required|decimal'"
          name="available-issuance"
          :error-message="errors.first('available-issuance')"
        />
      </div>

      <div class="app__form-row">
        <input-field
          class="app__form-field app__form-field--halved"
          type="number"
          :min="0"
          :step="DEFAULT_INPUT_STEP"
          label="Maximum assets"
          v-model="asset.maxIssuanceAmount"
          :disabled="isExistingAsset || isPending"
          v-validate="'required|decimal'"
          name="max-assets"
          :error-message="errors.first('max-assets')"
        />

        <!--
          the field is disabled due to omitted testing
          session of trailingDigitsCount
        -->
        <input-field
          class="app__form-field app__form-field--halved"
          type="number"
          :min="0"
          :step="0"
          label="Trailing digits count"
          v-model="asset.trailingDigitsCount"
          :disabled="true || isExistingAsset || isPending"
          v-validate="'required|numeric|max_value:6'"
          name="trailing-digits-count"
          :error-message="errors.first('trailing-digits-count')"
        />
      </div>

      <div class="app__form-row">
        <select-field
          class="app__form-field app__form-field--halved"
          label="Asset type"
          v-model="asset.type"
          :disabled="isExistingAsset || isPending"
          name="asset-type"
          v-validate="'required'"
          :error-message="errors.first('asset-type')"
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
            :disabled="isPending"
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
          :disabled="isPending"
        />
      </div>

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="asset.policies.value"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.baseAsset]"
          :cb-value="ASSET_POLICIES.baseAsset"
          :disabled="isPending"
        />
      </div>

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="asset.policies.value"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.statsQuoteAsset]"
          :cb-value="ASSET_POLICIES.statsQuoteAsset"
          :disabled="isPending"
        />
      </div>

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="asset.policies.value"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.withdrawable]"
          :cb-value="ASSET_POLICIES.withdrawable"
          :disabled="isPending"
        />
      </div>

      <!-- eslint-disable max-len -->
      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="asset.policies.value"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.issuanceManualReviewRequired]"
          :cb-value="ASSET_POLICIES.issuanceManualReviewRequired"
          :disabled="isPending"
        />
      </div>
      <!-- eslint-enable max-len -->

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="asset.creatorDetails.isFiat"
          label="Fiat asset"
          :disabled="isPending"
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
            :disabled="isPending"
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
            :disabled="isPending"
            v-validate="{max_value: int32}"
          />
        </div>
      </template>

      <div class="app__form-actions">
        <button
          class="app__btn"
          :disabled="isPending"
        >
          {{ isExistingAsset ? 'Update asset' : 'Create asset' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ImageField, TickField, InputField, SelectField } from '@comcom/fields'
import { confirmAction } from '@/js/modals/confirmation_message'

import api from '@/api'
import { Sdk } from '@/sdk'
import { ApiCallerFactory } from '@/api-caller-factory'

import safeGet from 'lodash/get'

import config from '@/config'
import { ErrorHandler } from '@/utils/ErrorHandler'

import Bus from '@/utils/EventBus'
import { fileReader } from '@/utils/file-reader'

import { mapGetters } from 'vuex'
import { getters } from '@/store/types'

import {
  ASSET_POLICIES,
  DEFAULT_INPUT_STEP,
  DOCUMENT_TYPES,
  ASSET_POLICIES_VERBOSE,
} from '@/constants'

import 'mdi-vue/ChevronDownIcon'
import 'mdi-vue/ChevronUpIcon'

<<<<<<< HEAD
import { confirmAction } from '@/js/modals/confirmation_message'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { ApiCallerFactory } from '@/api-caller-factory'

=======
>>>>>>> master
export default {
  components: {
    InputField,
    SelectField,
    TickField,
    ImageField,
  },

  props: {
    assetCode: { type: String, default: '' },
  },

  data () {
    return {
      ASSET_POLICIES,
      DEFAULT_INPUT_STEP,
      ASSET_POLICIES_VERBOSE,
      isShownAdvanced: false,
      ASSET_TYPES: config.ASSET_TYPES,

      asset: {
        preissuedAssetSigner: config.MASTER_ACCOUNT,
        policies: {
          value: 0
        },
        initialPreissuedAmount: '0',
        trailingDigitsCount: '6',
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

      isPending: false,
      DOCUMENT_TYPES,
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
        const { data } = await ApiCallerFactory
          .createCallerInstance()
          .getWithSignature(`/v3/assets/${this.assetCode}`, {
            include: ['owner']
          })
        data.creatorDetails = data.creatorDetails || data.details
        Object.assign(this.asset, data)
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async submit () {
      if (!this.isValid()) return
      if (!await confirmAction()) return

      this.isPending = true
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

          operation = Sdk.base.ManageAssetBuilder.assetUpdateRequest({
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
          operation = Sdk.base.ManageAssetBuilder.assetCreationRequest({
            requestID: '0',
            code: String(this.asset.id),
            preissuedAssetSigner: String(this.asset.preissuedAssetSigner),
            maxIssuanceAmount: String(this.asset.maxIssuanceAmount),
            policies: Number(this.asset.policies.value),
            assetType: String(this.asset.type),
            initialPreissuedAmount: String(this.asset.initialPreissuedAmount),
            trailingDigitsCount: Number(this.asset.trailingDigitsCount),
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
<<<<<<< HEAD
        await ApiCallerFactory
          .createCallerInstance()
          .postOperations(operation)
=======

        await Sdk.horizon.transactions.submitOperations(operation)
>>>>>>> master
        Bus.$emit('recheckConfig')

        this.$store.dispatch('SET_INFO', 'Submitted successfully.')
        this.$router.push({ name: 'assets.masterAssets.index' })
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.isPending = false
    },

    isValid () {
      if (this.errors.errors.lenght) {
        ErrorHandler.process('Some field is invalid')
        return false
      }

      if (!Sdk.base.Keypair.isValidPublicKey(this.asset.preissuedAssetSigner)) {
        ErrorHandler.process('Issuer public key is invalid')
        return false
      }
      return true
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

      const { data: config } = await ApiCallerFactory
        .createCallerInstance()
        .postWithSignature('/documents', {
          data: {
            type,
            attributes: { content_type: this[type].mime },
            relationships: {
              owner: {
                data: { id: this.userAddress },
              },
            },
          },
        })
      await api.documents.uploadFile(this[type].file, config, this[type].mime)

      this.asset.creatorDetails[type === DOCUMENT_TYPES.assetTerms ? 'terms' : 'logo'] = {
        key: config.key,
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
