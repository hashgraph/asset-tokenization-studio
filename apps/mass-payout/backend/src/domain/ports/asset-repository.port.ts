// SPDX-License-Identifier: Apache-2.0

import { Asset } from "@domain/model/asset"
import { Page, PageOptions } from "@domain/model/page"

export interface AssetRepository {
  saveAsset(item: Asset): Promise<Asset>

  updateAsset(item: Asset): Promise<Asset>

  getAsset(id: string): Promise<Asset | undefined>

  getAssetByName(name: string): Promise<Asset | undefined>

  getAssetByHederaTokenAddress(hederaTokenAddress: string): Promise<Asset | undefined>

  deleteAssets(ids: string[]): Promise<void>

  getAllAssets(): Promise<Asset[]>

  getAllSyncEnabledAssets(): Promise<Asset[]>

  getAssets(pageOptions: PageOptions): Promise<Page<Asset>>
}
