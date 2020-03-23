<template>
  <div class="preissuance-form">
    <div class="preissuance-form__header">
      <!-- eslint-disable -->
      <p 
        class="preissuance-form__hint"
        v-html="$options.filters.globalize('preissuance-form.select-file-and-upload')"
      />
      <!-- eslint-enable -->
      <a
        class="preissuance-form__link"
        :href="preissuanceGuideURL"
        target="_blank"
        rel="noopener"
      >
        <p class="preissuance-form__link-content">
          {{ "preissuance-form.learn-more-about-pre-issuance" | globalize }}
          <i class="mdi mdi-open-in-new preissuance-form__link-icon" />
        </p>
      </a>
    </div>

    <div class="preissuance-form__upload-wrp">
      <template v-if="assets.length">
        <label
          class="preissuance-form__upload-btn app__btn app__btn--info"
          for="file-select">
          {{ "preissuance-form.select-files" | globalize }}
        </label>
        <input
          class="preissuance-form__upload-input"
          id="file-select"
          type="file"
          accept=".iss"
          @change="onFileChange"
          multiple
        >
      </template>

      <template v-else>
        <p>
          {{ "preissuance-form.loading" | globalize }}
          <!-- TODO: better loading feedback -->
        </p>
      </template>
    </div>
    <ul class="app-list preissuance-form__list" v-if="fileInfo.length">
      <div class="app-list__header">
        <span class="app-list__cell preissuance-form__id--max-width">
          {{ "preissuance-form.id" | globalize }}
        </span>
        <span class="app-list__cell">
          {{ "preissuance-form.file-name" | globalize }}
        </span>
        <span class="app-list__cell">
          {{ "preissuance-form.value" | globalize }}
        </span>
        <span class="app-list__cell">
          {{ "preissuance-form.preissuance-asset-signer" | globalize }}
        </span>
        <span class="app-list__cell">
          {{ "preissuance-form.signatures" | globalize }}
        </span>
      </div>
      <li
        v-for="(item, index) in fileInfo"
        :key="item.fileName"
        class="preissuance-form__li"
      >
        <span
          class="app-list__cell preissuance-form__id--max-width"
          :title="index + 1"
        >
          {{ index + 1 }}.
        </span>
        <span
          class="app-list__cell"
          :title="item.fileName"
        >
          {{ item.fileName }}
        </span>
        <span
          class="app-list__cell"
          :title="`${localize(item.issuance.amount)} ${item.issuance.asset}`"
        >
          {{ localize(item.issuance.amount) }} {{ item.issuance.asset }}
        </span>
        <span
          class="app-list__cell"
          :title="item.preIssuanceAssetSigner"
        >
          {{ item.preIssuanceAssetSigner | cropAddress }}
        </span>
        <span class="app-list__cell" :title="1">
          1
        </span>
      </li>
    </ul>
    <template v-if="notLoadedFiles.length">
      <div class="preissuance-form__not-downloaded">
        <h4>{{ "preissuance-form.not-loaded-files" | globalize }}</h4>
        <div
          v-for="(item, index) in notLoadedFiles"
          :key="item.fileName"
        >
          {{ index + 1 }}. {{ item.fileName }} - {{ item.msg }}
        </div>
      </div>
    </template>

    <div class="preissuance-form__summary-actions" v-if="fileInfo.length">
      <button
        class="app__btn"
        @click="upload"
        :disabled="uploadBtnDisable"
      >
        {{ "preissuance-form.btn-upload" | globalize }}
      </button>
      <button class="app__btn-secondary" @click="fileInfo = []">
        {{ "preissuance-form.btn-clear" | globalize }}
      </button>
    </div>
  </div>
</template>

<script>
import { base } from '@tokend/js-sdk'
import config from '@/config'
import { globalize } from '@/components/App/filters/filters'
import localize from '@/utils/localize'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { api, loadingDataViaLoop } from '@/api'
import { Bus } from '@/utils/bus'

export default {
  data () {
    return {
      uploadBtnDisable: false,
      issuances: [],
      assets: [],
      fileInfo: [],
      temporaryFileName: null,
      notLoadedFiles: [],
    }
  },

  computed: {
    preissuanceGuideURL () {
      return config.WEB_CLIENT_URL + '/pre-issuance-guide'
    },
  },

  created () {
    this.getAssets()
  },
  methods: {
    localize,

    async getAssets () {
      this.$store.commit('OPEN_LOADER')
      try {
        let response = await api.getWithSignature('/v3/assets', {
          filter: {
            owner: config.MASTER_ACCOUNT,
          },
        })
        let assets = await loadingDataViaLoop(response)
        this.assets = assets
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
      this.$store.commit('CLOSE_LOADER')
    },

    async onFileChange (event) {
      const files = event.target.files || event.dataTransfer.files
      if (!files.length) return

      // Note: files is a FileList object. not mappable
      for (let i = 0; i < files.length; i++) {
        const extracted = await this.readFile(files[i])
        this.temporaryFileName = files[i].name

        try {
          this.parsePreIssuances(JSON.parse(extracted).issuances)
        } catch (e) {
          ErrorHandler.process(e, 'preissuance-form.your-file-is-corrupted')
          return
        }
      }
    },
    readFile (file) {
      // eslint-disable-next-line promise/avoid-new
      return new Promise(function (resolve) {
        const reader = new FileReader()

        reader.onload = function (event) {
          resolve(event.target.result)
        }
        reader.readAsText(file)
      })
    },

    getAsset (assetCode) {
      return this.assets.filter(item => item.id === assetCode)[0]
    },

    parsePreIssuances (issuances) {
      const items = issuances
        .map(function (item) {
          const _xdr = base.xdr.PreIssuanceRequest.fromXDR(item.preEmission, 'hex')
          const result = base.PreIssuanceRequest.dataFromXdr(_xdr)

          result.xdr = _xdr
          result.isUsed = item.used
          return result
        }).filter(item => {
          return !this.issuances.find(el => el.reference === item.reference)
        })

      for (let i = 0; i < items.length; i++) {
        const assetCode = items[i].asset
        const asset = this.getAsset(assetCode)
        if (!asset) {
          ErrorHandler.process(new Error(
            globalize('preissuance-form.asset-not-found',
              { assetCode: assetCode }
            )
          ))
          this.notLoadedFiles.push({
            fileName: this.temporaryFileName,
            msg: globalize('preissuance-form.msg-asset-not-found',
              { assetCode: assetCode }
            ),
          })
        } else {
          this.fileInfo.push({
            fileName: this.temporaryFileName,
            preIssuanceAssetSigner: asset.preIssuanceAssetSigner,
            issuance: items[i],
          })
        }
      }
    },

    async upload () {
      this.uploadBtnDisable = true
      this.$store.commit('OPEN_LOADER')
      try {
        const preIssuances = this.fileInfo.map(item => item.issuance.xdr)
        const operations = preIssuances.map(item => {
          return base.PreIssuanceRequestOpBuilder
            .createPreIssuanceRequestOp({ request: item })
        })
        await api.postOperations(...operations)
        this.fileInfo = []
        Bus.success('preissuance-form.submitted-successfully')
      } catch (error) {
        ErrorHandler.process(error, 'preissuance-form.exceeded-max-preissuance')
      }
      this.$store.commit('CLOSE_LOADER')
      this.uploadBtnDisable = false
    },
  },
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors";

$paddind-in-tab: 4rem;
$width-without-indentation: calc(100% + 2 * #{$paddind-in-tab});

.preissuance-form__upload-btn.app__btn {
  display: block;
  cursor: pointer;
  max-width: 10rem;
  &:hover {
    opacity: 0.9;
  }
}

.preissuance-form__upload-input {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

.preissuance-form__upload-wrp {
  position: relative;
  display: flex;
  align-items: center;
}

.preissuance-form__summary-actions {
  max-width: 20rem;
  display: flex;
  margin-top: 4.5rem;
}

.preissuance-form__header {
  margin-bottom: 2rem;
}

.preissuance-form__link-content {
  margin-top: 0.6rem;
  font-size: 1.4rem;
}

.preissuance-form__link-icon {
  font-size: 1.2rem;
  color: $color-info;
  vertical-align: middle;
  margin-left: 0.2rem;
}

.preissuance-form__list {
  margin-top: 2rem;
  width: $width-without-indentation;
  margin-right: -$paddind-in-tab;
  margin-left: -$paddind-in-tab;
}

.preissuance-form__li {
  width: 100%;
  display: flex;
  justify-content: space-between;
  text-decoration: none;
  color: inherit;
}

.preissuance-form__id--max-width {
  max-width: 75px;
  padding-left: 4.5rem !important;
}

.preissuance-form__not-downloaded {
  color: $color-danger;
  margin-top: 2rem;
  font-size: 1.6rem;
}
</style>
