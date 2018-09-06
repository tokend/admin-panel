<template>
  <span class="asset-policies-formatter capitalized">
    {{
      [
        (mask & ASSET_POLICIES.transferable) && 'transferable',
        (mask & ASSET_POLICIES.baseAsset) && 'base asset',
        (mask & ASSET_POLICIES.statsQuoteAsset) && 'stats quote asset',
        (mask & ASSET_POLICIES.withdrawable) && 'withdrawable',
        (mask & ASSET_POLICIES.twoStepWithdrawal) && 'two step withdrawal',
        (mask & ASSET_POLICIES.requiresKyc) && 'KYC required'
      ].filter(item => item).join(', ') || '&mdash;'
    }}
  </span>
</template>

<script>
import { ASSET_POLICIES } from '@/constants'
export default {
  data () {
    return {
      ASSET_POLICIES,
      mask: 0
    }
  },

  props: ['policies', 'policyMask'],

  created () {
    if (this.policies) {
      this.mask = this.calcMask(this.policies)
    } else if (typeof this.policyMask === 'string' || typeof this.policyMask === 'number') {
      this.mask = +this.policyMask
    } else if (this.policies === null) {
      this.mask = 0
    } else {
      throw new Error('AssetPoliciesFormatter: provide "policies" or "policyMask"')
    }
  },

  methods: {
    calcMask (policies) {
      return policies.reduce((acc, cur) => acc + cur.value, 0)
    }
  }
}
</script>

<style scoped>

</style>
