// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { UpdateAssetDomainService } from "@domain/services/update-asset.domain-service"
import { Asset } from "@domain/model/asset"

@Injectable()
export class UpdateAssetUseCase {
  constructor(private readonly updateAssetDomainService: UpdateAssetDomainService) {}

  async execute(id: string, name: string): Promise<Asset> {
    return this.updateAssetDomainService.updateAsset(id, name)
  }
}
