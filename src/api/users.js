import store from '../store'
import { Operation, xdr } from 'tokend-js-sdk'
import server from '../utils/server'
import { ServerCallBuilder } from './ServerCallBuilder'
import { USER_TYPES } from '@/constants'
import { clearObject } from '@/utils/clearObject'
import { jsonApiPayloadCombiner } from './helpers/jsonApiPayloadCombiner'

const ScopedServerCallBuilder = ServerCallBuilder.makeScope()
  .registerResource('users')
  .registerResource('details')
  .registerResource('blobs')
  .registerResource('documents')

export default {
  deleteUnconfirmedWallet (username) {
    return server.sdkServer.deleteWallet(username, store.getters.keypair)
  },

  resendVerificationToken (username) {
    return server.sdkServer.resendToken(username, store.getters.keypair)
  },

  // ---------- User state ----------

  getUnverified () {
    return new ScopedServerCallBuilder()
      .users()
      .sign()
      .get({ type: USER_TYPES.notVerified })
  },

  /**
   * Fetch user list
   * @param {Object} filters
   * @param {Number} filters.type - User type (bitmask)
   * @param {Number} filters.state - User state (bitmask)
   * @return {Promise}
   */
  getAll (filters) {
    return new ScopedServerCallBuilder()
      .users()
      .sign()
      .get(clearObject(filters))
  },

  get (id) {
    return new ScopedServerCallBuilder()
      .users()
      .id(id)
      .sign()
      .get()
  },

  getEmailsByAddresses (addresses) {
    return new ScopedServerCallBuilder()
      .details()
      .post({ addresses })
      .then((response) => ((response || {}).body || {}).users)
  },

  getAccountIdByEmail (email) {
    return new ScopedServerCallBuilder()
      .users()
      .sign()
      .get({ email: email })
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

  rejectUserRequest ({ userId, reason }) {
    const payload = jsonApiPayloadCombiner({
      attributes: {
        state: 'rejected',
        reject_reason: reason || ''
      }
    })

    return new ScopedServerCallBuilder()
      .users(userId)
      .sign()
      .patch(payload)
  },

  createAccount ({ id, type, recoveryAddress }) {
    const payload = jsonApiPayloadCombiner({
      attributes: { state: 'approved' },
      operations: [
        Operation.createAccount({
          destination: id,
          accountType: xdr.AccountType[type]().value,
          recoveryKey: recoveryAddress
        })
      ]
    })

    return new ScopedServerCallBuilder()
      .users(id)
      .sign()
      .patch(payload)
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
      get (blobId, isSigned = false) {
        if (isSigned) {
          return this._blank.id(blobId).sign().get()
        } else {
          return this._blank.id(blobId).get()
        }
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

        if (isSigned) {
          return this._blank.sign().get(params)
        } else {
          return this._blank.get(params)
        }
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

  getApproved () {
    return server.sdkServer.users().approved().limit(store.getters.pageLimit).callWithSignature(store.getters.keypair)
  },

  getDisabled () {
    return server.sdkServer.users().disabled().limit(store.getters.pageLimit).callWithSignature(store.getters.keypair)
  },

  getBalanceByAccountId (accountId, asset) {
    return server.sdkServer.users()
      .balance(accountId, asset).callWithSignature(store.getters.keypair)
      .then(response => {
        return response.records[0].balance_id
      })
  },

  getUnapproved () {
    return server.sdkServer.users().regRequests().limit(store.getters.pageLimit).callWithSignature(store.getters.keypair)
  },

  getUserById (accountId) {
    return server.sdkServer.users().accountId(accountId).callWithSignature(store.getters.keypair)
  },

  getUsersByStatus (status) {
    return server.sdkServer.users().status(status).limit(store.getters.pageLimit).callWithSignature(store.getters.keypair)
  },

  getUserInfoById (accountId) {
    return server.sdkServer.users().accountId(accountId).callWithSignature(store.getters.keypair)
      .then(u => {
        const email = u.email
        const userType = u.user_type
        let username = ''

        switch (u.user_type) {
          case 'individual': {
            username = u.details.personal_details.first_name + ' ' + u.details.personal_details.last_name
            break
          }
          case 'business': {
            username = u.details.corporation_details.entity_name
            break
          }
        }

        if (username.length < 2) username = u.email

        return { email, username, userType }
      })
  },

  getUserIdByEmail (email) {
    return server.get('/user_id', false, { email: email })
      .then(r => {
        return r.account_id
      })
  },

  approveUser (accountId, details) {
    return server.post(`/users/${accountId}/approve`, details, true)
  },

  rejectUser (accountId, details) {
    return server.post(`/users/${accountId}/approve`, details, true)
  },

  // ---------- Verification documents ----------

  getDocumentList (accountId) {
    return server.sdkServer.documents()
      .all(accountId)
      .callWithSignature(store.getters.keypair)
  },

  getDocumentUrl (accountId, type) {
    return server.get(`/users/${accountId}/documents/${type}`, true)
      .then(response => {
        return response.url
      }, err => {
        console.error(err)
      })
  },

  // ---------- Recovery ----------

  getRecoveryRequests () {
    return server.sdkServer.recoveryRequests()
      .callWithSignature(store.getters.keypair)
  },

  getRecoveryById (id) {
    const prefix = `/recoveries/${id}`
    return server.get(prefix, true)
  },

  resolveRecoveryReq (accountId, reqData) {
    const prefix = `/users/${accountId}/recovery`

    if (reqData.approved) {
      const op = Operation.recover({
        account: reqData.recover_op.account,
        oldSigner: reqData.recover_op.old_signer,
        newSigner: reqData.recover_op.new_signer
      })
      reqData.tx = server.createTx(op)
    }

    delete reqData.recover_op

    return server.post(prefix, reqData, true)
  },

  getUserType (accountId) {
    return server.sdkServer.users()
      .accountId(accountId)
      .callWithSignature(store.getters.keypair)
      .then(kyc => {
        return kyc.user_type
      })
  },

  // ---------- Recovery ----------

  getNotificationsEmail (accountId) {
    return server.sdkServer
      .notifications()
      .accountId(accountId)
      .callWithSignature(store.getters.keypair)
  },

  setNotificationEmail (accountId, details) {
    const prefix = `/notifications/${accountId}`
    return server.patch(prefix, details, true)
  }
}
