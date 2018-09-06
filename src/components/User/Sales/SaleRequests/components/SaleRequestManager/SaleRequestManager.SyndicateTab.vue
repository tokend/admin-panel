<template>
  <div class="sale-manager-syndicate-tab">
    <template>
      <p class="text">
        This feature is not implemented yet
      </p>
    </template>
  </div>
</template>

<script>
import api from '@/api'
import moment from 'moment'
import { DateFormatter } from '@comcom/formatters'
import SyndicateMember from '@comcom/SyndicateMember'
import SocialLinks from '@comcom/SocialLinks'

export default {
  components: {
    DateFormatter,
    SyndicateMember,
    SocialLinks
  },

  props: ['saleRequest'],

  data () {
    return {
      syndicate: {},
      isLoaded: false,
      isFailed: false
    }
  },

  created () {
    this.getSyndicate(this.saleRequest)
  },

  methods: {
    normalizeSyndicate (syndicate) {
      const result = Object.assign({}, syndicate)

      result.founded =
        moment( // Convert date to valid ISO format
          moment(result.founded, 'YYYY-MM-DD').format('YYYY-MM-DD[T00:00:00Z]')
        ).toISOString()

      result.lead = result.members.find(item => item.isLeader)
      result.members = result.members.filter(item => !item.isLeader)

      return result
    },

    async getSyndicate ({ requestor: owner }) {
      try {
        const response = await api.users
          .blobsOf(owner)
          .getAll({ saleOwner: owner })

        const syndicate = this.normalizeSyndicate(
          JSON.parse(response.data[0].value)
        )

        this.syndicate = syndicate
        this.isLoaded = true
      } catch (error) {
        this.isFailed = false
      }
    }
  }
}
</script>

<style scoped lang="scss">
.sale-manager-syndicate-tab__details-wrp {
  max-width: 48rem;
}

.sale-manager-syndicate-tab__member-wrp {
  & + & {
    margin-top: 6rem;
  }
}

.sale-manager-syndicate-tab__team-h3 {
  margin-left: 20rem;
  margin: 4rem 0 4rem 0rem; // WARN: left - magic number
}
</style>
