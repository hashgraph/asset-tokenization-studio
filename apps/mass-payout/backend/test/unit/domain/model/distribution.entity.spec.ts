// SPDX-License-Identifier: Apache-2.0

import {
  DistributionAssetIdMissingError,
  DistributionExecutionDateInPastError,
  DistributionExecutionDateMissingError,
  DistributionRecurrencyMissingError,
} from "@domain/errors/distribution.error"
import { BaseEntityInvalidDatesError } from "@domain/errors/shared/base-entity-invalid-dates.error"
import { Asset } from "@domain/model/asset"
import {
  AmountType,
  Distribution,
  DistributionStatus,
  DistributionType,
  PayoutSubtype,
  Recurrency,
} from "@domain/model/distribution"
import { CorporateActionId } from "@domain/model/value-objects/corporate-action-id"
import { SnapshotId } from "@domain/model/value-objects/snapshot-id"
import { faker } from "@faker-js/faker"
import { AssetUtils } from "@test/shared/asset.utils"

describe(Distribution.name, () => {
  describe("createCorporateAction", () => {
    it("should create a Corporate Action Distribution", () => {
      const asset = AssetUtils.newInstance()
      const executionDate = faker.date.future()
      const corporateActionIdValue = faker.string.alpha({ length: 10 })
      const corporateActionId = CorporateActionId.create(corporateActionIdValue)
      const status = faker.helpers.objectValue(DistributionStatus)
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })

      const distribution = Distribution.createCorporateAction(
        asset,
        corporateActionId,
        executionDate,
        status,
        createdAt,
        updatedAt,
      )

      expect(distribution).toBeInstanceOf(Distribution)
      expect(distribution.id).toBeDefined()
      expect(distribution.asset).toBe(asset)
      expect(distribution.details.type).toBe(DistributionType.CORPORATE_ACTION)
      expect((distribution.details as any).corporateActionId).toBe(corporateActionId)
      expect((distribution.details as any).executionDate).toBe(executionDate)
      expect(distribution.status).toBe(status)
      expect(distribution.createdAt).toBe(createdAt)
      expect(distribution.updatedAt).toBe(updatedAt)
    })

    it(
      "should create a Corporate Action Distribution with default " +
        "values when optional parameters are not provided",
      () => {
        const asset = AssetUtils.newInstance()
        const corporateActionIdValue = faker.string.alpha({ length: 10 })
        const corporateActionId = CorporateActionId.create(corporateActionIdValue)
        const executionDate = faker.date.future()

        const distribution = Distribution.createCorporateAction(asset, corporateActionId, executionDate)

        expect(distribution).toBeInstanceOf(Distribution)
        expect(distribution.id).toBeDefined()
        expect(distribution.asset).toBe(asset)
        expect(distribution.details.type).toBe(DistributionType.CORPORATE_ACTION)
        expect((distribution.details as any).corporateActionId).toBe(corporateActionId)
        expect((distribution.details as any).executionDate).toBe(executionDate)
        expect(distribution.status).toBe(DistributionStatus.SCHEDULED)
        expect(distribution.createdAt.getTime()).toBe(distribution.updatedAt.getTime())
      },
    )

    it("should fail if createdAt is after updatedAt", () => {
      const asset = AssetUtils.newInstance()
      const executionDate = faker.date.future()
      const status = faker.helpers.objectValue(DistributionStatus)
      const corporateActionIdValue = faker.string.alpha({ length: 10 })
      const corporateActionId = CorporateActionId.create(corporateActionIdValue)
      const createdAt = faker.date.future()
      const updatedAt = faker.date.past()
      let error: Error

      try {
        Distribution.createCorporateAction(asset, corporateActionId, executionDate, status, createdAt, updatedAt)
      } catch (e) {
        error = e
      }

      expect(error).toBeInstanceOf(BaseEntityInvalidDatesError)
    })

    it("fails when asset is null or undefined", () => {
      const invalidAssets = [null, undefined] as unknown[]
      const corporateActionIdValue = faker.string.alpha({ length: 10 })
      const corporateActionId = CorporateActionId.create(corporateActionIdValue)
      const executionDate = faker.date.future()

      invalidAssets.forEach((invalidAsset) => {
        let error: Error
        try {
          Distribution.createCorporateAction(invalidAsset as Asset, corporateActionId, executionDate)
        } catch (e) {
          error = e as Error
        }
        expect(error).toBeInstanceOf(DistributionAssetIdMissingError)
      })
    })

    it("fails when executionDate is not provided or is in the past", () => {
      const asset = AssetUtils.newInstance()
      const corporateActionIdValue = faker.string.alpha({ length: 10 })
      const corporateActionId = CorporateActionId.create(corporateActionIdValue)
      const pastDate = faker.date.past()
      const invalidDates = [null, undefined, pastDate]

      invalidDates.forEach((invalidDate) => {
        let error: Error
        try {
          Distribution.createCorporateAction(asset, corporateActionId, invalidDate as Date)
        } catch (e) {
          error = e
        }
        if (invalidDate === null || invalidDate === undefined) {
          expect(error).toBeInstanceOf(DistributionExecutionDateMissingError)
        } else {
          expect(error).toBeInstanceOf(DistributionExecutionDateInPastError)
        }
      })
    })
  })

  describe("createImmediate", () => {
    it("should create a Payout Distribution", () => {
      const asset = AssetUtils.newInstance()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)
      const status = faker.helpers.objectValue(DistributionStatus)
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })
      const concept = faker.string.alpha({ length: 10 })

      const distribution = Distribution.createImmediate(
        asset,
        amount,
        amountType,
        snapshotId,
        status,
        concept,
        createdAt,
        updatedAt,
      )

      expect(distribution).toBeInstanceOf(Distribution)
      expect(distribution.id).toBeDefined()
      expect(distribution.asset).toBe(asset)
      expect(distribution.details.type).toBe(DistributionType.PAYOUT)
      expect((distribution.details as any).snapshotId).toBe(snapshotId)
      expect((distribution.details as any).subtype).toBe(PayoutSubtype.IMMEDIATE)
      expect((distribution.details as any).amount).toBe(amount)
      expect((distribution.details as any).amountType).toBe(amountType)
      expect((distribution.details as any).concept).toBe(concept)
      expect(distribution.status).toBe(status)
      expect(distribution.createdAt).toBe(createdAt)
      expect(distribution.updatedAt).toBe(updatedAt)
    })

    it("should create a Payout Distribution with default values when optional parameters are not provided", () => {
      const asset = AssetUtils.newInstance()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)

      const distribution = Distribution.createImmediate(asset, amount, amountType, snapshotId)

      expect(distribution).toBeInstanceOf(Distribution)
      expect(distribution.id).toBeDefined()
      expect(distribution.asset).toBe(asset)
      expect(distribution.details.type).toBe(DistributionType.PAYOUT)
      expect((distribution.details as any).snapshotId).toBe(snapshotId)
      expect((distribution.details as any).subtype).toBe(PayoutSubtype.IMMEDIATE)
      expect((distribution.details as any).amount).toBe(amount)
      expect((distribution.details as any).amountType).toBe(amountType)
      expect(distribution.status).toBe(DistributionStatus.SCHEDULED)
      expect(distribution.createdAt.getTime()).toBe(distribution.updatedAt.getTime())
    })

    it("fails when asset is null or undefined", () => {
      const invalidAssets = [null, undefined] as unknown[]
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)

      invalidAssets.forEach((invalidAsset) => {
        let error: Error
        try {
          Distribution.createImmediate(invalidAsset as Asset, amount, amountType, snapshotId)
        } catch (e) {
          error = e as Error
        }
        expect(error).toBeInstanceOf(DistributionAssetIdMissingError)
      })
    })
  })

  describe("createExistingCorporateAction", () => {
    it("should recreate a Corporate Action Distribution with all provided valid data", () => {
      const id = faker.string.uuid()
      const asset = AssetUtils.newInstance()
      const corporateActionIdValue = faker.string.alpha({ length: 10 })
      const corporateActionId = CorporateActionId.create(corporateActionIdValue)
      const executionDate = faker.date.future()
      const status = faker.helpers.objectValue(DistributionStatus)
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })

      const distribution = Distribution.createExistingCorporateAction(
        id,
        asset,
        corporateActionId,
        executionDate,
        status,
        createdAt,
        updatedAt,
      )

      expect(distribution).toBeInstanceOf(Distribution)
      expect(distribution.id).toBe(id)
      expect(distribution.asset).toBe(asset)
      expect(distribution.details.type).toBe(DistributionType.CORPORATE_ACTION)
      expect((distribution.details as any).corporateActionId).toBe(corporateActionId)
      expect((distribution.details as any).executionDate).toBe(executionDate)
      expect(distribution.status).toBe(status)
      expect(distribution.createdAt).toBe(createdAt)
      expect(distribution.updatedAt).toBe(updatedAt)
    })

    it("should fail if createdAt is after updatedAt when recreating from existing data", () => {
      const id = faker.string.uuid()
      const asset = AssetUtils.newInstance()
      const corporateActionIdValue = faker.string.alpha({ length: 10 })
      const corporateActionId = CorporateActionId.create(corporateActionIdValue)
      const executionDate = faker.date.future()
      const status = faker.helpers.objectValue(DistributionStatus)
      const createdAt = faker.date.future()
      const updatedAt = faker.date.past()
      let error: Error

      try {
        Distribution.createExistingCorporateAction(
          id,
          asset,
          corporateActionId,
          executionDate,
          status,
          createdAt,
          updatedAt,
        )
      } catch (e) {
        error = e
      }

      expect(error).toBeInstanceOf(BaseEntityInvalidDatesError)
    })

    it("fails when asset is null or undefined for existing distribution", () => {
      const id = faker.string.uuid()
      const corporateActionIdValue = faker.string.alpha({ length: 10 })
      const corporateActionId = CorporateActionId.create(corporateActionIdValue)
      const invalidAssets = [null, undefined] as unknown[]
      const executionDate = faker.date.past()
      const status = faker.helpers.objectValue(DistributionStatus)
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })

      invalidAssets.forEach((invalidAsset) => {
        let error: Error
        try {
          Distribution.createExistingCorporateAction(
            id,
            invalidAsset as Asset,
            corporateActionId,
            executionDate,
            status,
            createdAt,
            updatedAt,
          )
        } catch (e) {
          error = e as Error
        }
        expect(error).toBeInstanceOf(DistributionAssetIdMissingError)
      })
    })

    it("fails when executionDate is not provided for existing distribution", () => {
      const id = faker.string.uuid()
      const asset = AssetUtils.newInstance()
      const corporateActionIdValue = faker.string.alpha({ length: 10 })
      const corporateActionId = CorporateActionId.create(corporateActionIdValue)
      const status = faker.helpers.objectValue(DistributionStatus)
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })
      const invalidDates = [null, undefined]

      invalidDates.forEach((invalidDate) => {
        let error: Error
        try {
          Distribution.createExistingCorporateAction(
            id,
            asset,
            corporateActionId,
            invalidDate as Date,
            status,
            createdAt,
            updatedAt,
          )
        } catch (e) {
          error = e as Error
        }
        expect(error).toBeInstanceOf(DistributionExecutionDateMissingError)
      })
    })
  })

  describe("createExistingImmediate", () => {
    it("should recreate a Payout Distribution with all provided valid data", () => {
      const id = faker.string.uuid()
      const asset = AssetUtils.newInstance()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)
      const status = faker.helpers.objectValue(DistributionStatus)
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })
      const concept = faker.string.alpha({ length: 10 })

      const distribution = Distribution.createExistingImmediate(
        id,
        asset,
        snapshotId,
        status,
        createdAt,
        updatedAt,
        amount,
        amountType,
        concept,
      )

      expect(distribution).toBeInstanceOf(Distribution)
      expect(distribution.id).toBe(id)
      expect(distribution.asset).toBe(asset)
      expect(distribution.details.type).toBe(DistributionType.PAYOUT)
      expect((distribution.details as any).snapshotId).toBe(snapshotId)
      expect((distribution.details as any).amount).toBe(amount)
      expect((distribution.details as any).amountType).toBe(amountType)
      expect((distribution.details as any).concept).toBe(concept)
      expect(distribution.status).toBe(status)
      expect(distribution.createdAt).toBe(createdAt)
      expect(distribution.updatedAt).toBe(updatedAt)
    })

    it("fails when asset is null or undefined for existing payout distribution", () => {
      const id = faker.string.uuid()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)
      const invalidAssets = [null, undefined] as unknown[]
      const status = faker.helpers.objectValue(DistributionStatus)
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })
      const concept = faker.string.alpha({ length: 10 })

      invalidAssets.forEach((invalidAsset) => {
        let error: Error
        try {
          Distribution.createExistingImmediate(
            id,
            invalidAsset as Asset,
            snapshotId,
            status,
            createdAt,
            updatedAt,
            amount,
            amountType,
            concept,
          )
        } catch (e) {
          error = e as Error
        }
        expect(error).toBeInstanceOf(DistributionAssetIdMissingError)
      })
    })
  })

  describe("updateExecutionDate", () => {
    it("should update execution date for corporate action distribution", () => {
      const asset = AssetUtils.newInstance()
      const corporateActionIdValue = faker.string.alpha({ length: 10 })
      const corporateActionId = CorporateActionId.create(corporateActionIdValue)
      const originalExecutionDate = faker.date.future()
      const newExecutionDate = faker.date.future({ years: 2 })

      const distribution = Distribution.createCorporateAction(asset, corporateActionId, originalExecutionDate)
      const originalUpdatedAt = distribution.updatedAt.getTime()

      const updatedDistribution = distribution.updateExecutionDate(newExecutionDate)

      expect(updatedDistribution).toBeInstanceOf(Distribution)
      expect(updatedDistribution.id).toBe(distribution.id)
      expect((updatedDistribution.details as any).executionDate).toBe(newExecutionDate)
      expect(updatedDistribution.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt)
    })

    it("should fail when trying to update execution date for payout distribution", () => {
      const asset = AssetUtils.newInstance()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)
      const newExecutionDate = faker.date.future()

      const distribution = Distribution.createImmediate(asset, amount, amountType, snapshotId)
      let error: Error

      try {
        distribution.updateExecutionDate(newExecutionDate)
      } catch (e) {
        error = e as Error
      }

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe("Cannot update execution date for non-corporate action distribution")
    })
  })

  describe("updateSnapshotId", () => {
    it("should update snapshotId for payout distribution", () => {
      const asset = AssetUtils.newInstance()
      const originalSnapshotIdValue = faker.string.alpha({ length: 10 })
      const originalSnapshotId = SnapshotId.create(originalSnapshotIdValue)
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)
      const newSnapshotNumber = faker.number.int({ min: 1000, max: 9999 })
      const distribution = Distribution.createImmediate(asset, amount, amountType, originalSnapshotId)
      const originalUpdatedAt = distribution.updatedAt.getTime()

      distribution.updateSnapshotId(newSnapshotNumber)

      expect((distribution.details as any).snapshotId.value).toBe(newSnapshotNumber.toString())
      expect(distribution.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt)
      expect(distribution.id).toBe(distribution.id)
      expect(distribution.asset).toBe(distribution.asset)
      expect(distribution.status).toBe(distribution.status)
      expect(distribution.createdAt).toBe(distribution.createdAt)
      expect(distribution.details.type).toBe(DistributionType.PAYOUT)
    })

    it("should throw error when trying to update snapshotId for corporate action distribution", () => {
      const asset = AssetUtils.newInstance()
      const corporateActionIdValue = faker.string.alpha({ length: 10 })
      const corporateActionId = CorporateActionId.create(corporateActionIdValue)
      const executionDate = faker.date.future()
      const newSnapshotNumber = faker.number.int({ min: 1000, max: 9999 })

      const distribution = Distribution.createCorporateAction(asset, corporateActionId, executionDate)

      expect(() => {
        distribution.updateSnapshotId(newSnapshotNumber)
      }).toThrow("Cannot update snapshot ID for non-payout distribution")
    })
  })

  describe("createOneOff", () => {
    it("should create a One-Off Payout Distribution", () => {
      const asset = AssetUtils.newInstance()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const executeAt = faker.date.future()
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)
      const status = faker.helpers.objectValue(DistributionStatus)
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })
      const concept = faker.string.alpha({ length: 10 })

      const distribution = Distribution.createOneOff(
        asset,
        executeAt,
        amount,
        amountType,
        snapshotId,
        status,
        concept,
        createdAt,
        updatedAt,
      )

      expect(distribution).toBeInstanceOf(Distribution)
      expect(distribution.id).toBeDefined()
      expect(distribution.asset).toBe(asset)
      expect(distribution.details.type).toBe(DistributionType.PAYOUT)
      expect((distribution.details as any).snapshotId).toBe(snapshotId)
      expect((distribution.details as any).subtype).toBe(PayoutSubtype.ONE_OFF)
      expect((distribution.details as any).executeAt).toBe(executeAt)
      expect((distribution.details as any).amount).toBe(amount)
      expect((distribution.details as any).amountType).toBe(amountType)
      expect((distribution.details as any).concept).toBe(concept)
      expect(distribution.status).toBe(status)
      expect(distribution.createdAt).toBe(createdAt)
      expect(distribution.updatedAt).toBe(updatedAt)
    })

    it(
      "should create a One-Off Payout Distribution with default values when " + "optional parameters are not provided",
      () => {
        const asset = AssetUtils.newInstance()
        const snapshotIdValue = faker.string.alpha({ length: 10 })
        const snapshotId = SnapshotId.create(snapshotIdValue)
        const executeAt = faker.date.future()
        const amount = faker.number.int({ min: 1, max: 1000 }).toString()
        const amountType = faker.helpers.objectValue(AmountType)

        const distribution = Distribution.createOneOff(asset, executeAt, amount, amountType, snapshotId)

        expect(distribution).toBeInstanceOf(Distribution)
        expect(distribution.id).toBeDefined()
        expect(distribution.asset).toBe(asset)
        expect(distribution.details.type).toBe(DistributionType.PAYOUT)
        expect((distribution.details as any).snapshotId).toBe(snapshotId)
        expect((distribution.details as any).subtype).toBe(PayoutSubtype.ONE_OFF)
        expect((distribution.details as any).executeAt).toBe(executeAt)
        expect((distribution.details as any).amount).toBe(amount)
        expect((distribution.details as any).amountType).toBe(amountType)
        expect(distribution.status).toBe(DistributionStatus.SCHEDULED)
        expect(distribution.createdAt.getTime()).toBe(distribution.updatedAt.getTime())
      },
    )

    it("fails when asset is null or undefined", () => {
      const invalidAssets = [null, undefined] as unknown[]
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const executeAt = faker.date.future()
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)

      invalidAssets.forEach((invalidAsset) => {
        let error: Error
        try {
          Distribution.createOneOff(invalidAsset as Asset, executeAt, amount, amountType, snapshotId)
        } catch (e) {
          error = e as Error
        }
        expect(error).toBeInstanceOf(DistributionAssetIdMissingError)
      })
    })

    it("fails when executeAt is not provided or is in the past", () => {
      const asset = AssetUtils.newInstance()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const pastDate = faker.date.past()
      const invalidDates = [null, undefined, pastDate]
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)

      invalidDates.forEach((invalidDate) => {
        let error: Error
        try {
          Distribution.createOneOff(asset, invalidDate as Date, amount, amountType, snapshotId)
        } catch (e) {
          error = e
        }
        if (invalidDate === null || invalidDate === undefined) {
          expect(error).toBeInstanceOf(DistributionExecutionDateMissingError)
        } else {
          expect(error).toBeInstanceOf(DistributionExecutionDateInPastError)
        }
      })
    })
  })

  describe("createExistingOneOff", () => {
    it("should recreate a One-Off Payout Distribution with all provided valid data", () => {
      const id = faker.string.uuid()
      const asset = AssetUtils.newInstance()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const executeAt = faker.date.future()
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)
      const status = faker.helpers.objectValue(DistributionStatus)
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })
      const concept = faker.string.alpha({ length: 10 })

      const distribution = Distribution.createExistingOneOff(
        id,
        asset,
        snapshotId,
        executeAt,
        status,
        amount,
        amountType,
        createdAt,
        updatedAt,
        concept,
      )

      expect(distribution).toBeInstanceOf(Distribution)
      expect(distribution.id).toBe(id)
      expect(distribution.asset).toBe(asset)
      expect(distribution.details.type).toBe(DistributionType.PAYOUT)
      expect((distribution.details as any).snapshotId).toBe(snapshotId)
      expect((distribution.details as any).subtype).toBe(PayoutSubtype.ONE_OFF)
      expect((distribution.details as any).executeAt).toBe(executeAt)
      expect((distribution.details as any).amount).toBe(amount)
      expect((distribution.details as any).amountType).toBe(amountType)
      expect((distribution.details as any).concept).toBe(concept)
      expect(distribution.status).toBe(status)
      expect(distribution.createdAt).toBe(createdAt)
      expect(distribution.updatedAt).toBe(updatedAt)
    })

    it("fails when asset is null or undefined for existing one-off distribution", () => {
      const id = faker.string.uuid()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const invalidAssets = [null, undefined] as unknown[]
      const executeAt = faker.date.future()
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)
      const status = faker.helpers.objectValue(DistributionStatus)
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })

      invalidAssets.forEach((invalidAsset) => {
        let error: Error
        try {
          Distribution.createExistingOneOff(
            id,
            invalidAsset as Asset,
            snapshotId,
            executeAt,
            status,
            amount,
            amountType,
            createdAt,
            updatedAt,
          )
        } catch (e) {
          error = e as Error
        }
        expect(error).toBeInstanceOf(DistributionAssetIdMissingError)
      })
    })

    it("fails when executeAt is not provided for existing one-off distribution", () => {
      const id = faker.string.uuid()
      const asset = AssetUtils.newInstance()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)
      const status = faker.helpers.objectValue(DistributionStatus)
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })
      const invalidDates = [null, undefined]
      const concept = faker.string.alpha({ length: 10 })

      invalidDates.forEach((invalidDate) => {
        let error: Error
        try {
          Distribution.createExistingOneOff(
            id,
            asset,
            snapshotId,
            invalidDate as Date,
            status,
            amount,
            amountType,
            createdAt,
            updatedAt,
            concept,
          )
        } catch (e) {
          error = e as Error
        }
        expect(error).toBeInstanceOf(DistributionExecutionDateMissingError)
      })
    })
  })

  describe("createRecurring", () => {
    it("should create a Recurring Payout Distribution", () => {
      const asset = AssetUtils.newInstance()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const executeAt = faker.date.future()
      const recurrency = faker.helpers.objectValue(Recurrency)
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)
      const status = faker.helpers.objectValue(DistributionStatus)
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })
      const concept = faker.string.alpha({ length: 10 })

      const distribution = Distribution.createRecurring(
        asset,
        executeAt,
        recurrency,
        amount,
        amountType,
        snapshotId,
        status,
        concept,
        createdAt,
        updatedAt,
      )

      expect(distribution).toBeInstanceOf(Distribution)
      expect(distribution.id).toBeDefined()
      expect(distribution.asset).toBe(asset)
      expect(distribution.details.type).toBe(DistributionType.PAYOUT)
      expect((distribution.details as any).snapshotId).toBe(snapshotId)
      expect((distribution.details as any).subtype).toBe(PayoutSubtype.RECURRING)
      expect((distribution.details as any).amount).toBe(amount)
      expect((distribution.details as any).amountType).toBe(amountType)
      expect((distribution.details as any).executeAt).toBe(executeAt)
      expect((distribution.details as any).recurrency).toBe(recurrency)
      expect((distribution.details as any).concept).toBe(concept)
      expect(distribution.status).toBe(status)
      expect(distribution.createdAt).toBe(createdAt)
      expect(distribution.updatedAt).toBe(updatedAt)
    })

    it(
      "should create a Recurring Payout Distribution with default values when " +
        "optional parameters are not provided",
      () => {
        const asset = AssetUtils.newInstance()
        const snapshotIdValue = faker.string.alpha({ length: 10 })
        const snapshotId = SnapshotId.create(snapshotIdValue)
        const executeAt = faker.date.future()
        const recurrency = faker.helpers.objectValue(Recurrency)
        const amount = faker.number.int({ min: 1, max: 1000 }).toString()
        const amountType = faker.helpers.objectValue(AmountType)

        const distribution = Distribution.createRecurring(asset, executeAt, recurrency, amount, amountType, snapshotId)

        expect(distribution).toBeInstanceOf(Distribution)
        expect(distribution.id).toBeDefined()
        expect(distribution.asset).toBe(asset)
        expect(distribution.details.type).toBe(DistributionType.PAYOUT)
        expect((distribution.details as any).snapshotId).toBe(snapshotId)
        expect((distribution.details as any).subtype).toBe(PayoutSubtype.RECURRING)
        expect((distribution.details as any).amount).toBe(amount)
        expect((distribution.details as any).amountType).toBe(amountType)
        expect((distribution.details as any).executeAt).toBe(executeAt)
        expect((distribution.details as any).recurrency).toBe(recurrency)
        expect(distribution.status).toBe(DistributionStatus.SCHEDULED)
        expect(distribution.createdAt.getTime()).toBe(distribution.updatedAt.getTime())
      },
    )

    it("should create next Recurring Payout Distribution", () => {
      const asset = AssetUtils.newInstance()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const executeAt = new Date(2050, 1, 1, 0, 0, 0)
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)
      const concept = faker.string.alpha({ length: 10 })

      const distributionData = [
        {
          distribution: Distribution.createRecurring(
            asset,
            executeAt,
            Recurrency.HOURLY,
            amount,
            amountType,
            snapshotId,
            undefined,
            concept,
          ),
          nextDate: new Date(2050, 1, 1, 1, 0, 0),
        },
        {
          distribution: Distribution.createRecurring(
            asset,
            executeAt,
            Recurrency.DAILY,
            amount,
            amountType,
            snapshotId,
            undefined,
            concept,
          ),
          nextDate: new Date(2050, 1, 2, 0, 0, 0),
        },
        {
          distribution: Distribution.createRecurring(
            asset,
            executeAt,
            Recurrency.WEEKLY,
            amount,
            amountType,
            snapshotId,
            undefined,
            concept,
          ),
          nextDate: new Date(2050, 1, 8, 0, 0, 0),
        },
        {
          distribution: Distribution.createRecurring(
            asset,
            executeAt,
            Recurrency.MONTHLY,
            amount,
            amountType,
            snapshotId,
            undefined,
            concept,
          ),
          nextDate: new Date(2050, 2, 1, 0, 0, 0),
        },
      ]

      distributionData.forEach((data) => {
        const nextRecurringDistribution: Distribution = data.distribution.createNextRecurring()
        expect(nextRecurringDistribution).toBeInstanceOf(Distribution)
        expect(nextRecurringDistribution.id).toBeDefined()
        expect(nextRecurringDistribution.asset).toBe(asset)
        expect(nextRecurringDistribution.details.type).toBe(DistributionType.PAYOUT)
        expect((nextRecurringDistribution.details as any).snapshotId).toBeUndefined()
        expect((nextRecurringDistribution.details as any).subtype).toBe(PayoutSubtype.RECURRING)
        expect((nextRecurringDistribution.details as any).amount).toBe(amount)
        expect((nextRecurringDistribution.details as any).amountType).toBe(amountType)
        expect((nextRecurringDistribution.details as any).executeAt).toStrictEqual(data.nextDate)
        expect((nextRecurringDistribution.details as any).recurrency).toBe(
          (data.distribution.details as any).recurrency,
        )
        expect((nextRecurringDistribution.details as any).concept).toBe(concept)
        expect(nextRecurringDistribution.status).toBe(DistributionStatus.SCHEDULED)
        expect(nextRecurringDistribution.createdAt.getTime()).toBe(nextRecurringDistribution.updatedAt.getTime())
      })
    })

    it("fails when asset is null or undefined", () => {
      const invalidAssets = [null, undefined] as unknown[]
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const executeAt = faker.date.future()
      const recurrency = faker.helpers.objectValue(Recurrency)
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)

      invalidAssets.forEach((invalidAsset) => {
        let error: Error
        try {
          Distribution.createRecurring(invalidAsset as Asset, executeAt, recurrency, amount, amountType, snapshotId)
        } catch (e) {
          error = e as Error
        }
        expect(error).toBeInstanceOf(DistributionAssetIdMissingError)
      })
    })

    it("fails when executeAt is not provided or is in the past", () => {
      const asset = AssetUtils.newInstance()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const pastDate = faker.date.past()
      const recurrency = faker.helpers.objectValue(Recurrency)
      const invalidDates = [null, undefined, pastDate]
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)

      invalidDates.forEach((invalidDate) => {
        let error: Error
        try {
          Distribution.createRecurring(asset, invalidDate as Date, recurrency, amount, amountType, snapshotId)
        } catch (e) {
          error = e
        }
        if (invalidDate === null || invalidDate === undefined) {
          expect(error).toBeInstanceOf(DistributionExecutionDateMissingError)
        } else {
          expect(error).toBeInstanceOf(DistributionExecutionDateInPastError)
        }
      })
    })

    it("fails when recurrency is not provided", () => {
      const asset = AssetUtils.newInstance()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const executeAt = faker.date.future()
      const invalidRecurrencies = [null, undefined]
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)

      invalidRecurrencies.forEach((invalidRecurrency) => {
        let error: Error
        try {
          Distribution.createRecurring(
            asset,
            executeAt,
            invalidRecurrency as Recurrency,
            amount,
            amountType,
            snapshotId,
          )
        } catch (e) {
          error = e
        }
        expect(error).toBeInstanceOf(DistributionRecurrencyMissingError)
      })
    })
  })

  describe("createExistingRecurring", () => {
    it("should create a Recurring Payout Distribution", () => {
      const id = faker.string.uuid()
      const asset = AssetUtils.newInstance()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const executeAt = faker.date.future()
      const recurrency = faker.helpers.objectValue(Recurrency)
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)
      const status = faker.helpers.objectValue(DistributionStatus)
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })
      const concept = faker.string.alpha({ length: 10 })

      const distribution = Distribution.createExistingRecurring(
        id,
        asset,
        executeAt,
        recurrency,
        amount,
        amountType,
        snapshotId,
        status,
        createdAt,
        updatedAt,
        concept,
      )

      expect(distribution).toBeInstanceOf(Distribution)
      expect(distribution.id).toBeDefined()
      expect(distribution.asset).toBe(asset)
      expect(distribution.details.type).toBe(DistributionType.PAYOUT)
      expect((distribution.details as any).snapshotId).toBe(snapshotId)
      expect((distribution.details as any).subtype).toBe(PayoutSubtype.RECURRING)
      expect((distribution.details as any).amount).toBe(amount)
      expect((distribution.details as any).amountType).toBe(amountType)
      expect((distribution.details as any).executeAt).toBe(executeAt)
      expect((distribution.details as any).recurrency).toBe(recurrency)
      expect(distribution.status).toBe(status)
      expect(distribution.createdAt).toBe(createdAt)
      expect(distribution.updatedAt).toBe(updatedAt)
    })

    it(
      "should create a Recurring Payout Distribution with default values when " +
        "optional parameters are not provided",
      () => {
        const id = faker.string.uuid()
        const asset = AssetUtils.newInstance()
        const snapshotIdValue = faker.string.alpha({ length: 10 })
        const snapshotId = SnapshotId.create(snapshotIdValue)
        const executeAt = faker.date.future()
        const recurrency = faker.helpers.objectValue(Recurrency)
        const amount = faker.number.int({ min: 1, max: 1000 }).toString()
        const amountType = faker.helpers.objectValue(AmountType)

        const distribution = Distribution.createExistingRecurring(
          id,
          asset,
          executeAt,
          recurrency,
          amount,
          amountType,
          snapshotId,
        )

        expect(distribution).toBeInstanceOf(Distribution)
        expect(distribution.id).toBeDefined()
        expect(distribution.asset).toBe(asset)
        expect(distribution.details.type).toBe(DistributionType.PAYOUT)
        expect((distribution.details as any).snapshotId).toBe(snapshotId)
        expect((distribution.details as any).subtype).toBe(PayoutSubtype.RECURRING)
        expect((distribution.details as any).amount).toBe(amount)
        expect((distribution.details as any).amountType).toBe(amountType)
        expect((distribution.details as any).executeAt).toBe(executeAt)
        expect((distribution.details as any).recurrency).toBe(recurrency)
        expect(distribution.status).toBe(DistributionStatus.SCHEDULED)
        expect(distribution.createdAt.getTime()).toBe(distribution.updatedAt.getTime())
      },
    )

    it("fails when asset is null or undefined", () => {
      const id = faker.string.uuid()
      const invalidAssets = [null, undefined] as unknown[]
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const executeAt = faker.date.future()
      const recurrency = faker.helpers.objectValue(Recurrency)
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)

      invalidAssets.forEach((invalidAsset) => {
        let error: Error
        try {
          Distribution.createExistingRecurring(
            id,
            invalidAsset as Asset,
            executeAt,
            recurrency,
            amount,
            amountType,
            snapshotId,
          )
        } catch (e) {
          error = e as Error
        }
        expect(error).toBeInstanceOf(DistributionAssetIdMissingError)
      })
    })

    it("fails when executeAt is not provided", () => {
      const id = faker.string.uuid()
      const asset = AssetUtils.newInstance()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const recurrency = faker.helpers.objectValue(Recurrency)
      const invalidDates = [null, undefined]
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)

      invalidDates.forEach((invalidDate) => {
        let error: Error
        try {
          Distribution.createExistingRecurring(
            id,
            asset,
            invalidDate as Date,
            recurrency,
            amount,
            amountType,
            snapshotId,
          )
        } catch (e) {
          error = e
        }
        expect(error).toBeInstanceOf(DistributionExecutionDateMissingError)
      })
    })

    it("fails when recurrency is not provided", () => {
      const id = faker.string.uuid()
      const asset = AssetUtils.newInstance()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const executeAt = faker.date.future()
      const invalidRecurrencies = [null, undefined]
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)

      invalidRecurrencies.forEach((invalidRecurrency) => {
        let error: Error
        try {
          Distribution.createExistingRecurring(
            id,
            asset,
            executeAt,
            invalidRecurrency as Recurrency,
            amount,
            amountType,
            snapshotId,
          )
        } catch (e) {
          error = e
        }
        expect(error).toBeInstanceOf(DistributionRecurrencyMissingError)
      })
    })
  })

  describe("createAutomated", () => {
    it("should create an Automated Payout Distribution", () => {
      const asset = AssetUtils.newInstance()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)
      const status = faker.helpers.objectValue(DistributionStatus)
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })
      const concept = faker.string.alpha({ length: 10 })

      const distribution = Distribution.createAutomated(
        asset,
        amount,
        amountType,
        concept,
        snapshotId,
        status,
        createdAt,
        updatedAt,
      )

      expect(distribution).toBeInstanceOf(Distribution)
      expect(distribution.id).toBeDefined()
      expect(distribution.asset).toBe(asset)
      expect(distribution.details.type).toBe(DistributionType.PAYOUT)
      expect((distribution.details as any).snapshotId).toBe(snapshotId)
      expect((distribution.details as any).subtype).toBe(PayoutSubtype.AUTOMATED)
      expect((distribution.details as any).amount).toBe(amount)
      expect((distribution.details as any).amountType).toBe(amountType)
      expect((distribution.details as any).concept).toBe(concept)
      expect(distribution.status).toBe(status)
      expect(distribution.createdAt).toBe(createdAt)
      expect(distribution.updatedAt).toBe(updatedAt)
    })

    it(
      "should create an Automated Payout Distribution with default values " +
        "when optional parameters are not provided",
      () => {
        const asset = AssetUtils.newInstance()
        const snapshotIdValue = faker.string.alpha({ length: 10 })
        const snapshotId = SnapshotId.create(snapshotIdValue)
        const executeAt = faker.date.future()
        const amount = faker.number.int({ min: 1, max: 1000 }).toString()
        const amountType = faker.helpers.objectValue(AmountType)

        const distribution = Distribution.createAutomated(asset, amount, amountType, undefined, snapshotId)

        expect(distribution).toBeInstanceOf(Distribution)
        expect(distribution.id).toBeDefined()
        expect(distribution.asset).toBe(asset)
        expect(distribution.details.type).toBe(DistributionType.PAYOUT)
        expect((distribution.details as any).snapshotId).toBe(snapshotId)
        expect((distribution.details as any).subtype).toBe(PayoutSubtype.AUTOMATED)
        expect((distribution.details as any).amount).toBe(amount)
        expect((distribution.details as any).amountType).toBe(amountType)
        expect(distribution.status).toBe(DistributionStatus.SCHEDULED)
        expect(distribution.createdAt.getTime()).toBe(distribution.updatedAt.getTime())
      },
    )

    it("fails when asset is null or undefined", () => {
      const invalidAssets = [null, undefined] as unknown[]
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const executeAt = faker.date.future()
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)

      invalidAssets.forEach((invalidAsset) => {
        let error: Error
        try {
          Distribution.createAutomated(invalidAsset as Asset, amount, amountType, undefined, snapshotId)
        } catch (e) {
          error = e as Error
        }
        expect(error).toBeInstanceOf(DistributionAssetIdMissingError)
      })
    })
  })

  describe("createExistingAutomated", () => {
    it("should recreate a Automated Payout Distribution with all provided valid data", () => {
      const id = faker.string.uuid()
      const asset = AssetUtils.newInstance()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)
      const status = faker.helpers.objectValue(DistributionStatus)
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })
      const concept = faker.string.alpha({ length: 10 })

      const distribution = Distribution.createExistingAutomated(
        id,
        asset,
        amount,
        amountType,
        concept,
        snapshotId,
        status,
        createdAt,
        updatedAt,
      )

      expect(distribution).toBeInstanceOf(Distribution)
      expect(distribution.id).toBe(id)
      expect(distribution.asset).toBe(asset)
      expect(distribution.details.type).toBe(DistributionType.PAYOUT)
      expect((distribution.details as any).snapshotId).toBe(snapshotId)
      expect((distribution.details as any).subtype).toBe(PayoutSubtype.AUTOMATED)
      expect((distribution.details as any).amount).toBe(amount)
      expect((distribution.details as any).amountType).toBe(amountType)
      expect((distribution.details as any).concept).toBe(concept)
      expect(distribution.status).toBe(status)
      expect(distribution.createdAt).toBe(createdAt)
      expect(distribution.updatedAt).toBe(updatedAt)
    })

    it("fails when asset is null or undefined for existing automated distribution", () => {
      const id = faker.string.uuid()
      const snapshotIdValue = faker.string.alpha({ length: 10 })
      const snapshotId = SnapshotId.create(snapshotIdValue)
      const invalidAssets = [null, undefined] as unknown[]
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const amountType = faker.helpers.objectValue(AmountType)
      const status = faker.helpers.objectValue(DistributionStatus)
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })

      invalidAssets.forEach((invalidAsset) => {
        let error: Error
        try {
          Distribution.createExistingAutomated(
            id,
            invalidAsset as Asset,
            amount,
            amountType,
            undefined,
            snapshotId,
            status,
            createdAt,
            updatedAt,
          )
        } catch (e) {
          error = e as Error
        }
        expect(error).toBeInstanceOf(DistributionAssetIdMissingError)
      })
    })
  })
})
