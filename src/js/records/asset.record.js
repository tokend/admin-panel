// import { ASSET_POLICIES } from '@tokend/js-sdk'
import safeGet from 'lodash/get'
import config from '@/config'

export class AssetRecord {
  constructor (record = {}) {
    this.id = record.id || ''
    this.preissuedAssetSigner = record.preissuedAssetSigner ||
      config.MASTER_ACCOUNT
    this.policies = {
      value: safeGet(record, 'policies.value', '0'),
    }
    this.initialPreissuedAmount = record.initialPreissuedAmount || '0'
    this.maxIssuanceAmount = record.maxIssuanceAmount || '0'
    this.availableForIssuance = record.availableForIssuance || '0'
    this.trailingDigits = record.trailingDigits || '6'
    this.type = record.type || '0'
    this.creatorDetails = {
      name: safeGet(record, 'creatorDetails.name', ''),
      logo: safeGet(record, 'creatorDetails.logo', {}),
      terms: safeGet(record, 'creatorDetails.terms', {}),
      externalSystemType: safeGet(record, 'creatorDetails.externalSystemType', ''),
      isCoinpayments: safeGet(record, 'creatorDetails.isCoinpayments', false),
      stellar: {
        withdraw: safeGet(record, 'creatorDetails.stellar.withdraw', false),
        deposit: safeGet(record, 'creatorDetails.stellar.deposit', false),
        assetType: safeGet(record, 'creatorDetails.stellar.assetType', ''),
        assetCode: safeGet(record, 'creatorDetails.stellar.assetCode', ''),
      },
      erc20: {
        withdraw: safeGet(record, 'creatorDetails.erc20.withdraw', false),
        deposit: safeGet(record, 'creatorDetails.erc20.deposit', false),
        address: safeGet(record, 'creatorDetails.erc20.address', ''),
      },
    }
  }
}
