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

      <ul class="preissuance-form__list" v-if="this.issuances.length">
        <p>To upload:</p>

        <li v-for="(item, index) in this.issuances" :key="item.reference">
          {{index + 1}}. {{localize(item.amount)}} {{item.asset}}
        </li>
      </ul>

      <div class="preissuance-form__summary-actions" v-if="this.issuances.length">
        <button class="app__btn"
          @click="upload()"
          :disabled="uploadBtnDisable">
          Upload
        </button>
        <button class="app__btn-secondary" @click="issuances = []">
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
      assets: []
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

    isAssetDefined (assetCode) {
      return !!this.assets.filter(item => item.code === assetCode).length
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
        if (!this.isAssetDefined(assetCode)) {
          this.$store.dispatch('SET_ERROR', `Asset with code ${assetCode} does not exist in the system`)
          return
        }
      }

      this.issuances = this.issuances.concat(items)
    },

    upload () {
      this.uploadBtnDisable = true
      this.$store.commit('OPEN_LOADER')

      return api.emissions.uploadPreEmissions(this.issuances.map(item => item.xdr))
        .then(() => {
          this.$store.commit('CLOSE_LOADER')
          this.$store.dispatch('SET_INFO', 'Pending transaction submitted')
          this.uploadBtnDisable = false
          this.issuances = []
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
}

</style>
