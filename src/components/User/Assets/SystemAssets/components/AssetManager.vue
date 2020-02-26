<template>
  <div class="asset-manager">
    <h2>
      {{ "asset-manager.header" | globalize({
        assetCode: assetCode
      })
      }}
    </h2>

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
          :title="'asset-manager.choose-img' | globalize"
          :notes="notes"
        />
      </div>

      <div class="app__form-row">
        <input-field
          class="app__form-field"
          :label="'asset-manager.lbl-asset-name' | globalize"
          v-model="form.creatorDetails.name"
          name="asset-name"
          @blur="touchField('form.creatorDetails.name')"
          :error-message="getFieldErrorMessage(
            'form.creatorDetails.name',
            { maxLength: ASSET_NAME_MAX_LENGTH }
          )"
          :disabled="formMixin.isDisabled"
        />

        <input-field
          class="app__form-field"
          :label="'asset-manager.lbl-asset-code' | globalize"
          v-model="form.id"
          :disabled="isExistingAsset || formMixin.isDisabled"
          name="asset-code"
          @blur="touchField('form.id')"
          :error-message="getFieldErrorMessage(
            'form.id',
            { maxLength: ASSET_CODE_MAX_LENGTH }
          )"
        />
      </div>

      <div class="app__form-row">
        <input-field
          class="app__form-field"
          :label="'asset-manager.lbl-issuer-public-key' | globalize"
          v-model="form.preissuedAssetSigner"
          :disabled="isExistingAsset || formMixin.isDisabled"
          name="issuer-key"
          @blur="touchField('form.preissuedAssetSigner')"
          :error-message="getFieldErrorMessage(
            'form.preissuedAssetSigner')"
        />

        <input-field
          class="app__form-field"
          type="number"
          min="0"
          :max="DEFAULT_MAX_AMOUNT"
          :step="step"
          :label="'asset-manager.lbl-maximum-assets' | globalize"
          v-model="form.maxIssuanceAmount"
          @input="validateMaxIssuanceAmount"
          :disabled="isExistingAsset || formMixin.isDisabled"
          name="max-assets"
          @blur="touchField('form.maxIssuanceAmount')"
          :error-message="getFieldErrorMessage(
            'form.maxIssuanceAmount',
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
          :max="form.maxIssuanceAmount"
          :step="step"
          class="app__form-field"
          :label="'asset-manager.lbl-initial-preissued-amount' | globalize"
          v-model="form.initialPreissuedAmount"
          @input="validateInitialPreissuedAmount"
          :disabled="isExistingAsset || formMixin.isDisabled"
          name="initial-preissued"
          @blur="touchField('form.initialPreissuedAmount')"
          :error-message="getFieldErrorMessage(
            'form.initialPreissuedAmount',
            { minValue: 0, maxValue: form.maxIssuanceAmount }
          )"
        />

        <input-field
          v-else
          v-model="form.availableForIssuance"
          @input="validateInitialPreissuedAmount"
          type="number"
          class="app__form-field"
          :step="step"
          :label="'asset-manager.lbl-available-for-issuance' | globalize"
          :disabled="true"
          name="available-issuance"
        />

        <input-field
          class="app__form-field"
          type="number"
          min="0"
          step="1"
          max="6"
          :label="'asset-manager.lbl-trailing-digits-count' | globalize"
          v-model="form.trailingDigits"
          :disabled="isExistingAsset || formMixin.isDisabled"
          name="trailing-digits-count"
          @blur="touchField('form.trailingDigits')"
          :error-message="getFieldErrorMessage(
            'form.trailingDigits',
            { minValue: 0, maxValue: 6 }
          )"
        />
      </div>

      <div class="app__form-row">
        <select-field
          class="app__form-field app__form-field--halved"
          :label="'asset-manager.lbl-asset-type' | globalize"
          v-model="form.type"
          :disabled="isExistingAsset || formMixin.isDisabled"
          name="asset-type"
          @blur="touchField('form.type')"
          :error-message="getFieldErrorMessage('form.type')"
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
                {{ safeGet(form, 'creatorDetails.terms.name') }}
              </a>
            </template>
          </span>
        </div>
      </div>

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="form.policies.value"
          :label="ASSET_POLICIES.transferable | assetPoliciesFilter"
          :cb-value="ASSET_POLICIES.transferable"
          :disabled="formMixin.isDisabled"
        />
      </div>

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="form.policies.value"
          :label="ASSET_POLICIES.baseAsset | assetPoliciesFilter"
          :cb-value="ASSET_POLICIES.baseAsset"
          :disabled="formMixin.isDisabled"
        />
      </div>

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="form.policies.value"
          :label="ASSET_POLICIES.statsQuoteAsset | assetPoliciesFilter"
          :cb-value="ASSET_POLICIES.statsQuoteAsset"
          :disabled="formMixin.isDisabled"
        />
      </div>

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="form.policies.value"
          :label="ASSET_POLICIES.withdrawable | assetPoliciesFilter"
          :cb-value="ASSET_POLICIES.withdrawable"
          :disabled="formMixin.isDisabled"
        />
      </div>

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="form.policies.value"
          :label="ASSET_POLICIES.issuanceManualReviewRequired
            | assetPoliciesFilter"
          :cb-value="ASSET_POLICIES.issuanceManualReviewRequired"
          :disabled="formMixin.isDisabled"
        />
      </div>

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="form.policies.value"
          :label="ASSET_POLICIES.canBeBaseInAtomicSwap
            | assetPoliciesFilter"
          :cb-value="ASSET_POLICIES.canBeBaseInAtomicSwap"
          :disabled="formMixin.isDisabled"
        />
      </div>

      <div class="app__form-row">
        <tick-field
          class="app__form-field"
          v-model="form.policies.value"
          :label="ASSET_POLICIES.canBeQuoteInAtomicSwap
            | assetPoliciesFilter"
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
            v-model="form.creatorDetails.isCoinpayments"
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
            v-model="form.creatorDetails.externalSystemType"
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
                v-model="form.creatorDetails.stellar.deposit"
                :disabled="formMixin.isDisabled"
                :cb-value="true"
                :label="'asset-manager.lbl-deposit' | globalize"
              />
            </div>
          </div>

          <div class="app__form-row">
            <div class="app__form-field">
              <tick-field
                v-model="form.creatorDetails.stellar.withdraw"
                :disabled="formMixin.isDisabled"
                :cb-value="true"
                :label="'asset-manager.lbl-withdraw' | globalize"
              />
            </div>
          </div>

          <div class="app__form-row">
            <select-field
              v-model="form.creatorDetails.stellar.assetType"
              name="create-stellar-asset-type"
              class="app__form-field"
              :label="'asset-manager.lbl-asset-type' | globalize"
              @blur="touchField('form.creatorDetails.stellar.assetType')"
              :error-message="getFieldErrorMessage(
                'form.creatorDetails.stellar.assetType',
              )"
              :disabled="formMixin.isDisabled"
            >
              <option
                v-for="assetType in STELLAR_TYPES"
                :key="assetType"
                :value="assetType"
              >
                {{ assetType | stellarAssetTypesFilter }}
              </option>
            </select-field>

            <!-- eslint-disable max-len -->
            <input-field
              white-autofill
              v-model="form.creatorDetails.stellar.assetCode"
              class="app__form-field"
              name="create-stellar-asset-code"
              :label="'asset-manager.lbl-asset-code' | globalize"
              @blur="touchField('form.creatorDetails.stellar.assetCode')"
              :error-message="getFieldErrorMessage('form.creatorDetails.stellar.assetCode', {
                maxLength: getAssetCodeMaxLength(),
                minLength: CREDIT_ALPHANUM12_MIN_LENGTH
              })"
              :disabled="formMixin.isDisabled ||
                form.creatorDetails.stellar.assetType === STELLAR_TYPES.native"
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
                v-model="form.creatorDetails.erc20.deposit"
                :disabled="formMixin.isDisabled"
                :cb-value="true"
                :label="'asset-manager.lbl-deposit' | globalize"
              />
            </div>
          </div>

          <div class="app__form-row">
            <div class="app__form-field">
              <tick-field
                v-model="form.creatorDetails.erc20.withdraw"
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
              v-model="form.creatorDetails.erc20.address"
              class="app__form-field"
              name="create-erc20-asset-code"
              :label="'asset-manager.lbl-address' | globalize"
              @blur="touchField('form.creatorDetails.erc20.address')"
              :error-message="getFieldErrorMessage('form.creatorDetails.erc20.address')"
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
          :message="'asset-manager.please-recheck-form' | globalize"
          :ok-button-text="'asset-manager.btn-confirm' | globalize"
          :cancel-button-text="'asset-manager.btn-cancel' | globalize"
        />

        <button
          v-else
          class="app__btn"
          :disabled="formMixin.isDisabled"
        >
          <span v-if="isExistingAsset">
            {{ "asset-manager.btn-update-asset" | globalize }}
          </span>
          <span v-else>
            {{ "asset-manager.btn-create-asset" | globalize }}
          </span>
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
import BigNumber from 'bignumber.js'
import { base } from '@tokend/js-sdk'
import { api, documentsManager } from '@/api'
import { globalize } from '@/components/App/filters/filters'
import { AssetRecord } from '@/js/records/asset.record'
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
  STELLAR_TYPES,
} from '@/constants'

import { ErrorHandler } from '@/utils/ErrorHandler'
const ASSET_CODE_MAX_LENGTH = 16
const ASSET_NAME_MAX_LENGTH = 255

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
      asset: new AssetRecord(),
      form: {
        id: '',
        preissuedAssetSigner: config.MASTER_ACCOUNT,
        policies: {
          value: 0,
        },
        initialPreissuedAmount: '0',
        maxIssuanceAmount: '0',
        availableForIssuance: '0',
        trailingDigits: '6',
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
      ASSET_CODE_MAX_LENGTH,
      ASSET_NAME_MAX_LENGTH,
      STELLAR_TYPES,
      CREDIT_ALPHANUM12_MIN_LENGTH,
    }
  },

  validations () {
    let validations = {
      form: {
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
          maxValue: maxValue(this.form.maxIssuanceAmount),
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
    if (this.form.creatorDetails.stellar) {
      const stellarAssetCode =
        validations.form.creatorDetails.stellar.assetCode

      switch (this.form.creatorDetails.stellar.assetType) {
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

    if (this.form.creatorDetails.erc20.address) {
      validations.form.creatorDetails.erc20.address.hex = hex
    }
    return validations
  },

  computed: {
    ...mapGetters({
      userAddress: getters.GET_USER_ADDRESS,
      assetTypeDefault: 'kvAssetTypeDefault',
      assetTypeKycRequired: 'kvAssetTypeKycRequired',
    }),

    step () {
      return 1 / Math.pow(10, this.form.trailingDigits)
    },

    notes () {
      return [
        globalize('asset-manager.img-type'),
        globalize('asset-manager.img-weight-limit'),
        globalize('asset-manager.min-img-resolution'),
      ]
    },
    isExistingAsset () {
      return !!this.assetCode
    },

    termsSelectedFileName () {
      return this[DOCUMENT_TYPES.assetTerms].name
    },

    termsUrl () {
      if (safeGet(this.form, 'creatorDetails.terms.key')) {
        return `${config.FILE_STORAGE}/${safeGet(this.form, 'creatorDetails.terms.key')}`
      }
      return ''
    },
  },

  watch: {
    'form.creatorDetails.stellar.assetType' (val) {
      if (val === STELLAR_TYPES.native) {
        this.form.creatorDetails.stellar.assetCode = NATIVE_XLM_TYPE
      }
    },
    'form.trailingDigits' () {
      this.validateMaxIssuanceAmount()
      this.validateInitialPreissuedAmount()
    },
  },

  created () {
    if (this.isExistingAsset) {
      this.getAsset()
    }
  },

  methods: {
    validateMaxIssuanceAmount () {
      this.form.maxIssuanceAmount = BigNumber(this.correctValues(
        this.form.trailingDigits,
        this.form.maxIssuanceAmount))
    },
    validateInitialPreissuedAmount () {
      this.form.initialPreissuedAmount = BigNumber(this.correctValues(
        this.form.trailingDigits,
        this.form.initialPreissuedAmount))
    },
    correctValues (digits, value) {
      if (value.toString().split(/\./)[1].length > parseFloat(digits)) {
        let result = parseFloat(value.toString().split(/\./)[0] + '.' +
          value.toString().split(/\./)[1].substr(0, parseFloat(digits)))
        return result
      }
      return value
    },
    safeGet,
    globalize,
    populateForm (asset) {
      this.form.id =
        asset.id
      this.form.preissuedAssetSigner =
        asset.preissuedAssetSigner
      this.form.policies.value =
        asset.policies.value
      this.form.initialPreissuedAmount =
        asset.initialPreissuedAmount
      this.form.maxIssuanceAmount =
        asset.maxIssuanceAmount
      this.form.availableForIssuance =
        asset.availableForIssuance
      this.form.trailingDigits =
        asset.trailingDigits
      this.form.type =
        asset.type
      this.form.creatorDetails.name =
        asset.creatorDetails.name
      this.form.creatorDetails.logo =
        asset.creatorDetails.logo
      this.form.creatorDetails.terms =
        asset.creatorDetails.terms
      this.form.creatorDetails.externalSystemType =
        asset.creatorDetails.externalSystemType
      this.form.creatorDetails.isCoinpayments =
        asset.creatorDetails.isCoinpayments
      this.form.creatorDetails.stellar.withdraw =
        asset.creatorDetails.stellar.withdraw
      this.form.creatorDetails.stellar.deposit =
        asset.creatorDetails.stellar.deposit
      this.form.creatorDetails.stellar.assetType =
        asset.creatorDetails.stellar.assetType
      this.form.creatorDetails.stellar.assetCode =
        asset.creatorDetails.stellar.assetCode
      this.form.creatorDetails.erc20.withdraw =
        asset.creatorDetails.erc20.withdraw
      this.form.creatorDetails.erc20.deposit =
        asset.creatorDetails.erc20.deposit
      this.form.creatorDetails.erc20.address =
        asset.creatorDetails.erc20.address
    },
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
        let asset = new AssetRecord(data)
        this.populateForm(asset)
        this.form.availableForIssuance =
          BigNumber(this.form.availableForIssuance.toString())
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
          if (this.form.creatorDetails.logo) {
            logo.key = this.form.creatorDetails.logo.key
            logo.type = this.form.creatorDetails.logo.type
          }

          const terms = {}
          if (this.form.creatorDetails.terms) {
            terms.key = this.form.creatorDetails.terms.key
            terms.type = this.form.creatorDetails.terms.type
            terms.name = this.form.creatorDetails.terms.name
          }

          operation = base.ManageAssetBuilder.assetUpdateRequest({
            requestID: '0',
            code: String(this.form.id),
            policies: Number(this.form.policies.value),
            allTasks: 0,
            creatorDetails: {
              name: this.form.creatorDetails.name,
              external_system_type: this.form
                .creatorDetails.externalSystemType,
              is_coinpayments: this.form.creatorDetails.isCoinpayments,
              logo,
              terms,
              stellar: this.getStellarData(),
              erc20: this.getErc20Data(),
            },
          })
        } else {
          operation = base.ManageAssetBuilder.assetCreationRequest({
            requestID: '0',
            code: String(this.form.id),
            preissuedAssetSigner: String(this.form.preissuedAssetSigner),
            maxIssuanceAmount: String(this.form.maxIssuanceAmount),
            policies: Number(this.form.policies.value),
            assetType: String(this.form.type),
            initialPreissuedAmount: String(
              this.form.initialPreissuedAmount),
            trailingDigitsCount: Number(this.form.trailingDigits),
            allTasks: 0,
            creatorDetails: {
              name: this.form.creatorDetails.name,
              external_system_type: this.form
                .creatorDetails.externalSystemType,
              is_coinpayments: this.form.creatorDetails.isCoinpayments,
              logo: {
                key: this.form.creatorDetails.logo.key,
                type: this.form.creatorDetails.logo.type,
              },
              terms: {
                key: this.form.creatorDetails.terms.key,
                type: this.form.creatorDetails.terms.type,
                name: this.form.creatorDetails.terms.name,
              },
              stellar: this.getStellarData(),
              erc20: this.getErc20Data(),
            },
          })
        }
        await api.postOperations(operation)
        Bus.$emit('recheckConfig')
        Bus.success('asset-manager.submitted-successfully')
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

      this.form.creatorDetails[type === DOCUMENT_TYPES.assetTerms ? 'terms' : 'logo'] = {
        key: key,
        name: this[type].name,
        type: this[type].mime,
      }
    },
    getAssetCodeMaxLength () {
      /* eslint-disable max-len */
      if (this.form.creatorDetails.stellar.assetType === STELLAR_TYPES.creditAlphanum4) {
        return CREDIT_ALPHANUM4_MAX_LENGTH
      } else if (this.form.creatorDetails.stellar.assetType === STELLAR_TYPES.creditAlphanum12) {
        return CREDIT_ALPHANUM12_MAX_LENGTH
      }
      /* eslint-enable max-len */
    },

    getStellarData () {
      return this.isStellarIntegrationEnabled
        ? {
          withdraw: this.form.creatorDetails.stellar.withdraw,
          deposit: this.form.creatorDetails.stellar.deposit,
          asset_type: this.form.creatorDetails.stellar.assetType,
          asset_code: this.form.creatorDetails.stellar.assetCode,
        }
        : {}
    },
    getErc20Data () {
      return this.isErc20IntegrationEnabled
        ? {
          withdraw: this.form.creatorDetails.erc20.withdraw,
          deposit: this.form.creatorDetails.erc20.deposit,
          address: this.form.creatorDetails.erc20.address,
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
