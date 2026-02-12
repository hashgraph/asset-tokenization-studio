// SPDX-License-Identifier: Apache-2.0

import { OnChainDistributionRepositoryPort } from "@domain/ports/on-chain-distribution-repository.port"
import { Distribution, DistributionType, CorporateActionDetails, PayoutDetails } from "@domain/model/distribution"
import { AssetType } from "@domain/model/asset-type.enum"
import { Asset } from "@domain/model/asset"
import { CorporateActionId } from "@domain/model/value-objects/corporate-action-id"
import {
  Bond,
  Equity,
  Security,
  GetAllCouponsRequest,
  GetAllDividendsRequest,
  GetTotalCouponHoldersRequest,
  GetTotalDividendHoldersRequest,
  GetTotalTokenHoldersAtSnapshotRequest,
} from "@hashgraph/asset-tokenization-sdk"

export class OnChainDistributionRepository implements OnChainDistributionRepositoryPort {
  async getAllDistributionsByAsset(asset: Asset): Promise<Distribution[]> {
    switch (asset.type) {
      case AssetType.BOND_VARIABLE_RATE:
      case AssetType.BOND_FIXED_RATE:
      case AssetType.BOND_KPI_LINKED_RATE:
      case AssetType.BOND_SPT_RATE:
        return this.getCouponsForAsset(asset)
      case AssetType.EQUITY:
        return this.getDividendsForAsset(asset)
      default:
        return []
    }
  }

  async getHoldersCountForCorporateActionId(distribution: Distribution): Promise<number> {
    if (distribution.details.type !== DistributionType.CORPORATE_ACTION) {
      throw new Error(`Distribution ${distribution.id} is not a corporate action distribution`)
    }

    const corporateActionDetails = distribution.details as CorporateActionDetails
    const corporateActionId = Number(corporateActionDetails.corporateActionId.value)
    const tokenId = distribution.asset.hederaTokenAddress
    const assetType = distribution.asset.type

    switch (assetType) {
      case AssetType.BOND_VARIABLE_RATE:
      case AssetType.BOND_FIXED_RATE:
      case AssetType.BOND_KPI_LINKED_RATE:
      case AssetType.BOND_SPT_RATE: {
        const couponRequest = new GetTotalCouponHoldersRequest({
          securityId: tokenId,
          couponId: corporateActionId,
        })
        return await Bond.getTotalCouponHolders(couponRequest)
      }

      case AssetType.EQUITY: {
        const dividendRequest = new GetTotalDividendHoldersRequest({
          securityId: tokenId,
          dividendId: corporateActionId,
        })
        return await Equity.getTotalDividendHolders(dividendRequest)
      }

      default:
        throw new Error(`Unsupported asset type: ${assetType} for corporate action ${corporateActionId}`)
    }
  }

  async getHoldersCountForSnapshotId(distribution: Distribution): Promise<number> {
    if (distribution.details.type !== DistributionType.PAYOUT) {
      throw new Error(`Distribution ${distribution.id} is not a payout distribution`)
    }

    const payoutDetails = distribution.details as PayoutDetails
    if (!payoutDetails.snapshotId) {
      throw new Error(`SnapshotId is missing for distribution ${distribution.id}`)
    }

    const snapshotId = Number(payoutDetails.snapshotId.value)
    const tokenId = distribution.asset.hederaTokenAddress

    const request = new GetTotalTokenHoldersAtSnapshotRequest({
      securityId: tokenId,
      snapshotId,
    })
    return await Security.getTotalTokenHoldersAtSnapshot(request)
  }

  private async getCouponsForAsset(asset: Asset): Promise<Distribution[]> {
    const request = new GetAllCouponsRequest({ securityId: asset.hederaTokenAddress })
    const coupons = await Bond.getAllCoupons(request)
    const now = new Date()

    const futureCoupons = coupons
      .filter((coupon) => coupon.executionDate > now)
      .sort((a, b) => a.executionDate.getTime() - b.executionDate.getTime())

    return futureCoupons.map((coupon) => {
      const corporateActionId = CorporateActionId.create(coupon.couponId.toString())
      return Distribution.createCorporateAction(asset, corporateActionId, coupon.executionDate)
    })
  }

  private async getDividendsForAsset(asset: Asset): Promise<Distribution[]> {
    const request = new GetAllDividendsRequest({ securityId: asset.hederaTokenAddress })
    const dividends = await Equity.getAllDividends(request)
    const now = new Date()

    const futureDividends = dividends
      .filter((dividend) => dividend.executionDate > now)
      .sort((a, b) => a.executionDate.getTime() - b.executionDate.getTime())

    return futureDividends.map((dividend) => {
      const corporateActionId = CorporateActionId.create(dividend.dividendId.toString())
      return Distribution.createCorporateAction(asset, corporateActionId, dividend.executionDate)
    })
  }
}
