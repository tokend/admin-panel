import Vue from 'vue'

export default {
  uploadFile (file, config, mimeString) {
    const formData = new FormData()
    const url = config.url
    delete config.url
    delete config.id
    delete config.type
    config['x-amz-algorithm'] = config.xAmzAlgorithm
    config['x-amz-credential'] = config.xAmzCredential
    config['x-amz-date'] = config.xAmzDate
    config['x-amz-signature'] = config.xAmzSignature

    delete config.xAmzAlgorithm
    delete config.xAmzCredential
    delete config.xAmzDate
    delete config.xAmzSignature

    for (const key in config) {
      formData.append(key, config[key])
    }
    const blob = new Blob([file], { type: mimeString })
    formData.append('file', blob)
    return Vue.http.post(url, formData)
  }
}
