<template>
    <div class="image-view-row" :class="{'reject-reason--parent': wantReject}">

        <div class="reason" v-if="value && !wantReject">
          <i class="fa fa-exclamation"></i>
          Rejected: {{ value }}
        </div>

        <div class="thumb-block">
            <div class="thumb"  @click="showModal" v-if="this.content_type">
                <span class="fa fa-file-image-o fa-3x" v-if="isImage"></span>
                <span class="fa fa-file-pdf-o fa-3x" v-else></span>
                <span class="tooltip">Show File</span>
            </div>
            <div class="thumb no-doc" v-else>
                <span class="fa fa-file fa-3x"></span>
                <span class="tooltip">No Document</span>
            </div>
            <div class="title">
                <p>{{title}}</p>
            </div>
        </div>

        <div v-if="wantReject" class="info-block__row-item reject-reason">
            <input :id="name" type="text" :value="value" @input="onInput" class="info-block__input">
        </div>



      <!-- Modal view -->
        <div :id="name" class="document-modal-vew" @click="hideModal"
             :style="`display:${displayModal ? 'flex': 'none'}`">
            <div class="modal-content-header flex-row flex-row--justify-end ">
                <div class="close-btn" @click="hideModal">
                    <p> &times;</p>
                </div>
            </div>

            <div class="modal-content-box">

                <div v-show="fileData && isImage" class="image-container">
                    <img :src="fileData" :style="imageTransform">
                </div>

                <div v-if="fileData && !isImage" class="pdf-container">
                    <embed :id="`${name}-embed`" type="application/pdf" :src="fileData" width="100%" height="100%" title>
                </div>
                <div v-if="loading" class="spinner">
                    <span class="fa fa-spinner fa-pulse fa-5x"></span>
                </div>
            </div>

            <div class="modal-content-footer flex-row">
                <div class="title-row">
                    <p>{{title}}</p>
                    <p class="subtitle" v-if="subtitle"> {{ subtitle }}</p>
                </div>
                <div class="expand-btn" @click="openInNewTab()">
                    <span class="fa fa-expand"></span>
                </div>
            </div>
        </div>
        <!--/ Modal view -->
    </div>
</template>

<script>
import Vue from 'vue'
import jpgUtils from '../../utils/jpg-utils'
import store from '../../store'
import config from '../../config'

export default {
  name: 'image-view',
  props: {
    'type': {
      type: Number
    },
    'name': {
      type: String,
      default: ''
    },
    'title': {
      type: String,
      default: ''
    },
    'subtitle': {
      type: String
    },
    'accountId': {
      type: String,
      default: ''
    },
    'wantReject': {
      type: Boolean,
      default: false
    },
    'value': {
      type: String,
      default: ''
    },
    'docKey': {
      type: String,
      default: ''
    },
    'content_type': {
      type: String,
      default: ''
    },
    version: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      loading: false,
      displayModal: false,
      fileData: '',
      fileUrl: '',
      imageTransform: '',
      loadCanceled: false
    }
  },

  computed: {
    isImage () {
      return this.content_type.indexOf('image') >= 0
    }
  },

  methods: {
    getJWK (documentKey) {
      const server = store.getters.server

      const keypair = store.getters.keypair
      const accountId = this.accountId

      const prefix = `/users/${accountId}/keys/${documentKey}`
      const reqConfig = server._getConfig(prefix, keypair)

      return Vue.http.get(config.HORIZON_SERVER + prefix, reqConfig)
        .then(response => {
          const jwk = response.data
          return jwk
        })
    },

    _base64ToArrayBuffer (base64) {
      const binaryString = window.atob(base64)
      const len = binaryString.length
      const bytes = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      return bytes.buffer
    },

    decryptFile (file, docKey) {
      if (window.crypto && window.crypto.subtle) {
        return this.getJWK(docKey)
          .then(jwk => {
            return window.crypto.subtle.importKey('jwk', {
              kty: 'oct',
              k: jwk.k,
              alg: 'A256GCM',
              ext: true
            }, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
              .then(key =>
                window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(12), tagLength: 128 }, key, file)
              )
          })
          .catch(err => {
            if (err.status === 404) {
              return file
            }
          })
      } else {
        return this.getJWK(docKey)
          .then(jwk => {
            return window.polyCrypto.subtle.importKey('jwk', {
              kty: 'oct',
              k: jwk.k,
              alg: 'A256GCM',
              ext: true
            }, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
              .then(key =>
                window.polyCrypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(12), tagLength: 128 }, key, file)
              )
          })
      }
    },

    onInput (event) {
      this.$emit('input', event.target.value)
    },

    openInNewTab () {
      const string = this.fileData || this.fileUrl // doc.output('datauristring');
      const iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>"
      const x = window.open()
      x.document.open()
      x.document.write(iframe)
      x.document.close()
      // const win = window.open(this.fileData || this.fileUrl, this.title)
      // win.focus()
    },

    hideModal () {
      this.displayModal = false

      if (this.loading) {
        this.loadCanceled = true
        this.loading = false
      }
      this.$store.commit('CLOSE_MODAL')
    },

    showModal () {
      if (!this.type) return
      this.displayModal = true
      this.$store.commit('OPEN_MODAL')
      if (!this.fileData) {
        this.loadCanceled = false
        return this.getFileUrl()
      }
    },

    getFileUrl () {
      this.loading = true
      // TODO: check if this works correctly
      const version = this.version

      return Vue.api.users.getDocumentUrl(this.accountId, version)
        .then(url => {
          if (!this.isImage) {
            this.fileUrl = url
            return this.loadPdf()
          }
          this.fileUrl = url
          return this.loadImage()
        }).catch(err => {
          console.error(err)
          this.loading = false
          this.hideModal()
        })
    },

    loadImage () {
      return Vue.http.get(this.fileUrl, { responseType: 'blob' })
        .then(response => {
          const encryptedBlob = response.body
          let encryptedAB
          const reader = new FileReader()

          reader.onload = (e) => {
            encryptedAB = e.target.result

            return this.decryptFile(encryptedAB, this.docKey)
              .then(decrypted => {
                const blob = new Blob([decrypted], { type: this.content_type })
                const reader = new FileReader()

                reader.onload = (e) => {
                  this.fileUrl = e.target.result
                  const props = jpgUtils.getImageWithOrientation(this.fileUrl, decrypted)

                  if (this.loadCanceled) return

                  const rotationStyle = jpgUtils.getRotationStyle(props.orientation)
                  this.fileData = props.urlEncodedImage
                  this.imageTransform = rotationStyle.transform
                  this.loading = false
                }

                reader.readAsDataURL(blob)
              })
          }
          reader.readAsArrayBuffer(encryptedBlob)
        })
    },

    loadPdf () {
      return Vue.http.get(this.fileUrl, { responseType: 'blob' })
        .then((response) => {
          const encryptedBlob = response.body
          let encryptedAB
          const reader = new FileReader()

          reader.onload = (e) => {
            encryptedAB = e.target.result

            return this.decryptFile(encryptedAB, this.docKey)
              .then(decrypted => {
                const blob = new Blob([decrypted], { type: 'application/pdf' })
                const reader = new FileReader()

                reader.onload = (e) => {
                  this.fileData = e.target.result
                  setTimeout(() => { this.loading = false }, 13000)
                }
                reader.readAsDataURL(blob)
              })
          }

          reader.readAsArrayBuffer(encryptedBlob)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
$brand-red: #cc6666;
$brand-violet-lighten: #9e8291;

.image-view-row {
  .reject-reason--parent {
    margin-bottom: 30px;
  }
  .reject-reason {
    top: 100%;
  }
}

.thumb-block {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  margin: 5px 0 15px;

  .title {
    margin-left: 15px;
    color: $brand-violet-lighten;
    font-size: 18px;
  }
}

.thumb {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  cursor: pointer;
  position: relative;

  .no-doc {
    cursor: default;
  }

  .tooltip {
    visibility: hidden;
    width: 80px;
    background-color: hsl(23, 33%, 92%);
    border: solid 1px;
    color: #85898f;
    text-align: center;
    border-radius: 6px;
    padding: 2px 0;
    position: absolute;
    z-index: 1;
    top: 103%;
    left: 100%;
    margin-left: -60px;
    font-size: 13px;
  }
  &:hover {
    color: #aaaaaa;
    .tooltip {
      visibility: visible;
      transition: visibility 0s linear 0.3s;
    }
  }
}

.document-modal-vew {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 800;
  width: 100vw;
  height: 100vh;
  border-radius: 6px;
}

.modal-content-header {
  font-size: 36px;
  color: #dddddd;
  .close-btn {
    display: block;
    margin: 5px 15px 5px 5px;
    cursor: pointer;
    border-radius: 9px;
    width: 35px;
    height: 35px;
    text-align: center;
    padding-bottom: 1px;
    vertical-align: middle;
    font-size: 50px;
  }
  .close-btn:hover {
    color: #ffffff;
  }
}

.modal-content-footer {
  color: #dddddd;
  justify-content: space-between;
  width: 100%;
  padding: 0 25px;
  align-items: center;
  margin-bottom: 10px;
  .title-row {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: auto;
    font-size: 24px;
    padding: 5px 20px;
    border-radius: 6px;
    margin-top: 5px;
  }
  .subtitle {
    font-size: 18px;
  }
  .expand-btn {
    font-size: 35px;
    margin-right: 20px;
    padding: 5px;
    cursor: pointer;
  }
  .expand-btn:hover {
    color: #ffffff;
  }
}

.pdf-container {
  max-width: 90%;
  max-height: 90vh;
  min-height: 90vh;
  margin: auto;
  /*padding: 10px 25px;*/
  border-radius: 6px;
  embed {
    border-radius: 3px;
    border: 0;
    box-sizing: border-box;
    opacity: 1;
    padding: 0 9pt;
    height: 85vh;
  }
}

.image-container {
  margin: auto;
  display: flex;
  width: auto;
  max-width: 100%;
  max-height: 90vh;
  border-radius: 6px;
  text-align: center;
  align-items: center;
  justify-content: space-between;
  img {
    border-radius: 6px;
    margin: auto;
    width: auto;
    max-width: 90%;
    max-height: 75vh;
    display: block;
  }
}
.modal-content-box {
  position: relative;
}
.spinner {
  position: absolute;
}

.reason {
  margin-top: 10px;
  color: $brand-red;
  font-size: 12px;
}
</style>
