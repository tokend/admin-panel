<template>
  <div class="kyc-documents-viewer">
    <h3 class="kyc-documents-viewer__title">
      User documents
    </h3>

    <div class="kyc-documents-viewer__list">
      <div
        v-if="documents.kycSelfie"
        class="kyc-documents-viewer__list-item"
      >
        <span>
          Photo with verification code
          <strong>{{ userAccountId.slice(1, 6) }}</strong>:
        </span>
        <user-doc-getter
          class="kyc-documents-viewer__doc-getter"
          :file-key="documents.kycSelfie"
        />
      </div>

      <div
        v-if="documents.kycIdDocument.face"
        class="kyc-documents-viewer__list-item"
      >
        <span v-if="documents.kycIdDocument.back">
          ID Document front side:
        </span>

        <span v-else>
          ID Document
        </span>

        <user-doc-getter
          class="kyc-documents-viewer__doc-getter"
          :file-key="documents.kycIdDocument.face"
        />
      </div>

      <div
        v-if="documents.kycIdDocument.back"
        class="kyc-documents-viewer__list-item"
      >
        <span>ID Document back side: </span>
        <user-doc-getter
          class="kyc-documents-viewer__doc-getter"
          :file-key="documents.kycIdDocument.back"
        />
      </div>

      <div
        v-if="documents.kycAvatar"
        class="kyc-documents-viewer__list-item"
      >
        <span>Avatar</span>
        <user-doc-getter
          class="kyc-documents-viewer__doc-getter"
          :file-key="documents.kycAvatar"
        />
      </div>

      <div
        v-if="documents.kycProofInvestor"
        class="kyc-documents-viewer__list-item"
      >
        <span>Proof document</span>
        <user-doc-getter
          class="kyc-documents-viewer__doc-getter"
          :file-key="documents.kycProofInvestor"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { UserDocGetter } from '@comcom/getters'

export default {
  name: 'kyc-documents-viewer',
  components: {
    UserDocGetter,
  },

  props: {
    documents: { type: Object, required: true },
    userAccountId: { type: String, required: true },
  },
}
</script>

<style scoped>
.kyc-documents-viewer__title {
  margin-bottom: 0.6rem;
}
.kyc-documents-viewer__list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: -2rem;
}

.kyc-documents-viewer__list-item {
  flex: 0 1 calc(50% - 4rem);
  margin: 2.4rem 2rem;
  width: 10rem;
}

.kyc-documents-viewer__doc-getter {
  margin-top: 1rem;
}
</style>
