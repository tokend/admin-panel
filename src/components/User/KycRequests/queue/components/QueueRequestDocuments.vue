<template>
  <div class="queue-request-documents">
    <h3 class="queue-request-documents__title">
      User documents
    </h3>

    <div class="queue-request-documents__list">
      <div
        v-if="documents.kycSelfie"
        class="queue-request-documents__list-item"
      >
        <span>
          Photo with verification code
          <strong>{{ userAccountId.slice(1, 6) }}</strong>:
        </span>
        <user-doc-getter
          class="queue-request-documents__doc-getter"
          :file-key="documents.kycSelfie.key"
          :mime-type="documents.kycSelfie.mimeType"
        />
      </div>

      <div
        v-if="documents.kycIdDocument.face"
        class="queue-request-documents__list-item"
      >
        <span v-if="documents.kycIdDocument.back">
          ID Document front side:
        </span>

        <span v-else>
          ID Document
        </span>

        <user-doc-getter
          class="queue-request-documents__doc-getter"
          :file-key="documents.kycIdDocument.face.key"
          :mime-type="documents.kycIdDocument.face.mimeType"
        />
      </div>

      <div
        v-if="documents.kycIdDocument.back"
        class="queue-request-documents__list-item"
      >
        <span>ID Document back side: </span>
        <user-doc-getter
          class="queue-request-documents__doc-getter"
          :file-key="documents.kycIdDocument.back.key"
          :mime-type="documents.kycIdDocument.back.mimeType"
        />
      </div>

      <div
        v-if="documents.kycAvatar"
        class="queue-request-documents__list-item"
      >
        <span>Avatar</span>
        <user-doc-getter
          class="queue-request-documents__doc-getter"
          :file-key="documents.kycAvatar.key"
          :mime-type="documents.kycAvatar.mimeType"
        />
      </div>

      <div
        v-if="documents.kycProofInvestor"
        class="queue-request-documents__list-item"
      >
        <span>Proof document</span>
        <user-doc-getter
          class="queue-request-documents__doc-getter"
          :file-key="documents.kycProofInvestor.key"
          :mime-type="documents.kycProofInvestor.mimeType"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { UserDocGetter } from '@comcom/getters'

export default {
  name: 'queue-request-documents',
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
.queue-request-documents__title {
  margin-bottom: 0.6rem;
}
.queue-request-documents__list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: -2rem;
}

.queue-request-documents__list-item {
  flex: 0 1 calc(50% - 4rem);
  margin: 2.4rem 2rem;
  width: 10rem;
}

.queue-request-documents__doc-getter {
  margin-top: 1rem;
}
</style>
