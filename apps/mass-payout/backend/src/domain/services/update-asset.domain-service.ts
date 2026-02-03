// SPDX-License-Identifier: Apache-2.0

import { Asset } from "@domain/model/asset"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { Inject, Injectable } from "@nestjs/common"

import { AssetNameAlreadyExistsError, AssetNotFoundError } from "@domain/errors/asset.error"

@Injectable()
export class UpdateAssetDomainService {
  constructor(
    @Inject("AssetRepository")
    private readonly assetRepository: AssetRepository,
  ) {}

  async updateAsset(id: string, name: string): Promise<Asset> {
    const existingAsset = await this.assetRepository.getAsset(id)
    if (!existingAsset) {
      throw new AssetNotFoundError(id)
    }

    const assetWithSameName = await this.assetRepository.getAssetByName(name)
    if (assetWithSameName && assetWithSameName.id !== id) {
      throw new AssetNameAlreadyExistsError(name)
    }

    const updatedAsset = existingAsset.withName(name)

    await this.assetRepository.updateAsset(updatedAsset)

    return updatedAsset
  }
}
