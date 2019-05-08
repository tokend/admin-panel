<template>
  <div class="fees-balances">
    <h2>Balance manegment</h2>
    <div class="fees-balances__balance-info">
      <div class="app__block">
        <h2>Balance</h2>
        <div class="fees-balances__balance-wrapper">
          <select-field
            class="fees-balances__form-field"
            label="Asset"
            v-model="balance.code"
            :disabled="isPending"
          >
            <option
              v-for="balanceItem in balances"
              :key="`balance-${balanceItem}`"
              :value="balanceItem"
              :selected="balanceItem === balance.code"
            >
              {{ balanceItem }}
            </option>
          </select-field>
          <div class="fees-balances__balance">
            <span>{{ formatBalance }}</span>
          </div>
        </div>

        <div class="fees-balances__asset-info" />
      </div>
      <div class="app__block">
        <h2>Withdrawal</h2>
        <input-field
          class="app__form-field fees-balances__input-field"
          type="number"
          v-model.trim="form.amount"
          label="Amount"
          name="amount"
        />
        <input-field
          class="app__form-field fees-balances__input-field"
          type="text"
          v-model.trim="form.comment"
          label="Comment"
          name="comment"
        />
        <button
          class="app__btn fees-balances__button"
          :disabled="isPending"
        >
          Withdrawal
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ErrorHandler } from '@/utils/ErrorHandler'
import { mapGetters } from 'vuex'
import { getters } from '@store/types'
import { Sdk } from '@/sdk'

import SelectField from '@comcom/fields/SelectField'
import InputField from '@comcom/fields/InputField'

export default {
  components: {
    SelectField,
    InputField,
  },
  data () {
    return {
      asset: {
        code: null,
        details: {},
      },
      balance: {
        code: null,
        id: null,
        details: {},
      },
      form: {
        amount: 0,
        comment: '',
      },
      assets: [],
      balances: [],
      isPending: false,
    }
  },
  computed: {
    ...mapGetters({
      adminId: getters.GET_USER_ADDRESS,
    }),
    formatBalance () {
      return `${this.balance.details.balance} ${this.balance.code}`
    },
  },
  watch: {
    async 'balance.code' () {
      await this.setInfoByAsset()
    },
  },
  async created () {
    await this.setUserBalance()
    await this.setInfoByAsset()
  },
  methods: {
    // TODO: Standartilize asset info
    // TODO: Add v-model to the field for withdrawal
    // TODO: form disabled + form enabled
    // TODO: Check valid values of Withdrawal
    // TODO: Add trailing digits count
    async createWithdraw () {
      try {
        const operation = Sdk.base.CreateWithdrawRequestBuilder
          .createWithdrawWithAutoConversion(this.composeOptions())
        await Sdk.horizon.transactions.submitOperations(operation)
      } catch (e) {
        ErrorHandler.process(
          'Something went wrong. Can\'t to load assets list'
        )
      }
    },
    composeOptions () {
      const creatorDetails = {}

      if (this.isMasterAssetOwner) {
        creatorDetails.address = this.adminId
      } else {
        creatorDetails.comment = ':3'
      }

      return {
        balance: 'BBRZIIZLA7W7OYZAS4OE4FR2ZZT74DXGBE3XXWG6GIPK4N37CO7NRRES',
        amount: '1',
        creatorDetails: creatorDetails,
        destAsset: 'BTC',
        expectedDestAssetAmount: '12',
        fee: {
          fixed: '0',
          percent: '0',
        },
      }
    },

    async setUserBalance () {
      this.$store.commit('OPEN_LOADER')
      this.isPending = true
      try {
        const balancesDetails = (
          await Sdk.horizon.account.getDetails(this.adminId)
        ).data
        const assets = balancesDetails.map(balance => {
          return balance.asset
        })
        this.balances = assets
        this.balance.code = assets[0]
        this.balance.details = balancesDetails.find(balance => {
          return balance.asset === this.balance.code
        })
      } catch (err) {
        ErrorHandler.process(
          'Something went wrong. Can\'t to load assets list'
        )
      }
      this.isPending = false
      this.$store.commit('CLOSE_LOADER')
    },
    async setInfoByAsset () {
      this.$store.commit('OPEN_LOADER')
      this.isPending = true
      try {
        const { data } = await Sdk.horizon.assets.get(
          this.balance.code
        )
        this.asset.details = data
        this.asset.code = data.code
      } catch (error) {
        ErrorHandler.process(
          'Something went wrong. Can\'t to load asset info'
        )
      }
      this.isPending = false
      this.$store.commit('CLOSE_LOADER')
    },
  },
}
</script>
<style lang="scss">

$side-padding: 0.5rem;

.fees-balances__balance-info {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 5rem;

  & div {
    width: 100%;
    max-width: 49rem;
  }
}
.fees-balances__form-field {
  max-width: 20rem;
}

.fees-balances__asset-info {
  margin-top: 1.2rem;
}

.fees-balances__balance-wrapper {
  display: flex;
}

.fees-balances__balance {
    text-align: center;

  &:before {
    content: '';
    display: inline-block;
    height: 100%;
    vertical-align: middle;
  }

  & span {
    display: inline-block;
    vertical-align: middle;
    font-size: 1.6srem;
    font-weight: 700;
  }
}

.fees-balances__button {
  width: 100%;
  max-width: 10rem;
  margin-top: 3rem;
}

.fees-balances__input-field {
  margin-top: 3rem;
}
</style>
