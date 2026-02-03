// SPDX-License-Identifier: Apache-2.0

import { AssetNotFoundError } from "@domain/errors/asset.error"
import { Asset } from "@domain/model/asset"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { Inject, Injectable } from "@nestjs/common"

@Injectable()
export class EnableAssetSyncDomainService {
  constructor(
    @Inject("AssetRepository")
    private readonly assetRepository: AssetRepository,
  ) {}

  async execute(assetId: string): Promise<Asset> {
    const asset = await this.assetRepository.getAsset(assetId)
    if (!asset) {
      throw new AssetNotFoundError(assetId)
    }
    if (asset.syncEnabled) {
      return asset
    }
    const syncEnabledAsset = asset.enableSync()
    return await this.assetRepository.updateAsset(syncEnabledAsset)
  }
}
