<template>
  <div class="preissuance-form">
    <p class="preissuance-form__hint">
      Select file(s) with preissued asset and click <strong>Upload</strong>.<br/>
      <em>Note:</em> you cannot upload the same preissuance twice
    </p>

    <div class="preissuance-form__upload-wrp">
      <template v-if="assets.length">
        <label class="preissuance-form__upload-btn app__btn app__btn--info"
               for="file-select">
          Select File(s)
        </label>
        <input class="preissuance-form__upload-input"
               id="file-select"
               type="file"
               accept=".iss"
               @change="onFileChange"
               multiple
        />
      </template>

      <template v-else>
        <p>
          Loading...
          <!-- TODO: better loading feedback -->
        </p>
      </template>
    </div>
    <ul class="app-list preissuance-form__list" v-if="fileInfo.length">
      <div class="app-list__header">
        <span class="app-list__cell preissuance-form__id--max-width">ID</span>
        <span class="app-list__cell">File name</span>
        <span class="app-list__cell">Value</span>
        <span class="app-list__cell">Preissuance Asset Signer</span>
        <span class="app-list__cell">Signatures</span>

      </div>
      <li v-for="(item, index) in fileInfo" :key="item.fileName" class="preissuance-form__li">
        <span class="app-list__cell preissuance-form__id--max-width" :title="index + 1">{{index + 1}}.</span>
        <span class="app-list__cell" :title="item.fileName">{{item.fileName}}</span>
        <span class="app-list__cell"
              :title="`${localize(item.issuance.amount)} ${item.issuance.asset}`">
            {{localize(item.issuance.amount)}} {{item.issuance.asset}}
          </span>
        <span class="app-list__cell" :title="item.preissuedAssetSigner">{{item.preissuedAssetSigner}}</span>
        <span class="app-list__cell" :title="1">1</span>
      </li>
    </ul>
    <template v-if="notLoadedFiles.length">
      <div class="preissuance-form__not-downloaded">
        <h4>NOT loaded files:</h4>
        <div v-for="(item, index) in notLoadedFiles" :key="item.fileName">{{index + 1}}. {{item.fileName}} - {{item.msg}}</div>
      </div>
    </template>

    <div class="preissuance-form__summary-actions" v-if="fileInfo.length">
      <button class="app__btn"
              @click="upload()"
              :disabled="uploadBtnDisable">
        Upload
      </button>
      <button class="app__btn-secondary" @click="fileInfo = []">
        Clear
      </button>
    </div>
  </div>
</template>

<script>
  import api from '@/api'
  import { PreIssuanceRequest, xdr } from 'tokend-js-sdk'
  import errors from '@/errors'

  import localize from '@/utils/localize'

  export default {
    data () {
      return {
        uploadBtnDisable: false,
        issuances: [],
        assets: [],
        fileInfo: [],
        temporaryFileName: null,
        notLoadedFiles: []
      }
    },

    created () {
      this.getAssets()
    },

    methods: {
      localize,

      async getAssets () {
        this.$store.commit('OPEN_LOADER')

        try {
          this.assets = await api.assets.getSystemAssets()
        } catch (error) {
          this.$store.dispatch('SET_ERROR', 'Cannot load asset list. Please reload the page')
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
          this.parsePreIssuances(JSON.parse(extracted).issuances)
        }
      },

      readFile (file) {
        return new Promise(function (resolve) {
          const reader = new FileReader()

          reader.onload = function (event) {
            resolve(event.target.result)
          }

          reader.readAsText(file)
        })
      },

      getAsset (assetCode) {
        return this.assets.filter(item => item.code === assetCode)[0]
      },

      parsePreIssuances (issuances) {
        const items = issuances
          .map(function (item) {
            const _xdr = xdr.PreIssuanceRequest.fromXDR(item.preEmission, 'hex')
            const result = PreIssuanceRequest.dataFromXdr(_xdr)

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
            this.$store.dispatch('SET_ERROR', `Asset with code ${assetCode} does not exist in the system`)
            this.notLoadedFiles.push({
              fileName: this.temporaryFileName,
              msg: `Asset with code ${assetCode} does not exist in the system`
            })
          } else {
            this.fileInfo.push({
              fileName: this.temporaryFileName,
              preissuedAssetSigner: asset.preissued_asset_signer,
              issuance: items[i]
            })
          }
        }
      },

      upload () {
        this.uploadBtnDisable = true
        this.$store.commit('OPEN_LOADER')

        return api.emissions.uploadPreEmissions(this.fileInfo.map(item => item.issuance.xdr))
          .then(() => {
            this.$store.commit('CLOSE_LOADER')
            this.$store.dispatch('SET_INFO', 'Pending transaction submitted')
            this.uploadBtnDisable = false
          }).catch(err => {
            const message = errors.tryParseError(err) || 'Something went wrong. Transaction failed'
            this.$store.dispatch('SET_ERROR', message)
            this.$store.commit('CLOSE_LOADER')
            console.error('not uploaded', err)
            this.uploadBtnDisable = false
          })
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../../../../assets/scss/colors";

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

  .preissuance-form__hint {
    margin-bottom: 2rem;
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
