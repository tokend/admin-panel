import Vue from 'vue'
import { ServerCallBuilder } from './ServerCallBuilder'

const ScopedServerCallBuilder = ServerCallBuilder.makeScope()
  .registerResource('documents')

export default {
  getUploadConfig (type, contentType) {
    return new ScopedServerCallBuilder()
      .documents()
      .sign()
      .post({
        data: {
          type,
          attributes: {
            content_type: contentType
          }
        }
      })
  },

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
