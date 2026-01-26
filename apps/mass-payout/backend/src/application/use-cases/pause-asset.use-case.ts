// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { PauseAssetDomainService } from "@domain/services/pause-asset.domain-service"
import { Asset } from "@domain/model/asset"

@Injectable()
export class PauseAssetUseCase {
  constructor(private readonly pauseAssetDomainService: PauseAssetDomainService) {}

  async execute(assetId: string): Promise<Asset> {
    return this.pauseAssetDomainService.pause(assetId)
  }
}
