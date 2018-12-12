import server from '../utils/server'
import { ServerCallBuilder } from './ServerCallBuilder'
import { Sdk } from '@/sdk'

const ScopedServerCallBuilder = ServerCallBuilder.makeScope()
  .registerResource('users')
  .registerResource('details')
  .registerResource('blobs')
  .registerResource('documents')

export default {
  getEmailsByAddresses (addresses) {
    return new ScopedServerCallBuilder()
      .details()
      .post({ addresses })
      .then((response) => ((response || {}).body || {}).users)
  },

  getEmailByAddress (address) {
    return this.getEmailsByAddresses([address])
      .then((response) => response[address].email)
  },

  async getAccountIdByEmail (email) {
    const response = await Sdk.api.users.getPage({ email: email })
    const resultArray = response.data.filter(item => item.email === email)
    return resultArray[0].id
  },
  /**
   * Operate over documents of a user
   * @param {string} userId id of the owner
   * @returns {Object} object with the set of possible operations
   */
  docsOf (userId) {
    return {
      _owner: userId,
      _blank: new ScopedServerCallBuilder().users(userId).documents(),
      getUploadConfig (type, contentType) {
        return this._blank
          .sign()
          .post({
            data: {
              type,
              attributes: {
                content_type: contentType
              }
            }
          })
      }
    }
  },

  // legacy

  getBlob ({ userId, blobId }) {
    return new ScopedServerCallBuilder()
      .users()
      .id(userId)
      .blobs()
      .id(blobId)
      .get()
  },

  getUserIdByEmail (email) {
    return server.get('/user_id', false, { email: email })
      .then(r => {
        return r.account_id
      })
  },

  // ---------- Verification documents ----------

  getDocumentUrl (accountId, type) {
    return server.get(`/users/${accountId}/documents/${type}`, true)
      .then(response => {
        return response.url
      }, err => {
        console.error(err)
      })
  }
}
