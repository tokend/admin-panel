<template>
  <div class="transaction-view" v-if="operation.type">
    <div class="transaction-view__row">
      <p class="transaction-view__label secondary">Type</p>
      <p class="transaction-view__value capitalized">{{getFieldValue('type')}}</p>
    </div>

    <div class="transaction-view__row" v-for="key in opStruct" :key="key">
      <p class="transaction-view__label secondary">
        {{getFieldName(key)}}
      </p>
      <p class="transaction-view__value">
        {{getFieldValue(key)}}
      </p>
    </div>

    <template v-if="operation.type_i === 16">
      <h2>Matches</h2>
      <div class="transaction-view__row" v-for="(matches, pId) in offerMatches" :key="pId">

        <div class="info-block__row-item">
          <div class="transaction-view__label secondary">User</div>
          <div class="transaction-view__value">{{pId}}</div>
        </div>

        <div class="table">
          <div class="table__row auto-width table__row--head">
            <div class="table__col--number">Base Amount</div>
            <div class="table__col--number">Quote Amount</div>
            <div class="table__col--number">Price</div>
            <div class="table__col--number">Fee Paid</div>
            <div class="table__col--number">Is Buy</div>
            <div class="table__col--account-id">Account</div>
          </div>

          <div class="table__row auto-width" v-for="m in matches">
            <div class="table__col--number">{{localize(m.base_amount)}} {{m.base_asset}} </div>
            <div class="table__col--number">{{localize(m.quote_amount)}} {{m.quote_asset}}</div>
            <div class="table__col--number">{{localize(m.price)}} {{m.quote_asset}}</div>
            <div class="table__col--number">{{localize(m.fee_paid)}} {{m.quote_asset}}</div>
            <div class="table__col--number">{{m.is_buy}}</div>
            <div class="table__col--account-id" :title="m.balance_id">{{m.balance_id}}</div>
          </div>
        </div>

      </div>
    </template>

    <template v-if="operation.type_i === 22">
      <kyc-section :user="{ id: userAccountId }" :blobId="safeGet(operation, 'kyc_data.blob_id')"/>
    </template>

  </div>
</template>

<script>
import KycSection from '../../Users/components/UserDetails/UserDetails.Kyc'

import api from '@/api'
import moment from 'moment'
import JsSDK from 'tokend-js-sdk'
import operations from '../../../../utils/operations'
import localize from '../../../../utils/localize'
import { verbozify } from '@/utils/verbozify'
import safeGet from 'lodash/get'
import { ACCOUNT_TYPES } from '@/constants'
const ACCOUNT_TYPES_VERBOSE = Object.freeze({
  operational: 'Operational',
  [ACCOUNT_TYPES.operational]: 'Operational',

  general: 'General',
  [ACCOUNT_TYPES.general]: 'General',

  commission: 'Comission',
  [ACCOUNT_TYPES.commission]: 'Comission',

  master: 'Master',
  [ACCOUNT_TYPES.master]: 'Master',

  notVerified: 'Not verified',
  [ACCOUNT_TYPES.notVerified]: 'Not verified',

  syndycate: 'Corporate user',
  [ACCOUNT_TYPES.syndicate]: 'Corporate user'
})

export default {
  name: 'transaction-view',
  props: ['id', 'userAccountId'],
  components: { KycSection },
  computed: {
    chargedFrom () {
      return this.operation.participants
        .filter(participant => participant.effects)
        .map(participant => {
          return {
            ...participant,
            name: operations.participantsInfo(participant),
            amount: participant.effects.amount
          }
        })
    }
  },

  created () {
    this.getOperation()
  },

  methods: {
    goManageDetails (accountId) {
      this.$router.push({
        name: 'users.show',
        params: { address: accountId }
      })
    },

    loadParticipants () {
      const p = {}
      p[this.id] = this.operation.participants

      return api.transactions.getParticipants(p, this.userAccountId)
        .then(pResp => {
          return pResp[this.id]
        }).catch(err => {
          console.error(err)
          return []
        })
    },

    getOperation () {
      return api.transactions.getOperationById(this.id)
        .then(r => {
          if (!operations.propsList[r.type]) {
            this.opStruct = operations.propsList.other
          } else {
            this.opStruct = operations.propsList[r.type]
          }
          r.state = this.state[r.state]

          this.operation = r
        })
        .then(this.loadParticipants)
        .then(this.parseInfo)
        .catch(err => {
          console.error(err)
          this.$store.dispatch('SET_ERROR', 'Can not load this operation')
          this.loaded = true
        })
    },

    parseInfo (filledParticipants) {
      this.operation.ledger_close_time = this.formatDate(this.operation.ledger_close_time)

      if (this.operation.type_i === 6) {
        this.operation.block_reasons_to_add = operations.enumToSting(JsSDK.xdr.BlockReasons, this.operation.block_reasons_to_add)
        this.operation.block_reasons_to_remove = operations.enumToSting(JsSDK.xdr.BlockReasons, this.operation.block_reasons_to_remove)
      }

      this.operation.participants.forEach(op => {
        filledParticipants.forEach(p => {
          if (op.account_id !== p.account_id) return

          if (this.operation.type_i === 10 && this.operation.source_account !== p.account_id) {
            this.operation.user = this.participantsInfo(p)
          }

          op.account_id = operations.participantsInfo(p)
        })

        if (this.operation.type_i === 16) {
          op.effects.matches.forEach(m => {
            m.balance_id = op.balance_id
            m.base_asset = op.effects.base_asset
            m.quote_asset = op.effects.quote_asset
            m.is_buy = op.effects.is_buy
          })

          if (this.offerMatches[op.account_id]) {
            this.offerMatches[op.account_id] = this.offerMatches[op.account_id].concat(op.effects.matches)
          } else {
            this.offerMatches[op.account_id] = op.effects.matches
          }
        }
      })

      // check the all fields of operation and replace an accountIds by participant name if it present
      this.opStruct.forEach(k => {
        if (typeof this.operation[k] !== 'string' || this.operation[k].length !== 56) return
        if (!JsSDK.Keypair.isValidPublicKey(this.operation[k])) return

        filledParticipants.forEach(p => {
          if (this.operation[k] !== p.account_id) return

          this.operation[k] = operations.participantsInfo(p)
        })
      })

      this.loaded = true
    },

    formatDate (date) {
      return moment(date).calendar(null, {
        lastWeek: 'DD MMM LT',
        sameElse: 'DD MMM LT'
      })
    },

    getFieldName (key) {
      const vocabulary = {
        id: 'ID',
        source_pays_for_dest: 'Source pays for destination'
      }
      return vocabulary[key] || verbozify(key)
    },

    getFieldValue (key) {
      if (key === 'amount' || /fee$/i.test(key)) {
        return `${localize(this.operation[key])} ${this.operation.asset}`
      } else if (key === 'type') {
        return verbozify(this.operation[key])
      } else if (key === 'account_type') {
        return ACCOUNT_TYPES_VERBOSE[this.operation[key]]
      }

      return this.operation[key] !== undefined ? this.operation[key] : '—'
    }
  },

  data () {
    return {
      loaded: false,
      state: ['', 'Pending', 'Successful', 'Rejected', 'Canceled', 'Failed'],
      operation: {},
      offerMatches: {},
      opStruct: [],
      localize,
      safeGet
    }
  }
}
</script>

<style lang="scss" scoped>
.transaction-view__row {
  display: flex;
  & + & {
    margin-top: 0.5rem;
  }
}

.transaction-view__label {
  text-align: right;
  padding-right: 2rem;
  width: 20rem;
  min-width: 20rem;
}

.transaction-view__value {
  overflow: hidden;
  text-overflow: ellipsis;
}

// legacy

.info-block__row-item {
  justify-content: flex-start;
}

.table__row {
  justify-content: flex-start;
  width: auto;
  height: 45px;
}

.table__col--number {
  width: 150px;
}

.table__col--account-id {
  max-width: 180px;
}
</style>
