import Vue from 'vue'

export default {
  uploadFile (file, config, mimeString) {
    const formData = new FormData()
    formData.append('bucket', config.bucket)
    formData.append('key', config.key)
    formData.append('policy', config.policy)
    formData.append('x-amz-algorithm', config.xAmzAlgorithm)
    formData.append('x-amz-credential', config.xAmzCredential)
    formData.append('x-amz-date', config.xAmzDate)
    formData.append('x-amz-signature', config.xAmzSignature)

    const blob = new Blob([file], { type: mimeString })
    formData.append('file', blob)

    return Vue.http.post(config.url, formData)
  },
}
