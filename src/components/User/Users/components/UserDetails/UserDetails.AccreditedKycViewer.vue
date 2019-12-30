<template>
  <div class="accredited-kyc-viewer">
    <div class="accredited-kyc-viewer__warning-msg">
      <span class="accredited-kyc-viewer__header-title">
        <!-- eslint-disable-next-line max-len -->
        {{ "user-details-accredited-kyc-viewer.user-accredited-kyc" | globalized }}
      </span>
      <span class="accredited-kyc-viewer__header-subtitle">
        <!-- eslint-disable-next-line max-len -->
        {{ "user-details-accredited-kyc-viewer.ensure-proof-document" | globalized }}
      </span>
    </div>
    <ul class="accredited-kyc-viewer__proof-document-wrp key-value-list">
      <li>
        <span>
          {{ "user-details-accredited-kyc-viewer.proof-document" | globalized }}
        </span>
        <span>
          <user-doc-link-getter
            :file-key="kyc.documents.kycProofInvestor"
          >
            {{ "user-details-accredited-kyc-viewer.open-file" | globalized }}
          </user-doc-link-getter>
        </span>
      </li>
    </ul>

    <kyc-general-section
      :kyc="kyc"
      :user="user"
    />
  </div>
</template>

<script>
import KycGeneralSection from './UserDetails.Kyc'
import { UserDocLinkGetter } from '@comcom/getters'

export default {
  components: {
    KycGeneralSection,
    UserDocLinkGetter,
  },
  props: {
    kyc: {
      type: Object,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/_colors.scss";

.accredited-kyc-viewer__header-title {
  color: $color-text-inverse;
  font-weight: bold;
  margin-bottom: .5rem;
}

.accredited-kyc-viewer__header-subtitle {
  color: $color-text-inverse;
}

.accredited-kyc-viewer__warning-msg {
  padding: 1rem 2.5rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  background-color: $color-banner-bg;
}

.accredited__doc-title {
  margin-top: 1rem;
}

.accredited-kyc-viewer__proof-document-wrp {
  margin-bottom: 2rem;
}
</style>
