// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { AssetTokenizationStudioService } from "@domain/ports/asset-tokenization-studio.port"
import {
  Bond,
  GetBondDetailsRequest,
  GetSecurityDetailsRequest,
  Security,
  TakeSnapshotRequest,
} from "@hashgraph/asset-tokenization-sdk"
import { AssetType } from "@domain/model/asset-type.enum"
import { GetAssetInfoResponse } from "@domain/ports/get-asset-info-response.interface"

@Injectable()
export class AssetTokenizationStudioSdkService implements AssetTokenizationStudioService {
  async getAssetInfo(hederaTokenAddress: string): Promise<GetAssetInfoResponse> {
    const getInfoRequest = new GetSecurityDetailsRequest({ securityId: hederaTokenAddress })
    const assetInfo = await Security.getInfo(getInfoRequest)
    let maturityDate: Date

    if (!assetInfo) return null

    if (assetInfo.type?.includes("BOND")) {
      const getBondDetailsRequest = new GetBondDetailsRequest({ bondId: hederaTokenAddress })
      const bondDetails = await Bond.getBondDetails(getBondDetailsRequest)
      maturityDate = bondDetails.maturityDate
    }
    return {
      hederaTokenAddress: hederaTokenAddress,
      name: assetInfo.name,
      symbol: assetInfo.symbol,
      assetType: assetInfo.type as AssetType,
      maturityDate: maturityDate,
    }
  }

  async takeSnapshot(hederaTokenId: string): Promise<number> {
    const snapshotResponse = await Security.takeSnapshot(new TakeSnapshotRequest({ securityId: hederaTokenId }))
    return snapshotResponse.payload
  }
}
