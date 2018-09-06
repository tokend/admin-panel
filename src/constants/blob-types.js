export const BLOB_TYPES = Object.freeze({
  tokenDescription: 1,
  saleOverview: 2,
  saleUpdate: 4,
  navUpdate: 8,
  saleDocument: 16,
  alpha: 32,
  bravo: 64,
  charlie: 128,
  delta: 256,
  tokenTerms: 512,
  tokenMetrics: 1024,
  kycForm: 2048,
  kycIdDocument: 4096,
  kycProofOfAddress: 8192
})

export const BLOB_TYPES_STR = Object.freeze({
  tokenDescription: 'asset_description',
  saleOverview: 'fund_overview',
  saleUpdate: 'fund_update',
  navUpdate: 'nav_update',
  saleDocument: 'fund_document',
  alpha: 'alpha',
  bravo: 'bravo',
  charlie: 'charlie',
  delta: 'delta',
  tokenTerms: 'token_terms',
  tokenMetrics: 'token_metrics',
  kycForm: 'kyc_form',
  kycIdDocument: 'kyc_id_document',
  kycProofOfAddress: 'kyc_poa'
})
