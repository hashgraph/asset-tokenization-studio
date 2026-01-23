// SPDX-License-Identifier: Apache-2.0

import { Inject, Injectable } from "@nestjs/common"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { LifeCycleCashFlowPort } from "@domain/ports/life-cycle-cash-flow.port"
import { Asset } from "@domain/model/asset"

@Injectable()
export class UnpauseAssetDomainService {
  constructor(
    @Inject("AssetRepository")
    private readonly assetRepository: AssetRepository,
    @Inject("OnChainLifeCycleCashFlowService")
    private readonly onChainLifeCycleCashFlowService: LifeCycleCashFlowPort,
  ) {}

  async unpause(assetId: string): Promise<Asset> {
    const asset = await this.assetRepository.getAsset(assetId)
    if (!asset) {
      throw new Error(`Asset with ID ${assetId} not found`)
    }

    if (!asset.isPaused) {
      return asset
    }

    await this.onChainLifeCycleCashFlowService.unpause(asset.lifeCycleCashFlowHederaAddress)

    const unpausedAsset = asset.unpause()
    await this.assetRepository.updateAsset(unpausedAsset)

    return unpausedAsset
  }
}
