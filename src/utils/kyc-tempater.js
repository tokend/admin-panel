import { ID_DOCUMENT_TYPES } from '../constants'
import get from 'lodash/get'

export function fromKycTemplate (template) {
  return {
    idDocumentType: template.id_document_type || ID_DOCUMENT_TYPES.passport,
    documents: {
      kycIdDocument: get(template, 'documents.kyc_id_document.front.key') || get(template, 'documents.kyc_id_document.key'),
      kycIdDocumentBack: get(template, 'documents.kyc_id_document.back.key') || get(template, 'documents.kyc_id_document.key'),
      kycSelfie: template.documents.kyc_selfie
        ? get(template, 'documents.kyc_selfie.front.key') || get(template, 'documents.kyc_selfie.key')
        : get(template, 'documents.bravo.front.key') || get(template, 'documents.bravo.key'),
      kycPoa: get(template, 'documents.kyc_poa.front.key') || get(template, 'documents.kyc_poa.key')
    },
    first_name: template.first_name,
    last_name: template.last_name,
    address: {
      line_1: template.address.line_1,
      line_2: template.address.line_2,
      city: template.address.city,
      country: template.address.country,
      state: template.address.state,
      postal_code: template.address.postal_code
    },
    id_expiration_date: template.id_expiration_date,
    date_of_birth: template.date_of_birth
  }
}
