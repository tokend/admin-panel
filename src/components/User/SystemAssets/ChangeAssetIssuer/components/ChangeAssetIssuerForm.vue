<template>
  <div class="change-asset-issuer-form">
    <p class="change-asset-issuer-form__hint">
      Select file(s) with change issuer transaction and click <strong>Upload</strong>.<br/>
    </p>

    <div class="change-asset-issuer-form__upload-wrp">
      <template>
        <label class="change-asset-issuer-form__upload-btn app__btn app__btn--info"
               for="file-select">
          Select File(s)
        </label>
        <input class="change-asset-issuer-form__upload-input"
               id="file-select"
               ref="fileInput"
               type="file"
               accept=".tx"
               @change="onFileChange"
        />
      </template>
    </div>

    <div class="change-asset-issuer-form__details" v-if="asset && accountId">
      <p>Signer will change on asset: {{ asset }}</p>
      <p>New signer will be: {{ accountId }}</p>
      <p>Transaction source: {{ source }}</p>
    </div>

    <p class="note"><i>Note: </i>Transaction is valid for one week since the file was created</p>

    <div class="change-asset-issuer-form__summary-actions" v-if="asset && accountId">
      <button class="app__btn"
              @click="upload()"
              :disabled="uploadBtnDisable">
        Upload
      </button>
      <button class="app__btn-secondary" @click="clear">
        Clear
      </button>
    </div>
  </div>
</template>

<script>
  import { ServerCallBuilder } from '../../../../../api/ServerCallBuilder'
  import { Transaction } from 'tokend-js-sdk'

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
        } catch (error) {
          console.error(error)
          if (error.showMessage) {
            error.showMessage()
          } else {
            this.$store.dispatch('SET_ERROR', 'Failed to upload transaction')
          }
        }
        this.uploadBtnDisable = false
      },
      sendTx () {
        const transaction = new Transaction(this.transaction)
        transaction.sign(this.$store.getters.keypair)
        const envelope = transaction.toEnvelope().toXDR().toString('base64')

        const ScopedServerCallBuilder =
          ServerCallBuilder
            .makeScope()
            .registerResource('transactions')

        return new ScopedServerCallBuilder()
          .transactions()
          .sign()
          .post({ tx: envelope })
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

</style>
