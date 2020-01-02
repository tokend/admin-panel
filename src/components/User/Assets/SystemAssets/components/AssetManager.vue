<template>
  <div class="asset-manager">
    <h2>{{ "asset-manager.header" | globalize }}</h2>

    <form
      @submit.prevent="isFormValid() && showConfirmation()"
      novalidate
    >
      <div class="asset-manager__image-field-wrp">
        <label class="asset-manager__image-lbl">
          {{ "asset-manager.upload-asset-logo" | globalize }}
        </label>
        <image-field
          :file-key="safeGet(asset, `creatorDetails.logo.key`)"
          @change="onFileChange($event, DOCUMENT_TYPES.assetLogo)"
        />
      </div>

      <div class="app__form-row">
        <input-field
          class="app__form-field"
          :label="'asset-manager.lbl-asset-name' | globalize"
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
          :label="'asset-manager.lbl-asset-code' | globalize"
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
          :label="'asset-manager.lbl-issuer-public-key' | globalize"
          v-model="asset.preissuedAssetSigner"
          :disabled="isExistingAsset || formMixin.isDisabled"
          name="issuer-key"
          @blur="touchField('asset.preissuedAssetSigner')"
          :error-message="getFieldErrorMessage('asset.preissuedAssetSigner')"
        />

        <input-field
          class="app__form-field"
          type="number"
          min="0"
          :max="DEFAULT_MAX_AMOUNT"
          :step="DEFAULT_INPUT_STEP"
          :label="'asset-manager.lbl-maximum-assets' | globalize"
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
      </div>

      <div class="app__form-row">
        <input-field
          v-if="!isExistingAsset"
          type="number"
          min="0"
          :max="asset.maxIssuanceAmount"
          :step="DEFAULT_INPUT_STEP"
          class="app__form-field"
          :label="'asset-manager.lbl-initial-preissued-amount' | globalize"
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
          :label="'asset-manager.lbl-available-for-issuance' | globalize"
          :disabled="true"
          name="available-issuance"
        />

        <!--
          the field is disabled due to omitted testing
          session of trailingDigitsCount
        -->
        <input-field
          class="app__form-field"
          type="number"
          min="0"
          step="1"
          max="6"
          :label="'asset-manager.lbl-trailing-digits-count' | globalize"
          v-model="asset.trailingDigitsCount"
          :disabled="true || isExistingAsset || formMixin.isDisabled"
          name="trailing-digits-count"
          @blur="touchField('asset.trailingDigitsCount')"
          :error-message="getFieldErrorMessage(
            'asset.trailingDigitsCount',
            { minValue: 0, maxValue: 6 }
          )"
        />
      </div>

      <div class="app__form-row">
        <select-field
          class="app__form-field app__form-field--halved"
          :label="'asset-manager.lbl-asset-type' | globalize"
          v-model="asset.type"
          :disabled="isExistingAsset || formMixin.isDisabled"
          name="asset-type"
          @blur="touchField('asset.type')"
          :error-message="getFieldErrorMessage('asset.type')"
        >
          <option :value="assetTypeDefault">
            {{ "asset-manager.default" | globalize }}
          </option>
          <option :value="assetTypeKycRequired">
            {{ "asset-manager.KYC-required" | globalize }}
          </option>
        </select-field>
      </div>

      <div class="asset-manager__file-input-wrp">
        <span>{{ "asset-manager.terms" | globalize }}</span>
        <div class="asset-manager__file-input-inner">
          <label
            class="app__upload-btn app__btn app__btn--info"
            for="file-select"
          >
            {{ "asset-manager.select-file" | globalize }}
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
          v-model="asset.policies.value"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.canBeBaseInAtomicSwap]"
          :cb-value="ASSET_POLICIES.canBeBaseInAtomicSwap"
          :disabled="formMixin.isDisabled"
        />
      </div>

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="asset.policies.value"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.canBeQuoteInAtomicSwap]"
          :cb-value="ASSET_POLICIES.canBeQuoteInAtomicSwap"
          :disabled="formMixin.isDisabled"
        />
      </div>

      <div class="asset-manager-advanced__block">
        <div class="asset-manager-advanced__heading">
          <h3>{{ "asset-manager.advanced" | globalize }}</h3>
          <button
            class="app__btn-secondary app__btn-secondary--iconed"
            @click.prevent="isShownAdvanced = !isShownAdvanced"
          >
            <i
              v-if="isShownAdvanced"
              class="mdi mdi-chevron-up asset-manager__icon"
            />
            <i
              v-else
              class="mdi mdi-chevron-down asset-manager__icon"
            />
          </button>
        </div>
      </div>

      <template v-if="isShownAdvanced">
        <div class="app__form-row">
          <tick-field
            title="Use Coinpayments service for deposition"
            class="app__form-field"
            v-model="asset.creatorDetails.isCoinpayments"
            :label="'asset-manager.lbl-use-coinpayments' | globalize"
            :disabled="formMixin.isDisabled"
          />
        </div>
        <div class="app__form-row">
          <input-field
            class="app__form-field app__form-field--halved"
            type="number"
            :label="'asset-manager.lbl-external-system-type' | globalize"
            name="External system type"
            v-model="asset.creatorDetails.externalSystemType"
            :required="false"
            :disabled="formMixin.isDisabled"
          />
        </div>

        <div class="app__form-row">
          <tick-field
            class="app__form-field"
            v-model="isStellarIntegrationEnabled"
            :label="'asset-manager.lbl-integration-with-stellar' | globalize"
            :cb-value="true"
            :disabled="formMixin.isDisabled || isErc20IntegrationEnabled"
          />
        </div>

        <template v-if="isStellarIntegrationEnabled">
          <div class="app__form-row">
            <div class="app__form-field">
              <tick-field
                v-model="asset.creatorDetails.stellar.deposit"
                :disabled="formMixin.isDisabled"
                :cb-value="true"
                :label="'asset-manager.lbl-deposit' | globalize"
              />
            </div>
          </div>

          <div class="app__form-row">
            <div class="app__form-field">
              <tick-field
                v-model="asset.creatorDetails.stellar.withdraw"
                :disabled="formMixin.isDisabled"
                :cb-value="true"
                :label="'asset-manager.lbl-withdraw' | globalize"
              />
            </div>
          </div>

          <div class="app__form-row">
            <select-field
              v-model="asset.creatorDetails.stellar.assetType"
              name="create-stellar-asset-type"
              class="app__form-field"
              :label="'asset-manager.lbl-asset-type' | globalize"
              @blur="touchField('asset.creatorDetails.stellar.assetType')"
              :error-message="getFieldErrorMessage(
                'asset.creatorDetails.stellar.assetType',
              )"
              :disabled="formMixin.isDisabled"
            >
              <option
                v-for="assetType in STELLAR_ASSET_TYPES"
                :key="assetType.value"
                :value="assetType.value"
              >
                {{ assetType.label }}
              </option>
            </select-field>

            <!-- eslint-disable max-len -->
            <input-field
              white-autofill
              v-model="asset.creatorDetails.stellar.assetCode"
              class="app__form-field"
              name="create-stellar-asset-code"
              :label="'asset-manager.lbl-asset-code' | globalize"
              @blur="touchField('asset.creatorDetails.stellar.assetCode')"
              :error-message="getFieldErrorMessage('asset.creatorDetails.stellar.assetCode', {
                maxLength: getAssetCodeMaxLength(),
                minLength: CREDIT_ALPHANUM12_MIN_LENGTH
              })"
              :disabled="formMixin.isDisabled ||
                asset.creatorDetails.stellar.assetType === STELLAR_TYPES.native"
            />
          </div>
        <!-- eslint-enable max-len -->
        </template>

        <div class="app__form-row">
          <tick-field
            class="app__form-field"
            v-model="isErc20IntegrationEnabled"
            :label="'asset-manager.lbl-integration-erc20' | globalize"
            :cb-value="true"
            :disabled="formMixin.isDisabled || isStellarIntegrationEnabled"
          />
        </div>

        <template v-if="isErc20IntegrationEnabled">
          <div class="app__form-row">
            <div class="app__form-field">
              <tick-field
                v-model="asset.creatorDetails.erc20.deposit"
                :disabled="formMixin.isDisabled"
                :cb-value="true"
                :label="'asset-manager.lbl-deposit' | globalize"
              />
            </div>
          </div>

          <div class="app__form-row">
            <div class="app__form-field">
              <tick-field
                v-model="asset.creatorDetails.erc20.withdraw"
                :disabled="formMixin.isDisabled"
                :cb-value="true"
                :label="'asset-manager.lbl-withdraw' | globalize"
              />
            </div>
          </div>

          <div class="app__form-row">
            <!-- eslint-disable max-len -->
            <input-field
              white-autofill
              v-model="asset.creatorDetails.erc20.address"
              class="app__form-field"
              name="create-erc20-asset-code"
              :label="'asset-manager.lbl-adress' | globalize"
              @blur="touchField('asset.creatorDetails.erc20.address')"
              :error-message="getFieldErrorMessage('asset.creatorDetails.erc20.address')"
              :disabled="formMixin.isDisabled"
            />
          </div>
        <!-- eslint-enable max-len -->
        </template>
      </template>

      <div class="app__form-actions">
        <form-confirmation
          v-if="formMixin.isConfirmationShown"
          :is-pending="isFormSubmitting"
          @ok="submit"
          @cancel="hideConfirmation"
        />

        <button
          v-else-if="isExistingAsset"
          class="app__btn"
          :disabled="formMixin.isDisabled"
        >
          {{ "asset-manager.btn-update-asset" | globalize }}
        </button>
        <button
          v-else
          class="app__btn"
          :disabled="formMixin.isDisabled"
        >
          {{ "asset-manager.btn-create-asset" | globalize }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import FormMixin from '@/mixins/form.mixin'
import {
  required,
  accountId,
  minValue,
  maxValue,
  maxLength,
  alphaNum,
  minLength,
  requiredIf,
  hex,
} from '@/validators'

import { base } from '@tokend/js-sdk'
import { api, documentsManager } from '@/api'

import safeGet from 'lodash/get'

import config from '@/config'

import { Bus } from '@/utils/bus'
import { fileReader } from '@/utils/file-reader'

import { mapGetters } from 'vuex'
import { getters } from '@/store/types'
import _isEmpty from 'lodash/isEmpty'

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

const STELLAR_ASSET_TYPES = [
  {
    label: 'Alphanumeric 4',
    value: 'credit_alphanum4',
  },
  {
    label: 'Alphanumeric 12',
    value: 'credit_alphanum12',
  },
  {
    label: 'Native',
    value: 'native',
  },
]

const STELLAR_TYPES = {
  creditAlphanum4: 'credit_alphanum4',
  creditAlphanum12: 'credit_alphanum12',
  native: 'native',
}

const CREDIT_ALPHANUM4_MAX_LENGTH = 4
const CREDIT_ALPHANUM12_MIN_LENGTH = 5
const CREDIT_ALPHANUM12_MAX_LENGTH = 12
const NATIVE_XLM_TYPE = 'XLM'

export default {
  mixins: [FormMixin],

  props: {
    assetCode: { type: String, default: '' },
  },

  data () {
    return {
      isShownAdvanced: false,
      isFormSubmitting: false,
      isStellarIntegrationEnabled: false,
      isErc20IntegrationEnabled: false,
      asset: {
        id: '',
        preissuedAssetSigner: config.MASTER_ACCOUNT,
        policies: {
          value: 0,
        },
        initialPreissuedAmount: '0',
        maxIssuanceAmount: '0',
        availableForIssuance: '0',
        trailingDigitsCount: '6',
        type: '0',
        creatorDetails: {
          name: '',
          logo: {},
          terms: {},
          externalSystemType: '',
          isCoinpayments: false,
          stellar: {
            withdraw: false,
            deposit: false,
            assetType: '',
            assetCode: '',
          },
          erc20: {
            withdraw: false,
            deposit: false,
            address: '',
          },
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
      ASSET_CODE_MAX_LENGTH,
      ASSET_NAME_MAX_LENGTH,
      STELLAR_ASSET_TYPES,
      STELLAR_TYPES,
      CREDIT_ALPHANUM12_MIN_LENGTH,
    }
  },

  validations () {
    let validations = {
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
        trailingDigitsCount: {
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
          stellar: {
            assetType: {
              required: requiredIf(function () {
                return this.isStellarIntegrationEnabled
              }),
            },
            assetCode: {
              required: requiredIf(function () {
                return this.isStellarIntegrationEnabled
              }),
            },
          },
          erc20: {
            address: {
              required: requiredIf(function () {
                return this.isErc20IntegrationEnabled
              }),
            },
          },
        },
      },
    }
    if (this.asset.creatorDetails.stellar) {
      const stellarAssetCode =
        validations.asset.creatorDetails.stellar.assetCode

      switch (this.asset.creatorDetails.stellar.assetType) {
        case STELLAR_TYPES.creditAlphanum4:
          stellarAssetCode.maxLength = maxLength(CREDIT_ALPHANUM4_MAX_LENGTH)
          stellarAssetCode.alphaNum = alphaNum
          break
        case STELLAR_TYPES.creditAlphanum12:
          stellarAssetCode.minLength = minLength(CREDIT_ALPHANUM12_MIN_LENGTH)
          stellarAssetCode.maxLength = maxLength(CREDIT_ALPHANUM12_MAX_LENGTH)
          stellarAssetCode.alphaNum = alphaNum
          break
      }
    }

    if (this.asset.creatorDetails.erc20.address) {
      validations.asset.creatorDetails.erc20.address.hex = hex
    }
    return validations
  },

  computed: {
    ...mapGetters({
      userAddress: getters.GET_USER_ADDRESS,
      assetTypeDefault: 'kvAssetTypeDefault',
      assetTypeKycRequired: 'kvAssetTypeKycRequired',
    }),

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

  watch: {
    'asset.creatorDetails.stellar.assetType' (val) {
      if (val === STELLAR_TYPES.native) {
        this.asset.creatorDetails.stellar.assetCode = NATIVE_XLM_TYPE
      }
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
        if (!_isEmpty(data.creatorDetails.stellar)) {
          this.isStellarIntegrationEnabled = true
          this.isShownAdvanced = true
        } else {
          data.creatorDetails.stellar = {}
        }
        if (!_isEmpty(data.creatorDetails.erc20)) {
          this.isErc20IntegrationEnabled = true
          this.isShownAdvanced = true
        } else {
          data.creatorDetails.erc20 = {}
        }
        if (data.type !== undefined) {
          data.type = String(data.type)
        }
        Object.assign(this.asset, data)
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },

    async submit () {
      this.isFormSubmitting = true
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
              external_system_type: this.asset
                .creatorDetails.externalSystemType,
              is_coinpayments: this.asset.creatorDetails.isCoinpayments,
              logo,
              terms,
              stellar: this.getStellarData(),
              erc20: this.getErc20Data(),
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
            trailingDigitsCount: Number(this.asset.trailingDigitsCount),
            allTasks: 0,
            creatorDetails: {
              name: this.asset.creatorDetails.name,
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
              stellar: this.getStellarData(),
              erc20: this.getErc20Data(),
            },
          })
        }
        await api.postOperations(operation)
        Bus.$emit('recheckConfig')
        Bus.success('Submitted successfully.')
        this.$router.push({ name: 'assets.systemAssets.index' })
      } catch (error) {
        ErrorHandler.process(error)
      }

      this.isFormSubmitting = false
      this.hideConfirmation()
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
    getAssetCodeMaxLength () {
      /* eslint-disable max-len */
      if (this.asset.creatorDetails.stellar.assetType === STELLAR_TYPES.creditAlphanum4) {
        return CREDIT_ALPHANUM4_MAX_LENGTH
      } else if (this.asset.creatorDetails.stellar.assetType === STELLAR_TYPES.creditAlphanum12) {
        return CREDIT_ALPHANUM12_MAX_LENGTH
      }
      /* eslint-enable max-len */
    },

    getStellarData () {
      return this.isStellarIntegrationEnabled
        ? {
          withdraw: this.asset.creatorDetails.stellar.withdraw,
          deposit: this.asset.creatorDetails.stellar.deposit,
          asset_type: this.asset.creatorDetails.stellar.assetType,
          asset_code: this.asset.creatorDetails.stellar.assetCode,
        }
        : {}
    },
    getErc20Data () {
      return this.isErc20IntegrationEnabled
        ? {
          withdraw: this.asset.creatorDetails.erc20.withdraw,
          deposit: this.asset.creatorDetails.erc20.deposit,
          address: this.asset.creatorDetails.erc20.address,
        }
        : {}
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors';

.asset-manager {
  position: relative;
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

.asset-manager__icon {
  display: flex;
  justify-content: center;
  font-size: 2.4rem;
}
</style>
