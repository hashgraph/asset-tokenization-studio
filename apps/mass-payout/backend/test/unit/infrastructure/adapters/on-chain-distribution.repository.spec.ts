// SPDX-License-Identifier: Apache-2.0

import { OnChainDistributionRepository } from "@infrastructure/adapters/on-chain-distribution.repository"
import { AssetType } from "@domain/model/asset-type.enum"
import { Asset } from "@domain/model/asset"
import { CorporateActionDetails, DistributionType, PayoutSubtype, AmountType } from "@domain/model/distribution"
import { Bond, Equity } from "@hashgraph/asset-tokenization-sdk"
import { AssetUtils } from "@test/shared/asset.utils"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { CorporateActionId } from "@domain/model/value-objects/corporate-action-id"
import { SnapshotId } from "@domain/model/value-objects/snapshot-id"
import { faker } from "@faker-js/faker"

jest.mock("@hashgraph/asset-tokenization-sdk", () => ({
  Bond: {
    getAllCoupons: jest.fn(),
    getTotalCouponHolders: jest.fn(),
  },
  Equity: {
    getAllDividends: jest.fn(),
    getTotalDividendHolders: jest.fn(),
  },
  Security: {
    getTotalTokenHoldersAtSnapshot: jest.fn(),
  },
  GetAllCouponsRequest: jest.fn(),
  GetAllDividendsRequest: jest.fn(),
  GetTotalCouponHoldersRequest: jest.fn(),
  GetTotalDividendHoldersRequest: jest.fn(),
  GetTotalTokenHoldersAtSnapshotRequest: jest.fn(),
}))

const mockBond = Bond as jest.Mocked<typeof Bond>
const mockEquity = Equity as jest.Mocked<typeof Equity>
import { Security } from "@hashgraph/asset-tokenization-sdk"
const mockSecurity = Security as jest.Mocked<typeof Security>

describe(OnChainDistributionRepository.name, () => {
  let repository: OnChainDistributionRepository
  let bondAsset: Asset
  let equityAsset: Asset

  beforeEach(() => {
    repository = new OnChainDistributionRepository()
    bondAsset = AssetUtils.newInstance({ type: AssetType.BOND })
    equityAsset = AssetUtils.newInstance({ type: AssetType.EQUITY })
    jest.clearAllMocks()
  })

  describe("getAllDistributionsByAsset", () => {
    it("should call getCouponsForAsset for BOND assets", async () => {
      const mockCoupons = [
        {
          couponId: faker.number.int(),
          executionDate: faker.date.future(),
          recordDate: faker.date.recent(),
          rate: faker.number.float({ min: 0.01, max: 0.1 }).toString(),
        },
      ]
      mockBond.getAllCoupons.mockResolvedValue(mockCoupons)

      await repository.getAllDistributionsByAsset(bondAsset)

      expect(mockBond.getAllCoupons).toHaveBeenCalledWith(expect.any(Object))
    })

    it("should call getDividendsForAsset for EQUITY assets", async () => {
      const mockDividends = [
        {
          dividendId: faker.number.int(),
          executionDate: faker.date.future(),
          amountPerUnitOfSecurity: faker.number.float({ min: 1, max: 100 }).toString(),
          recordDate: faker.date.recent(),
        },
      ]
      mockEquity.getAllDividends.mockResolvedValue(mockDividends)

      await repository.getAllDistributionsByAsset(equityAsset)

      expect(mockEquity.getAllDividends).toHaveBeenCalledWith(expect.any(Object))
    })

    it("should return empty array for unsupported asset types", async () => {
      const unsupportedAsset = AssetUtils.newInstance({ type: "UNSUPPORTED" as AssetType })

      const result = await repository.getAllDistributionsByAsset(unsupportedAsset)

      expect(result).toEqual([])
    })
  })

  describe("getCouponsForAsset (BOND)", () => {
    it("should return all future coupons when multiple future coupons exist", async () => {
      const now = new Date()
      const closestDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const furtherDate = new Date(now.getTime() + 48 * 60 * 60 * 1000)

      const mockCoupons = [
        {
          couponId: 2,
          executionDate: furtherDate,
          recordDate: faker.date.recent(),
          rate: faker.number.float({ min: 0.01, max: 0.1 }).toString(),
        },
        {
          couponId: 1,
          executionDate: closestDate,
          recordDate: faker.date.recent(),
          rate: faker.number.float({ min: 0.01, max: 0.1 }).toString(),
        },
      ]
      mockBond.getAllCoupons.mockResolvedValue(mockCoupons)

      const result = await repository.getAllDistributionsByAsset(bondAsset)

      expect(result).toHaveLength(2)
      expect((result[0].details as CorporateActionDetails).executionDate).toEqual(closestDate)
      expect((result[0].details as any).corporateActionId.value).toBe("1")
      expect((result[1].details as CorporateActionDetails).executionDate).toEqual(furtherDate)
      expect((result[1].details as any).corporateActionId.value).toBe("2")
    })

    it("should return empty array when no future coupons exist", async () => {
      const now = new Date()
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const mockCoupons = [
        {
          couponId: 1,
          executionDate: pastDate,
          recordDate: faker.date.recent(),
          rate: faker.number.float({ min: 0.01, max: 0.1 }).toString(),
        },
      ]
      mockBond.getAllCoupons.mockResolvedValue(mockCoupons)

      const result = await repository.getAllDistributionsByAsset(bondAsset)

      expect(result).toEqual([])
    })

    it("should return empty array when no coupons exist", async () => {
      mockBond.getAllCoupons.mockResolvedValue([])

      const result = await repository.getAllDistributionsByAsset(bondAsset)

      expect(result).toEqual([])
    })

    it("should filter out past coupons and return only the closest future one", async () => {
      const now = new Date()
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const closestFutureDate = new Date(now.getTime() + 12 * 60 * 60 * 1000)
      const furtherFutureDate = new Date(now.getTime() + 48 * 60 * 60 * 1000)

      const mockCoupons = [
        {
          couponId: 1,
          executionDate: pastDate,
          recordDate: faker.date.recent(),
          rate: faker.number.float({ min: 0.01, max: 0.1 }).toString(),
        },
        {
          couponId: 3,
          executionDate: furtherFutureDate,
          recordDate: faker.date.recent(),
          rate: faker.number.float({ min: 0.01, max: 0.1 }).toString(),
        },
        {
          couponId: 2,
          executionDate: closestFutureDate,
          recordDate: faker.date.recent(),
          rate: faker.number.float({ min: 0.01, max: 0.1 }).toString(),
        },
      ]
      mockBond.getAllCoupons.mockResolvedValue(mockCoupons)

      const result = await repository.getAllDistributionsByAsset(bondAsset)

      expect(result).toHaveLength(2)
      expect((result[0].details as CorporateActionDetails).executionDate).toEqual(closestFutureDate)
      expect((result[0].details as any).corporateActionId.value).toBe("2")
      expect((result[1].details as CorporateActionDetails).executionDate).toEqual(furtherFutureDate)
      expect((result[1].details as any).corporateActionId.value).toBe("3")
    })
  })

  describe("getDividendsForAsset (EQUITY)", () => {
    it("should return all future dividends when multiple future dividends exist", async () => {
      const now = new Date()
      const closestDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const furtherDate = new Date(now.getTime() + 48 * 60 * 60 * 1000)

      const mockDividends = [
        {
          dividendId: 2,
          executionDate: furtherDate,
          amountPerUnitOfSecurity: faker.number.float({ min: 1, max: 100 }).toString(),
          recordDate: faker.date.recent(),
        },
        {
          dividendId: 1,
          executionDate: closestDate,
          amountPerUnitOfSecurity: faker.number.float({ min: 1, max: 100 }).toString(),
          recordDate: faker.date.recent(),
        },
      ]
      mockEquity.getAllDividends.mockResolvedValue(mockDividends)

      const result = await repository.getAllDistributionsByAsset(equityAsset)

      expect(result).toHaveLength(2)
      expect((result[0].details as CorporateActionDetails).executionDate).toEqual(closestDate)
      expect((result[0].details as any).corporateActionId.value).toBe("1")
      expect((result[1].details as CorporateActionDetails).executionDate).toEqual(furtherDate)
      expect((result[1].details as any).corporateActionId.value).toBe("2")
    })

    it("should return empty array when no future dividends exist", async () => {
      const now = new Date()
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const mockDividends = [
        {
          dividendId: 1,
          executionDate: pastDate,
          amountPerUnitOfSecurity: faker.number.float({ min: 1, max: 100 }).toString(),
          recordDate: faker.date.recent(),
        },
      ]
      mockEquity.getAllDividends.mockResolvedValue(mockDividends)

      const result = await repository.getAllDistributionsByAsset(equityAsset)

      expect(result).toEqual([])
    })

    it("should return empty array when no dividends exist", async () => {
      mockEquity.getAllDividends.mockResolvedValue([])

      const result = await repository.getAllDistributionsByAsset(equityAsset)

      expect(result).toEqual([])
    })

    it("should filter out past dividends and return only the closest future one", async () => {
      const now = new Date()
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const closestFutureDate = new Date(now.getTime() + 12 * 60 * 60 * 1000)
      const furtherFutureDate = new Date(now.getTime() + 48 * 60 * 60 * 1000)

      const mockDividends = [
        {
          dividendId: 1,
          executionDate: pastDate,
          amountPerUnitOfSecurity: faker.number.float({ min: 1, max: 100 }).toString(),
          recordDate: faker.date.recent(),
        },
        {
          dividendId: 3,
          executionDate: furtherFutureDate,
          amountPerUnitOfSecurity: faker.number.float({ min: 1, max: 100 }).toString(),
          recordDate: faker.date.recent(),
        },
        {
          dividendId: 2,
          executionDate: closestFutureDate,
          amountPerUnitOfSecurity: faker.number.float({ min: 1, max: 100 }).toString(),
          recordDate: faker.date.recent(),
        },
      ]
      mockEquity.getAllDividends.mockResolvedValue(mockDividends)

      const result = await repository.getAllDistributionsByAsset(equityAsset)

      expect(result).toHaveLength(2)
      expect((result[0].details as CorporateActionDetails).executionDate).toEqual(closestFutureDate)
      expect((result[0].details as any).corporateActionId.value).toBe("2")
      expect((result[1].details as CorporateActionDetails).executionDate).toEqual(furtherFutureDate)
      expect((result[1].details as any).corporateActionId.value).toBe("3")
    })
  })

  describe("getHoldersCountForCorporateActionId", () => {
    it("should return holders count for BOND corporate action distribution", async () => {
      const corporateActionId = CorporateActionId.create(faker.string.numeric())
      const distribution = DistributionUtils.newInstance({
        asset: bondAsset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId,
          executionDate: faker.date.future(),
        },
      })
      const expectedCount = 250
      mockBond.getTotalCouponHolders.mockResolvedValue(expectedCount)

      const result = await repository.getHoldersCountForCorporateActionId(distribution)

      expect(result).toBe(expectedCount)
    })

    it("should return holders count for EQUITY corporate action distribution", async () => {
      const corporateActionId = CorporateActionId.create(faker.string.numeric())
      const distribution = DistributionUtils.newInstance({
        asset: equityAsset,
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId,
          executionDate: faker.date.future(),
        },
      })
      const expectedCount = 180
      mockEquity.getTotalDividendHolders.mockResolvedValue(expectedCount)

      const result = await repository.getHoldersCountForCorporateActionId(distribution)

      expect(result).toBe(expectedCount)
    })

    it("should throw error for non-corporate action distribution", async () => {
      const snapshotId = SnapshotId.create(faker.string.numeric())
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          snapshotId,
          subtype: PayoutSubtype.IMMEDIATE,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })

      await expect(repository.getHoldersCountForCorporateActionId(distribution)).rejects.toThrow(
        `Distribution ${distribution.id} is not a corporate action distribution`,
      )
    })
  })

  describe("getHoldersCountForSnapshotId", () => {
    it("should return holders count for payout distribution with snapshot", async () => {
      const snapshotId = SnapshotId.create(faker.string.numeric())
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          snapshotId,
          subtype: PayoutSubtype.IMMEDIATE,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })
      const expectedCount = 320
      mockSecurity.getTotalTokenHoldersAtSnapshot.mockResolvedValue(expectedCount)

      const result = await repository.getHoldersCountForSnapshotId(distribution)

      expect(result).toBe(expectedCount)
    })

    it("should throw error for non-payout distribution", async () => {
      const corporateActionId = CorporateActionId.create(faker.string.numeric())
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.CORPORATE_ACTION,
          corporateActionId,
          executionDate: faker.date.future(),
        },
      })

      await expect(repository.getHoldersCountForSnapshotId(distribution)).rejects.toThrow(
        `Distribution ${distribution.id} is not a payout distribution`,
      )
    })

    it("should throw error for payout distribution without snapshotId", async () => {
      const snapshotId = SnapshotId.create(faker.string.numeric())
      const distribution = DistributionUtils.newInstance({
        details: {
          type: DistributionType.PAYOUT,
          snapshotId,
          subtype: PayoutSubtype.IMMEDIATE,
          amount: faker.number.int({ min: 1, max: 1000 }).toString(),
          amountType: AmountType.FIXED,
        },
      })
      ;(distribution.details as any).snapshotId = undefined

      await expect(repository.getHoldersCountForSnapshotId(distribution)).rejects.toThrow(
        `SnapshotId is missing for distribution ${distribution.id}`,
      )
    })
  })
})
