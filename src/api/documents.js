import Vue from 'vue'

export default {
  uploadFile (file, config, mimeString) {
    const formData = new FormData()
    formData.append('bucket', config.formData.bucket)
    formData.append('key', config.formData.key)
    formData.append('policy', config.formData.policy)
    formData.append('x-amz-algorithm', config.formData.x_amz_algorithm)
    formData.append('x-amz-credential', config.formData.x_amz_credential)
    formData.append('x-amz-date', config.formData.x_amz_date)
    formData.append('x-amz-signature', config.formData.x_amz_signature)

    const blob = new Blob([file], { type: mimeString })
    formData.append('file', blob)

    return Vue.http.post(config.url, formData)
  },
}
