// SPDX-License-Identifier: Apache-2.0

import { Inject, Injectable } from "@nestjs/common"
import { AssetType } from "@domain/model/asset-type.enum"
import { AssetTokenizationStudioService } from "@domain/ports/asset-tokenization-studio.port"

@Injectable()
export class GetBasicAssetInformationUseCase {
  constructor(
    @Inject("AssetTokenizationStudioService")
    private readonly assetTokenizationStudioService: AssetTokenizationStudioService,
  ) {}

  async execute(hederaTokenAddress: string): Promise<{
    hederaTokenAddress: string
    name: string
    symbol: string
    assetType: AssetType
    maturityDate?: Date
  }> {
    const assetInfo = await this.assetTokenizationStudioService.getAssetInfo(hederaTokenAddress)
    return {
      hederaTokenAddress: assetInfo.hederaTokenAddress,
      name: assetInfo.name,
      symbol: assetInfo.symbol,
      assetType: assetInfo.assetType,
      maturityDate: assetInfo.maturityDate,
    }
  }
}
