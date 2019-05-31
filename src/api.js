import { ApiCaller, FactorsManager, DocumentsManager } from '@tokend/js-sdk'
import config from '@/config'

export const api = new ApiCaller()
export const factorsManager = new FactorsManager()
export const documentsManager = new DocumentsManager()

export function useWallet (newWallet) {
  api.useWallet(newWallet)
  factorsManager.useApi(api)
  documentsManager.useApi(api)
  documentsManager.useStorageURL(config.FILE_STORAGE)
}

export async function loadingDataViaLoop (response) {
  let data = response.data
  while (response.data.length) {
    response = await response.fetchNext()
    data = [...data, ...response.data]
  }
  return data
}
