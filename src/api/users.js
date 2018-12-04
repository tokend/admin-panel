import store from '../store'
import { Operation } from 'tokend-js-sdk'
import server from '../utils/server'
import { ServerCallBuilder } from './ServerCallBuilder'
import { clearObject } from '@/utils/clearObject'
import { Sdk } from '@/sdk'

const ScopedServerCallBuilder = ServerCallBuilder.makeScope()
  .registerResource('users')
  .registerResource('details')
  .registerResource('blobs')
  .registerResource('documents')

export default {
  // ---------- User state ----------
  /**
   * Fetch user list
   * @param {Object} filters
   * @param {Number} filters.type - User type (bitmask)
   * @param {Number} filters.state - User state (bitmask)
   * @return {Promise}
   */
  getAll (filters) {
    return Sdk.api.users.getPage(clearObject(filters))
  },

  get (id) {
    return Sdk.api.users.get(id)
  },

  getEmailsByAddresses (addresses) {
    return new ScopedServerCallBuilder()
      .details()
      .post({ addresses })
      .then((response) => ((response || {}).body || {}).users)
  },

  getAccountIdByEmail (email) {
    return Sdk.api.users.getPage({ email: email })
      .then((response) => {
        const resultArray = response.data.filter(item => item.email === email)
        return resultArray[0].id
      })
      .catch(e => '')
  },

  getEmailByAddress (address) {
    return this.getEmailsByAddresses([address])
      .then((response) => response[address].email)
  },

  createBalance (accountId, code) {
    const operation = Operation.manageBalance({
      asset: code,
      action: Sdk.xdr.ManageBalanceAction.createUnique(),
      destination: accountId
    })

    return server.submitOperation(operation)
  },

  /**
   * Operate over user blobs
   * @param {string} userId id of the owner
   * @returns {Object} object with the set of possible operations
   */
  blobsOf (userId) {
    return {
      _owner: userId,
      _blank: new ScopedServerCallBuilder().users(userId).blobs(),

      /**
       * Get blob by id
       * @param {string} blobId
       * @param {boolean} isSigned
       * @returns {Promise} A Promise with the response
       */
      get (blobId) {
        return Sdk.api.blobs.get(blobId, userId)
      },

      /**
       * Get blobs by filters
       * @param {Object} filters
       * @param {string} filters.type Type of the blob. Check BLOB_TYPES constant
       * @param {string} [filters.saleId]
       * @param {string} [filters.saleOwner]
       * @param {string} [filters.token]
       * @param {string} [filters.kycSequence]
       * @param {boolean} isSigned
       * @returns {Promise} A Promise with the response (array)
       */
      getAll (filters, isSigned) {
        const params = clearObject({
          type: filters.type,
          fund_id: filters.saleId,
          fund_owner: filters.saleOwner,
          token_code: filters.token,
          kyc_sequence: filters.kycSequence
        })
        return Sdk.api.blobs.getAll(params, userId)
      },

      /**
       * The same as getAll but returns the first entry of the array
       * Params are the same as for getAll
       * @returns {Promise} A Promise with the response (blob)
       */
      async getFirst (...args) {
        return (await this.getAll(...args)).data[0]
      }
    }
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
      /**
       * Get blob by id
       * @param {string} docId
       * @returns {Promise} A Promise with the response
       */
      get (docId, isSigned = false) {
        return this._blank.id(docId).sign().get()
      },

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

  getBalanceByAccountId (accountId, asset) {
    return server.sdkServer.users()
      .balance(accountId, asset).callWithSignature(store.getters.keypair)
      .then(response => {
        return response.records[0].balance_id
      })
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
