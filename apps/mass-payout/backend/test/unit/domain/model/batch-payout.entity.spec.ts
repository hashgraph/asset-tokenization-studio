// SPDX-License-Identifier: Apache-2.0

import { BatchPayout, BatchPayoutStatus } from "@domain/model/batch-payout"
import { faker } from "@faker-js/faker"
import { fakeHederaTxId } from "@test/shared/utils"
import {
  BatchPayoutDistributionIdMissingError,
  BatchPayoutHederaTransactionIdInvalidError,
  BatchPayoutHederaTransactionHashInvalidError,
  BatchPayoutHoldersNumberInvalidError,
} from "@domain/errors/batch-payout.error"
import { BaseEntityInvalidDatesError } from "@domain/errors/shared/base-entity-invalid-dates.error"
import { Distribution } from "@domain/model/distribution"
import { DistributionUtils } from "@test/shared/distribution.utils"

describe(BatchPayout.name, () => {
  describe("create", () => {
    it("should create a BatchPayout", () => {
      const distribution = DistributionUtils.newInstance()
      const hederaTransactionId = fakeHederaTxId()
      const hederaTransactionHash = `0x${faker.string.hexadecimal({ length: 96, prefix: "" })}`
      const name = faker.string.alpha({ length: 10 })
      const holdersNumber = 10
      const status = BatchPayoutStatus.IN_PROGRESS
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future()

      const batchPayout = BatchPayout.create(
        distribution,
        name,
        hederaTransactionId,
        hederaTransactionHash,
        holdersNumber,
        status,
        createdAt,
        updatedAt,
      )

      expect(batchPayout).toBeInstanceOf(BatchPayout)
      expect(batchPayout.distribution).toBe(distribution)
      expect(batchPayout.hederaTransactionId).toBe(hederaTransactionId)
      expect(batchPayout.hederaTransactionHash).toBe(hederaTransactionHash)
      expect(batchPayout.name).toBe(name)
      expect(batchPayout.holdersNumber).toBe(holdersNumber)
      expect(batchPayout.status).toBe(status)
      expect(batchPayout.createdAt).toBe(createdAt)
      expect(batchPayout.updatedAt).toBe(updatedAt)
    })

    it("auto-fills id & dates when omitted", () => {
      const batch = BatchPayout.create(
        DistributionUtils.newInstance(),
        faker.string.alpha({ length: 10 }),
        fakeHederaTxId(),
        `0x${faker.string.hexadecimal({ length: 96, prefix: "" })}`,
        5,
        BatchPayoutStatus.IN_PROGRESS,
      )

      expect(batch.createdAt.getTime()).toBe(batch.updatedAt.getTime())
    })

    it("creates an existing BatchPayout using createExisting()", () => {
      const id = faker.string.uuid()
      const distribution = DistributionUtils.newInstance()
      const hederaTransactionId = fakeHederaTxId()
      const hederaTransactionHash = `0x${faker.string.hexadecimal({ length: 96, prefix: "" })}`
      const name = faker.string.alpha({ length: 10 })
      const holdersNumber = 20
      const status = BatchPayoutStatus.COMPLETED
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future()

      const batch = BatchPayout.createExisting(
        id,
        distribution,
        name,
        hederaTransactionId,
        hederaTransactionHash,
        holdersNumber,
        status,
        createdAt,
        updatedAt,
      )

      expect(batch.id).toBe(id)
      expect(batch.status).toBe(status)
      expect(batch.name).toBe(name)
      expect(batch.distribution).toBe(distribution)
      expect(batch.hederaTransactionId).toBe(hederaTransactionId)
      expect(batch.hederaTransactionHash).toBe(hederaTransactionHash)
      expect(batch.holdersNumber).toBe(holdersNumber)
      expect(batch.createdAt).toBe(createdAt)
      expect(batch.updatedAt).toBe(updatedAt)
    })

    it("fails when createdAt is after updatedAt", () => {
      const createdAt = faker.date.future()
      const updatedAt = faker.date.past()
      let error: Error

      try {
        BatchPayout.create(
          DistributionUtils.newInstance(),
          faker.string.alpha({ length: 10 }),
          fakeHederaTxId(),
          faker.finance.ethereumAddress(),
          1,
          BatchPayoutStatus.FAILED,
          createdAt,
          updatedAt,
        )
      } catch (e) {
        error = e
      }

      expect(error).toBeInstanceOf(BaseEntityInvalidDatesError)
    })

    it("fails when distribution is empty, null or undefined", () => {
      const invalidDistributions = [null, undefined] as unknown[]

      invalidDistributions.forEach((invalidDistribution) => {
        let error: Error

        try {
          BatchPayout.create(
            invalidDistribution as Distribution,
            faker.string.alpha({ length: 10 }),
            fakeHederaTxId(),
            `0x${faker.string.hexadecimal({ length: 96, prefix: "" })}`,
            1,
            BatchPayoutStatus.FAILED,
          )
        } catch (e) {
          error = e as Error
        }

        expect(error).toBeInstanceOf(BatchPayoutDistributionIdMissingError)
      })
    })

    it("fails when hederaTransactionHash is not a valid Hedera transaction id", () => {
      let error: Error

      try {
        BatchPayout.create(
          DistributionUtils.newInstance(),
          faker.string.alpha({ length: 10 }),
          fakeHederaTxId(),
          faker.finance.ethereumAddress(),
          2,
          BatchPayoutStatus.IN_PROGRESS,
        )
      } catch (e) {
        error = e
      }

      expect(error).toBeInstanceOf(BatchPayoutHederaTransactionHashInvalidError)
    })

    it("fails when hederaTransactionId is not a valid Hedera transaction ID", () => {
      let error: Error
      try {
        BatchPayout.create(
          DistributionUtils.newInstance(),
          faker.string.alpha({ length: 10 }),
          faker.string.alpha({ length: 10 }),
          `0x${faker.string.hexadecimal({ length: 96, prefix: "" })}`,
          2,
          BatchPayoutStatus.IN_PROGRESS,
        )
      } catch (e) {
        error = e as Error
      }
      expect(error).toBeInstanceOf(BatchPayoutHederaTransactionIdInvalidError)
    })

    it("fails when holdersNumber is zero or negative", () => {
      const invalidNumbers = [0, -10]

      invalidNumbers.forEach(() => {
        let error: Error

        try {
          BatchPayout.create(
            DistributionUtils.newInstance(),
            faker.string.alpha({ length: 10 }),
            fakeHederaTxId(),
            `0x${faker.string.hexadecimal({ length: 96, prefix: "" })}`,
            0,
            BatchPayoutStatus.IN_PROGRESS,
          )
        } catch (e) {
          error = e as Error
        }

        expect(error).toBeInstanceOf(BatchPayoutHoldersNumberInvalidError)
      })
    })
  })
})
