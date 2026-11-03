// SPDX-License-Identifier: Apache-2.0

import { Inject, Injectable } from "@nestjs/common";
import { AssetInformationLookupLimitError, AssetNotFoundError } from "@domain/errors/asset.error";
import { AssetType } from "@domain/model/asset-type.enum";
import { AssetTokenizationStudioService } from "@domain/ports/asset-tokenization-studio.port";

@Injectable()
export class GetBasicAssetInformationUseCase {
  /**
   * Upper bound on simultaneous on-chain metadata lookups. Each lookup calls the ATS SDK (and its
   * mirror node / RPC dependencies), so a flood of requests is turned away with 429 instead of
   * piling up outbound calls. Per-client rate limiting belongs in the API gateway in front of the service.
   */
  static readonly MAX_CONCURRENT_LOOKUPS = 10;
  private inFlightLookups = 0;

  constructor(
    @Inject("AssetTokenizationStudioService")
    private readonly assetTokenizationStudioService: AssetTokenizationStudioService,
  ) {}

  async execute(hederaTokenAddress: string): Promise<{
    hederaTokenAddress: string;
    name: string;
    symbol: string;
    assetType: AssetType;
    maturityDate?: Date;
  }> {
    if (this.inFlightLookups >= GetBasicAssetInformationUseCase.MAX_CONCURRENT_LOOKUPS) {
      throw new AssetInformationLookupLimitError(GetBasicAssetInformationUseCase.MAX_CONCURRENT_LOOKUPS);
    }
    this.inFlightLookups++;
    try {
      const assetInfo = await this.assetTokenizationStudioService.getAssetInfo(hederaTokenAddress);
      if (!assetInfo) {
        throw new AssetNotFoundError(hederaTokenAddress);
      }
      return {
        hederaTokenAddress: assetInfo.hederaTokenAddress,
        name: assetInfo.name,
        symbol: assetInfo.symbol,
        assetType: assetInfo.assetType,
        maturityDate: assetInfo.maturityDate,
      };
    } finally {
      this.inFlightLookups--;
    }
  }
}
