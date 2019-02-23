import { ID_DOCUMENT_TYPES } from '../constants'
import get from 'lodash/get'

export function fromKycTemplate (template) {
  return {
    idDocumentType: template.id_document_type || ID_DOCUMENT_TYPES.passport,
    documents: {
      kycIdDocument: get(template, 'documents.kyc_id_document.front.key') || get(template, 'documents.kyc_id_document.key'),
      kycSelfie: template.documents.kyc_selfie
        ? get(template, 'documents.kyc_selfie.front.key') || get(template, 'documents.kyc_selfie.key')
        : get(template, 'documents.bravo.front.key') || get(template, 'documents.bravo.key')
    },
    first_name: template.first_name,
    last_name: template.last_name
  }
}
