// SPDX-License-Identifier: Apache-2.0

import { Injectable, Inject } from "@nestjs/common"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { Asset } from "@domain/model/asset"
import { AssetNotFoundError } from "@domain/errors/asset.error"

@Injectable()
export class GetAssetUseCase {
  constructor(@Inject("AssetRepository") private readonly assetRepository: AssetRepository) {}

  async execute(assetId: string): Promise<Asset> {
    const asset = await this.assetRepository.getAsset(assetId)

    if (!asset) {
      throw new AssetNotFoundError(assetId)
    }

    return asset
  }
}
