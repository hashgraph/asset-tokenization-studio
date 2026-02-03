// SPDX-License-Identifier: Apache-2.0

import { Asset } from "@domain/model/asset"
import { DisableAssetSyncDomainService } from "@domain/services/disable-asset-sync.domain-service"
import { Injectable } from "@nestjs/common"

@Injectable()
export class DisableAssetSyncUseCase {
  constructor(private readonly disableAssetSyncDomainService: DisableAssetSyncDomainService) {}

  async execute(assetId: string): Promise<Asset> {
    return this.disableAssetSyncDomainService.execute(assetId)
  }
}
