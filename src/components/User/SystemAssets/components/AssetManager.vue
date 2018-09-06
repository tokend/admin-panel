<template>
  <div class="asset-manager">
    <div class="asset-manager__current-wrp" v-if="asset.available_for_issuance && asset.issued">
      <div class="asset-manager__current-issuance-details">
        <span class="available">
          <span class="highlight amount text">{{ asset.available_for_issuance }}&nbsp;•&nbsp;</span>
          <label class="label">available for issuance</label>
        </span>
        <span class="issued">
          <span class="highlight amount text">{{ asset.issued }}&nbsp;•&nbsp;</span>
          <label class="label">issued</label>
        </span>
      </div>
    </div>

    <form @submit.prevent="submit">
      <div class="asset-manager__image-field-wrp">
        <label class="asset-manager__image-lbl">Upload token logo</label>
        <image-field
          :fileKey="safeGet(asset, `details.logo.key`)"
          @change="onFileChange($event, DOCUMENT_TYPES.tokenLogo)"/>
      </div>

      <div class="app__form-row">
        <input-field class="app__form-field"
          label="Asset name"
          v-model="asset.details.name"
          :disabled="isExistingAsset || isPending"
        />

        <input-field class="app__form-field"
          label="Asset code"
          v-model="asset.code"
          :disabled="isExistingAsset || isPending"
        />
      </div>

      <!--TODO: need to add validation of public key-->

      <div class="app__form-row">
        <input-field class="app__form-field"
          label="Issuer public key"
          v-model="asset.preissued_asset_signer"
          :disabled="isExistingAsset || isPending"
        />

        <input-field class="app__form-field" v-if="!isExistingAsset"
          label="Initial preissued amount"
          v-model="asset.initialPreissuedAmount"
          :disabled="isExistingAsset || isPending"
        />

        <input-field v-else
                     v-model="asset.available_for_issuance"
                     class="app__form-field"
                     label="Available for issuance"
                     :disabled="true"
        />
      </div>

      <div class="app__form-row">
        <input-field class="app__form-field app__form-field--halved"
          type="number" :min="0" :step="DEFAULT_INPUT_STEP"
          label="Maximum tokens"
          v-model="asset.max_issuance_amount"
          :disabled="isExistingAsset || isPending"
        />
      </div>

      <div class="asset-manager__file-input-wrp">
        <span>Terms</span>
        <div class="asset-manager__file-input-inner">
          <label class="app__upload-btn app__btn app__btn--info"
                 for="file-select">
            Select File
          </label>
          <input class="app__upload-input"
                 id="file-select"
                 type="file"
                 accept="application/pdf, image/*"
                 @change="onFileChange($event, DOCUMENT_TYPES.tokenTerms)"
          />
          <span v-if="safeGet(asset, 'terms.name') || token_terms.name" class="asset-manager__file-name">

            {{ safeGet(asset, 'terms.name') || token_terms.name }}
          </span>
          <span v-else-if="termsUrl" class="asset-manager__file-name">
            <a :href="termsUrl" target="_blank" rel="noopener">{{ safeGet(asset, 'details.terms.name') }}</a>
          </span>
          <!--<span v-else-if="safeGet(asset, 'terms..')"></span>-->
        </div>
      </div>

      <div class="app__form-row">
        <tick-field class="app__form-field"
          v-model="asset.policy"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.transferable]"
          :cb-value="ASSET_POLICIES.transferable"
          :disabled="isPending"
        />
      </div>

      <div class="app__form-row">
        <tick-field class="app__form-field"
          v-model="asset.policy"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.baseAsset]"
          :cb-value="ASSET_POLICIES.baseAsset"
          :disabled="isPending"
        />
      </div>

      <div class="app__form-row">
        <tick-field class="app__form-field"
          v-model="asset.policy"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.statsQuoteAsset]"
          :cb-value="ASSET_POLICIES.statsQuoteAsset"
          :disabled="isPending"
        />
      </div>

      <div class="app__form-row">
        <tick-field class="app__form-field"
          v-model="asset.policy"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.withdrawable]"
          :cb-value="ASSET_POLICIES.withdrawable"
          :disabled="isPending"
        />
      </div>

      <div class="app__form-row">
        <tick-field class="app__form-field"
          v-model="asset.policy"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.twoStepWithdrawal]"
          title="Withdraw operations are done in two steps"
          :cb-value="ASSET_POLICIES.twoStepWithdrawal"
          :disabled="isPending"
        />
      </div>

      <div class="app__form-row">
        <tick-field class="app__form-field"
          v-model="asset.policy"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.requiresKyc]"
          title="Only users with KYC can submit/receive the asset"
          :cb-value="ASSET_POLICIES.requiresKyc"
          :disabled="isPending"
        />
      </div>

      <div class="app__form-row">
        <tick-field class="app__form-field"
          v-model="asset.policy"
          :label="ASSET_POLICIES_VERBOSE[ASSET_POLICIES.issuanceManualReviewRequired]"
          :cb-value="ASSET_POLICIES.issuanceManualReviewRequired"
          :disabled="isPending"
        />
      </div>

      <div class="asset-manager-advanced__block">
        <div class="asset-manager-advanced__heading">
          <h3>Advanced</h3>
          <button class="app__btn-secondary app__btn-secondary--iconed"
                  @click.prevent="isShownAdvanced = !isShownAdvanced">
            <mdi-chevron-up-icon   v-if="isShownAdvanced"/>
            <mdi-chevron-down-icon v-else/>
          </button>
        </div>
      </div>

      <template v-if="isShownAdvanced">
        <div class="app__form-row">
          <input-field class="app__form-field app__form-field--halved"
                       type="number"
                       label="External system type"
                       name="External system type"
                       v-model="asset.details.external_system_type"
                       :required="false"
                       :disabled="isPending"
                       v-validate="{max_value: int32}"
          />
        </div>
      </template>

      <div class="app__form-actions">
        <button class="app__btn" :disabled="isPending">
          {{ isExistingAsset ? 'Update asset' : 'Create asset' }}
        </button>
      </div>

    </form>

  </div>
</template>

<script>
import api from '@/api'
import safeGet from 'lodash/get'
import config from '../../../../config'

import { ImageField, TickField, InputField } from '@comcom/fields'
import { ASSET_POLICIES, DEFAULT_INPUT_STEP, DOCUMENT_TYPES, ASSET_POLICIES_VERBOSE } from '@/constants'
import { fileReader } from '../../../../utils/file-reader'

import 'mdi-vue/ChevronDownIcon'
import 'mdi-vue/ChevronUpIcon'

import { confirmAction } from '../../../../js/modals/confirmation_message'

export default {
  components: {
    InputField,
    TickField,
    ImageField
  },

  props: ['assetCode'],

  data () {
    return {
      ASSET_POLICIES,
      DEFAULT_INPUT_STEP,
      ASSET_POLICIES_VERBOSE,
      isShownAdvanced: false,

      asset: {
        policy: 0,
        initialPreissuedAmount: '0',
        details: {}
      },

      [DOCUMENT_TYPES.tokenTerms]: {
        file: null,
        mime: null,
        name: null
      },

      [DOCUMENT_TYPES.tokenLogo]: {
        file: null,
        mime: null,
        name: null
      },

      isPending: false,
      DOCUMENT_TYPES
    }
  },

  created () {
    if (this.isExistingAsset) {
      this.getAsset()
    }
  },

  computed: {
    isExistingAsset () {
      return !!this.assetCode
    },
    termsUrl () {
      if (safeGet(this.asset, 'details.terms.key')) {
        return `${config.STORAGE_SERVER}/${safeGet(this.asset, 'details.terms.key')}`
      }
      return ''
    }
  },

  methods: {
    safeGet,
    async getAsset () {
      try {
        this.asset = await api.assets.getAssetByCode(this.assetCode)
      } catch (error) {
        console.error(error)
        this.$store.dispatch('SET_ERROR', 'Receiving asset failed. Please try again later')
      }
    },

    async submit () {
      if (!await confirmAction()) return

      this.isPending = true
      try {
        await Promise.all([
          this.uploadFile(DOCUMENT_TYPES.tokenTerms),
          this.uploadFile(DOCUMENT_TYPES.tokenLogo)
        ])
        if (this.isExistingAsset) {
          await api.assetCreation.updateAsset(this.asset)
        } else {
          await api.assetCreation.createAsset(this.asset)
        }
        this.$store.dispatch('SET_INFO', 'Submitted successfully.')
        this.$router.push({ name: 'systemAssets.index' })
      } catch (error) {
        error.showMessage()
      }
      this.isPending = false
    },

    async onFileChange (event, type) {
      console.log(type)
      const file = fileReader.deriveFileFromChangeEvent(event)
      this[type].file = file
      this[type].mime = file.type
      this[type].name = file.name
    },

    async uploadFile (type) {
      if (!this[type].file) return
      const config = (await api.users
        .docsOf(this.$store.getters.masterId)
        .getUploadConfig(type, this[type].mime))
        .data
      await api.documents.uploadFile(this[type].file, config, this[type].mime)
      this.asset.details[type === DOCUMENT_TYPES.tokenTerms ? 'terms' : 'logo'] = {
        key: config.key,
        name: this[type].name,
        type: this[type].mime
      }
      console.log('this.asset:')
      console.log(this.asset)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors";
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
  margin-bottom: .5rem;
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
