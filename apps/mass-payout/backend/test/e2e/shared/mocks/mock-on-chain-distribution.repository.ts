// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { OnChainDistributionRepositoryPort } from "@domain/ports/on-chain-distribution-repository.port"
import { Distribution, DistributionStatus } from "@domain/model/distribution"
import { Asset } from "@domain/model/asset"
import { CorporateActionId } from "@domain/model/value-objects/corporate-action-id"
import * as crypto from "crypto"

/**
 * Mock implementation of OnChainDistributionRepositoryPort for E2E tests.
 * This prevents real calls to the ATS SDK during testing while allowing
 * configurable responses for different test scenarios.
 */
@Injectable()
export class MockOnChainDistributionRepository implements OnChainDistributionRepositoryPort {
  private mockDistributions: Map<string, Distribution[]> = new Map()
  private defaultHoldersCount = 1

  addMockDistributionForAsset(asset: Asset, corporateActionId: string, executionDate: Date): void {
    const existing = this.mockDistributions.get(asset.id) || []
    const corporateActionIdObj = CorporateActionId.create(corporateActionId)
    const now = new Date()

    let distribution: Distribution
    if (executionDate <= now) {
      distribution = Distribution.createExistingCorporateAction(
        crypto.randomUUID(),
        asset,
        corporateActionIdObj,
        executionDate,
        DistributionStatus.SCHEDULED,
        new Date(),
        new Date(),
      )
    } else {
      distribution = Distribution.createCorporateAction(asset, corporateActionIdObj, executionDate)
    }

    existing.push(distribution)
    this.mockDistributions.set(asset.id, existing)
  }

  clearMockData(): void {
    this.mockDistributions.clear()
    this.defaultHoldersCount = 1
  }

  getAllDistributionsByAsset(asset: Asset): Promise<Distribution[]> {
    const distributions = this.mockDistributions.get(asset.id) || []
    const now = new Date()

    const futureDistributions = distributions
      .filter((distribution) => {
        const details = distribution.details as any
        return details.executionDate > now
      })
      .sort((a, b) => {
        const aDate = (a.details as any).executionDate
        const bDate = (b.details as any).executionDate
        return aDate.getTime() - bDate.getTime()
      })

    return Promise.resolve(futureDistributions)
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  getHoldersCountForCorporateActionId(distribution: Distribution): Promise<number> {
    return Promise.resolve(this.defaultHoldersCount)
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  getHoldersCountForSnapshotId(distribution: Distribution): Promise<number> {
    return Promise.resolve(this.defaultHoldersCount)
  }
}
