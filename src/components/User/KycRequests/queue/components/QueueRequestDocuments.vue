<template>
  <div class="queue-request-documents">
    <h3 class="queue-request-documents__title">
      {{ "queue-request-documents.header" | globalize }}
    </h3>

    <div class="queue-request-documents__list">
      <div
        v-if="documents.kycSelfie"
        class="queue-request-documents__list-item"
      >
        <span>
          <!-- eslint-disable-next-line max-len -->
          {{ "queue-request-documents.photo-with-verification-code" | globalize }}
          <strong>{{ userAccountId.slice(1, 6) }}</strong>:
        </span>
        <user-doc-getter
          class="queue-request-documents__doc-getter"
          :file-key="documents.kycSelfie.key"
          :mime-type="documents.kycSelfie.mimeType"
        />
      </div>

      <div
        v-if="documents.kycIdDocument && documents.kycIdDocument.face"
        class="queue-request-documents__list-item"
      >
        <span v-if="documents.kycIdDocument.back">
          {{ "queue-request-documents.id-document-front-side" | globalize }}
        </span>

        <span v-else>
          {{ "queue-request-documents.id-document" | globalize }}
        </span>

        <user-doc-getter
          class="queue-request-documents__doc-getter"
          :file-key="documents.kycIdDocument.face.key"
          :mime-type="documents.kycIdDocument.face.mimeType"
        />
      </div>

      <div
        v-if="documents.kycIdDocument && documents.kycIdDocument.back"
        class="queue-request-documents__list-item"
      >
        <span>
          {{ "queue-request-documents.id-document-back-side" | globalize }}
        </span>
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
        <span>{{ "queue-request-documents.avatar" | globalize }}</span>
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
        <span>{{ "queue-request-documents.proof-document" | globalize }}</span>
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
