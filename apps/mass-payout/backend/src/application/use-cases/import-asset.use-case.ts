// SPDX-License-Identifier: Apache-2.0

import { Asset } from "@domain/model/asset"
import { ImportAssetDomainService } from "@domain/services/import-asset.domain-service"
import { Injectable } from "@nestjs/common"

@Injectable()
export class ImportAssetUseCase {
  constructor(private readonly importAssetDomainService: ImportAssetDomainService) {}

  async execute(hederaTokenAddress: string): Promise<Asset> {
    return this.importAssetDomainService.importAsset(hederaTokenAddress)
  }
}
