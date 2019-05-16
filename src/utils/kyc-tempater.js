import { ID_DOCUMENT_TYPES } from '../constants'
import get from 'lodash/get'

export function fromKycTemplate (template) {
  return {
    idDocumentType: get(template, 'documents.kyc_id_document.type') || ID_DOCUMENT_TYPES.passport,
    documents: {
      kycIdDocument: {
        face: get(template, 'documents.kyc_id_document.face.key'),
        back: get(template, 'documents.kyc_id_document.back.key'),
      },
      kycAvatar: get(template, 'documents.kyc_avatar.key'),
      kycSelfie: template.documents.kyc_selfie
        ? get(template, 'documents.kyc_selfie.key')
        : get(template, 'documents.bravo.key'),
      kycProofInvestor: get(template, 'documents.kyc_proof_investor.key'),
    },
    first_name: template.first_name,
    last_name: template.last_name,
    date_of_birth: template.date_of_birth,
    address: {
      line_1: get(template, 'address.line_1'),
      line_2: get(template, 'address.line_2'),
      city: get(template, 'address.city'),
      country: get(template, 'address.country'),
      state: get(template, 'address.state'),
      postal_code: get(template, 'address.postal_code'),
    },
  }
}
