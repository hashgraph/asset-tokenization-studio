// SPDX-License-Identifier: Apache-2.0

import { AssetNotFoundError } from "@domain/errors/asset.error"
import { Asset } from "@domain/model/asset"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { LifeCycleCashFlowPort } from "@domain/ports/life-cycle-cash-flow.port"
import { Inject, Injectable } from "@nestjs/common"

@Injectable()
export class PauseAssetDomainService {
  constructor(
    @Inject("AssetRepository")
    private readonly assetRepository: AssetRepository,
    @Inject("OnChainLifeCycleCashFlowService")
    private readonly onChainLifeCycleCashFlowService: LifeCycleCashFlowPort,
  ) {}

  async pause(assetId: string): Promise<Asset> {
    const asset = await this.assetRepository.getAsset(assetId)
    if (!asset) {
      throw new AssetNotFoundError(`Asset with ID ${assetId} not found`)
    }
    if (asset.isPaused) {
      return asset
    }

    await this.onChainLifeCycleCashFlowService.pause(asset.lifeCycleCashFlowHederaAddress)

    const pausedAsset = asset.pause()
    await this.assetRepository.updateAsset(pausedAsset)

    return pausedAsset
  }
}
