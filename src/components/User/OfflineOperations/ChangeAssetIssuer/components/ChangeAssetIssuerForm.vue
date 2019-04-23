<template>
  <div class="change-asset-issuer-form">
    <p class="change-asset-issuer-form__hint">
      Select file(s) with change issuer transaction and click <strong>Upload</strong>.<br />
    </p>

    <div class="change-asset-issuer-form__upload-wrp">
      <template>
        <label
          class="change-asset-issuer-form__upload-btn app__btn app__btn--info"
          for="file-select"
        >
          Select File(s)
        </label>
        <input
          class="change-asset-issuer-form__upload-input"
          id="file-select"
          ref="fileInput"
          type="file"
          accept=".tx"
          @change="onFileChange"
        />
      </template>
    </div>

    <div
      class="change-asset-issuer-form__details"
      v-if="asset && accountId"
    >
      <p class="text">Signer will change on asset: {{ asset }}</p>
      <p class="text">New signer will be: {{ accountId }}</p>
      <p class="text">Transaction source: {{ source }}</p>
    </div>

    <p class="change-asset-issuer-form__expiration-date-note text">
      <i>Note: </i>Transaction is valid for one week since the file was created
    </p>

    <div
      class="change-asset-issuer-form__summary-actions"
      v-if="asset && accountId"
    >
      <button
        class="app__btn"
        @click="upload()"
        :disabled="uploadBtnDisable"
      >
        Upload
      </button>
      <button
        class="app__btn-secondary"
        @click="clear"
      >
        Clear
      </button>
    </div>
  </div>
</template>

<script>
import { Sdk } from '@/sdk'
import { ErrorHandler } from '@/utils/ErrorHandler'

export default {
  data () {
    return {
      accountId: '',
      asset: '',
      transaction: '',
      source: '',
      uploadBtnDisable: false
    }
  },
  methods: {
    async onFileChange (event) {
      const files = event.target.files || event.dataTransfer.files
      if (!files.length) return
      const extracted = await this.readFile(files[0])
      const fileData = JSON.parse(extracted)
      this.accountId = fileData.accountId
      this.asset = fileData.asset
      this.transaction = fileData.transaction
      this.source = fileData.source
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
        this.$store.dispatch('SET_INFO', 'Submitted successfully')
      } catch (error) {
        ErrorHandler.process(error)
      }
      this.uploadBtnDisable = false
    },
    async sendTx () {
      const transaction = new Sdk.base.Transaction(this.transaction)
      transaction.sign(this.$store.getters.keypair)
      return await Sdk.horizon.transactions.submit(transaction)
    }
  }
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
</style>
