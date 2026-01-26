// SPDX-License-Identifier: Apache-2.0

import { Holder, HolderStatus } from "@domain/model/holder"
import { faker } from "@faker-js/faker"
import {
  HolderBatchPayoutIdMissingError,
  HolderEvmAddressInvalidError,
  HolderHederaAddressInvalidError,
  HolderRetryCounterNegativeError,
} from "@domain/errors/holder.error"
import { BaseEntityInvalidDatesError } from "@domain/errors/shared/base-entity-invalid-dates.error"
import { BatchPayoutUtils } from "@test/shared/batch-payout.utils"
import { BatchPayout } from "@domain/model/batch-payout"

const fakeHederaId = () => `${faker.number.int()}.${faker.number.int()}.${faker.number.int({ min: 1 })}`

describe(Holder.name, () => {
  describe("create", () => {
    it("should create a Holder", () => {
      const batchPayout = BatchPayoutUtils.newInstance()
      const holderHederaAddress = fakeHederaId()
      const holderEvmAddress = faker.finance.ethereumAddress()
      const retryCounter = faker.number.int({ min: 0 })
      const status = HolderStatus.PENDING
      const nextRetryAt = faker.date.future()
      const lastError = faker.lorem.sentence()
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })

      const holder = Holder.create(
        batchPayout,
        holderHederaAddress,
        holderEvmAddress,
        retryCounter,
        status,
        nextRetryAt,
        lastError,
        amount,
        createdAt,
        updatedAt,
      )

      expect(holder).toBeInstanceOf(Holder)
      expect(holder.id).toBeDefined()
      expect(holder.batchPayout).toBe(batchPayout)
      expect(holder.holderHederaAddress).toBe(holderHederaAddress)
      expect(holder.holderEvmAddress).toBe(holderEvmAddress)
      expect(holder.retryCounter).toBe(retryCounter)
      expect(holder.status).toBe(status)
      expect(holder.nextRetryAt).toBe(nextRetryAt)
      expect(holder.lastError).toBe(lastError)
      expect(holder.createdAt).toBe(createdAt)
      expect(holder.updatedAt).toBe(updatedAt)
    })

    it("should create a Holder as well if createdAt, updatedAt and lastError are not provided", () => {
      const batchPayout = BatchPayoutUtils.newInstance()
      const holderHederaAddress = fakeHederaId()
      const holderEvmAddress = faker.finance.ethereumAddress()
      const retryCounter = faker.number.int({ min: 0 })
      const status = HolderStatus.PENDING
      const nextRetryAt = faker.date.future()

      const holder = Holder.create(
        batchPayout,
        holderHederaAddress,
        holderEvmAddress,
        retryCounter,
        status,
        nextRetryAt,
      )

      expect(holder).toBeInstanceOf(Holder)
      expect(holder.id).toBeDefined()
      expect(holder.createdAt.getTime()).toBe(holder.updatedAt.getTime())
      expect(holder.lastError).toBeUndefined()
    })

    it("should fail if createdAt is after updatedAt", () => {
      const batchPayout = BatchPayoutUtils.newInstance()
      const holderHederaAddress = fakeHederaId()
      const holderEvmAddress = faker.finance.ethereumAddress()
      const retryCounter = faker.number.int({ min: 0 })
      const status = HolderStatus.PENDING
      const nextRetryAt = faker.date.future()
      const createdAt = faker.date.future()
      const updatedAt = faker.date.past()
      let error: Error

      try {
        Holder.create(
          batchPayout,
          holderHederaAddress,
          holderEvmAddress,
          retryCounter,
          status,
          nextRetryAt,
          undefined,
          undefined,
          createdAt,
          updatedAt,
        )
      } catch (e) {
        error = e
      }

      expect(error).toBeInstanceOf(BaseEntityInvalidDatesError)
    })

    it("fails when batchPayout is empty, null or undefined", () => {
      const invalidBatchPayout = [null, undefined] as unknown[]
      invalidBatchPayout.forEach((invalidBatchPayout) => {
        expect(() => {
          Holder.create(
            invalidBatchPayout as BatchPayout,
            fakeHederaId(),
            faker.finance.ethereumAddress(),
            0,
            HolderStatus.PENDING,
            new Date(),
          )
        }).toThrow(HolderBatchPayoutIdMissingError)
      })
    })

    // TODO restore regexp validation after solving problem with hedera address from evm address
    it.skip("fails when holderHederaAddress is not in format 0.0.X", () => {
      const invalidAddresses = ["1.2", "a.b.c", "0.0", faker.string.uuid()]
      invalidAddresses.forEach((invalidAddress) => {
        expect(() => {
          Holder.create(
            BatchPayoutUtils.newInstance(),
            invalidAddress,
            faker.finance.ethereumAddress(),
            0,
            HolderStatus.PENDING,
            new Date(),
          )
        }).toThrow(HolderHederaAddressInvalidError)
      })
    })

    it("fails when holderEvmAddress is not a valid Ethereum address", () => {
      const invalidAddresses = ["1.2", "a.b.c", "0.0", "0xInvalidEthereumAddress"]
      invalidAddresses.forEach((invalidAddress) => {
        expect(() => {
          Holder.create(
            BatchPayoutUtils.newInstance(),
            fakeHederaId(),
            invalidAddress,
            0,
            HolderStatus.PENDING,
            new Date(),
          )
        }).toThrow(HolderEvmAddressInvalidError)
      })
    })

    it("fails when retryCounter is negative", () => {
      expect(() => {
        Holder.create(
          BatchPayoutUtils.newInstance(),
          fakeHederaId(),
          faker.finance.ethereumAddress(),
          -1,
          HolderStatus.PENDING,
          new Date(),
        )
      }).toThrow(HolderRetryCounterNegativeError)
    })
  })

  describe("createExisting", () => {
    it("should recreate a Holder with all provided valid data", () => {
      const id = faker.string.uuid()
      const batchPayout = BatchPayoutUtils.newInstance()
      const holderHederaAddress = fakeHederaId()
      const holderEvmAddress = faker.finance.ethereumAddress()
      const retryCounter = faker.number.int({ min: 0 })
      const status = HolderStatus.PENDING
      const nextRetryAt = faker.date.future()
      const lastError = faker.lorem.sentence()
      const amount = faker.number.int({ min: 1, max: 1000 }).toString()
      const createdAt = faker.date.past()
      const updatedAt = faker.date.future({ refDate: createdAt })

      const holder = Holder.createExisting(
        id,
        batchPayout,
        holderHederaAddress,
        holderEvmAddress,
        retryCounter,
        status,
        nextRetryAt,
        lastError,
        amount,
        createdAt,
        updatedAt,
      )

      expect(holder).toBeInstanceOf(Holder)
      expect(holder.id).toBe(id)
    })
  })
})
