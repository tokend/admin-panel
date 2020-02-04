<template>
  <div class="change-asset-issuer-form">
    <!--eslint-disable -->
    <p 
      class="change-asset-issuer-form__hint"
      v-html="$options.filters.globalize('change-asset-issuer-form.select-lile-and-click-upload')"
    />
    <!--eslint-enable -->

    <div class="change-asset-issuer-form__upload-wrp">
      <template>
        <label
          class="change-asset-issuer-form__upload-btn app__btn app__btn--info"
          for="file-select"
        >
          {{ "change-asset-issuer-form.label-select-file" | globalize }}
        </label>
        <input
          class="change-asset-issuer-form__upload-input"
          id="file-select"
          ref="fileInput"
          type="file"
          accept=".tx"
          @change="onFileChange"
        >
      </template>
    </div>

    <div
      class="change-asset-issuer-form__details"
      v-if="asset && accountId"
    >
      <p class="text">
        {{ "change-asset-issuer-form.signer-change-asset" | globalize({
          asset: asset
        })
        }}
      </p>
      <p class="text">
        {{ "change-asset-issuer-form.new-signer" | globalize({
          accId: accountId
        })
        }}
      </p>
      <p class="text">
        {{ "change-asset-issuer-form.transaction-source" | globalize({
          source: source
        })
        }}
      </p>
    </div>
    <!-- eslint-disable -->
    <p 
      class="change-asset-issuer-form__expiration-date-note text"
      v-html="$options.filters.globalize('change-asset-issuer-form.note-transaction')"  
    />
    <!-- eslint-enable -->
    <a
      class="change-asset-issuer-form__link"
      :href="preissuanceGuideURL"
      target="_blank"
      rel="noopener"
    >
      {{ "change-asset-issuer-form.more-about-pre-issuance" | globalize }}
    </a>
    <div
      class="change-asset-issuer-form__summary-actions"
      v-if="asset && accountId"
    >
      <button
        class="app__btn"
        @click="upload()"
        :disabled="uploadBtnDisable"
      >
        {{ "change-asset-issuer-form.btn-upload" | globalize }}
      </button>
      <button
        class="app__btn-secondary"
        @click="clear"
      >
        {{ "change-asset-issuer-form.btn-clear" | globalize }}
      </button>
    </div>
  </div>
</template>

<script>
import { base } from '@tokend/js-sdk'
import { ErrorHandler } from '@/utils/ErrorHandler'
import { api } from '@/api'
import { Bus } from '@/utils/bus'
import config from '@/config'

export default {
  data () {
    return {
      accountId: '',
      asset: '',
      transaction: '',
      source: '',
      uploadBtnDisable: false,
    }
  },

  computed: {
    preissuanceGuideURL () {
      return config.WEB_CLIENT_URL + '/pre-issuance-guide'
    },
  },

  methods: {
    async onFileChange (event) {
      const files = event.target.files || event.dataTransfer.files
      if (!files.length) return

      try {
        const extracted = await this.readFile(files[0])
        const fileData = JSON.parse(extracted)
        this.accountId = fileData.accountId
        this.asset = fileData.asset
        this.transaction = fileData.transaction
        this.source = fileData.source
      } catch (e) {
        ErrorHandler.process(e, 'change-asset-issuer-form.your-file-is-corrupted')
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

    clear () {
      this.accountId = ''
      this.asset = ''
      this.transaction = ''
      this.source = ''
      const input = this.$refs.fileInput
      if (input) {
        input.value = ''
      }
    },

    async upload () {
      this.uploadBtnDisable = true
      try {
        await this.sendTx()
        this.clear()
        Bus.success('change-asset-issuer-form.submitted-successfully')
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.uploadBtnDisable = false
    },

    async sendTx () {
      const transaction = new base.Transaction(this.transaction)
      transaction.sign(this.$store.getters.keypair)

      const envelopeTx = this.getEnvelopeTx(transaction)
      await api.postTxEnvelope(envelopeTx)
    },

    getEnvelopeTx (tx) {
      return tx.toEnvelope().toXDR().toString('base64')
    },
  },
}
</script>

<style lang="scss" scoped>
.change-asset-issuer-form__upload-btn.app__btn {
  display: block;
  cursor: pointer;
  max-width: 10rem;
  &:hover {
    opacity: 0.9;
  }
}

.change-asset-issuer-form__upload-input {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

.change-asset-issuer-form__upload-wrp {
  position: relative;
  display: flex;
  align-items: center;
}

.change-asset-issuer-form__summary-actions {
  max-width: 20rem;
  display: flex;
  margin-top: 4.5rem;
}

.change-asset-issuer-form__hint {
  margin-bottom: 2rem;
}

.change-asset-issuer-form__details {
  margin-top: 2rem;
}

.change-asset-issuer-form__expiration-date-note {
  margin-top: 1rem;
}

.change-asset-issuer-form__link {
  font-size: 1.4rem;
}
</style>
