// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { UnpauseAssetDomainService } from "@domain/services/unpause-asset.domain-service"
import { Asset } from "@domain/model/asset"

@Injectable()
export class UnpauseAssetUseCase {
  constructor(private readonly unpauseAssetDomainService: UnpauseAssetDomainService) {}

  async execute(assetId: string): Promise<Asset> {
    return this.unpauseAssetDomainService.unpause(assetId)
  }
}
