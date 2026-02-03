// SPDX-License-Identifier: Apache-2.0

import { Asset } from "@domain/model/asset"
import { EnableAssetSyncDomainService } from "@domain/services/enable-asset-sync.domain-service"
import { Injectable } from "@nestjs/common"

@Injectable()
export class EnableAssetSyncUseCase {
  constructor(private readonly enableAssetSyncDomainService: EnableAssetSyncDomainService) {}

  async execute(assetId: string): Promise<Asset> {
    return this.enableAssetSyncDomainService.execute(assetId)
  }
}
