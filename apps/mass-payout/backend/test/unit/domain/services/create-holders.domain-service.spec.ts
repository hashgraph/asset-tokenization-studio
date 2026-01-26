// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { faker } from "@faker-js/faker"
import { createMock, DeepMocked } from "@golevelup/ts-jest"
import { CreateHoldersDomainService } from "@domain/services/create-holders.domain-service"
import { HolderRepository } from "@domain/ports/holder-repository.port"
import { HolderStatus } from "@domain/model/holder"
import { BatchPayoutUtils } from "@test/shared/batch-payout.utils"
import { DistributionUtils } from "@test/shared/distribution.utils"
import { fakeHederaAddress } from "@test/shared/utils"
import { HederaService } from "@domain/ports/hedera.port"

describe(CreateHoldersDomainService.name, () => {
  let createHoldersDomainService: CreateHoldersDomainService
  let holderRepositoryMock: DeepMocked<HolderRepository>
  let hederaServiceMock: DeepMocked<HederaService>

  beforeAll(async () => {
    holderRepositoryMock = createMock<HolderRepository>()
    hederaServiceMock = createMock<HederaService>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateHoldersDomainService,
        {
          provide: "HolderRepository",
          useValue: holderRepositoryMock,
        },
        {
          provide: "HederaService",
          useValue: hederaServiceMock,
        },
      ],
    }).compile()

    createHoldersDomainService = module.get<CreateHoldersDomainService>(CreateHoldersDomainService)
  })

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe("execute", () => {
    it("should create holders", async () => {
      const batchPayout = BatchPayoutUtils.newInstance()
      const failedHolderNumber = faker.number.int({ min: 2, max: 4 })
      const succeededHolderNumber = faker.number.int({ min: 2, max: 4 })
      const failedAddresses = Array.from({ length: failedHolderNumber }, () => faker.finance.ethereumAddress())
      const succeededAddresses = Array.from({ length: succeededHolderNumber }, () => faker.finance.ethereumAddress())
      const hederaFailedAddresses = Array.from({ length: failedHolderNumber }, () => fakeHederaAddress())
      const hederaSucceededAddresses = Array.from({ length: succeededHolderNumber }, () => fakeHederaAddress())
      const paidAmounts = Array.from({ length: succeededHolderNumber }, () =>
        faker.number.int({ min: 1, max: 1000 }).toString(),
      )
      failedAddresses.forEach((_, index) => {
        hederaServiceMock.getHederaAddressFromEvm.mockResolvedValueOnce(hederaFailedAddresses[index])
      })
      succeededAddresses.forEach((_, index) => {
        hederaServiceMock.getHederaAddressFromEvm.mockResolvedValueOnce(hederaSucceededAddresses[index])
      })
      holderRepositoryMock.saveHolders.mockImplementation((holders) => Promise.resolve(holders))

      const result = await createHoldersDomainService.execute(
        batchPayout,
        failedAddresses,
        succeededAddresses,
        paidAmounts,
      )
      const failedHolders = result.filter((failedHolder) => failedHolder.status === HolderStatus.FAILED)
      const succeededHolders = result.filter((failedHolder) => failedHolder.status === HolderStatus.SUCCESS)

      expect(hederaServiceMock.getHederaAddressFromEvm).toHaveBeenCalledTimes(
        failedHolderNumber + succeededHolderNumber,
      )
      failedAddresses.forEach((address, index) => {
        expect(hederaServiceMock.getHederaAddressFromEvm).toHaveBeenNthCalledWith(index + 1, address)
      })
      succeededAddresses.forEach((address, index) => {
        expect(hederaServiceMock.getHederaAddressFromEvm).toHaveBeenNthCalledWith(
          failedHolderNumber + index + 1,
          address,
        )
      })
      expect(holderRepositoryMock.saveHolders).toHaveBeenCalledTimes(1)
      expect(result).toHaveLength(failedHolderNumber + succeededHolderNumber)
      expect(failedHolders).toHaveLength(failedHolderNumber)
      expect(succeededHolders).toHaveLength(succeededHolderNumber)

      failedHolders.forEach((holder, index) => {
        expect(holder.batchPayout).toBe(batchPayout)
        expect(holder.holderHederaAddress).toBe(hederaFailedAddresses[index])
        expect(holder.holderEvmAddress).toBe(failedAddresses[index])
        expect(holder.retryCounter).toBe(0)
        expect(holder.nextRetryAt).toBeInstanceOf(Date)
        expect(holder.nextRetryAt.getTime()).toBeGreaterThan(Date.now())
        expect(holder.lastError).toBe("Payment execution failed")
      })
      succeededHolders.forEach((holder, index) => {
        expect(holder.batchPayout).toBe(batchPayout)
        expect(holder.holderHederaAddress).toBe(hederaSucceededAddresses[index])
        expect(holder.holderEvmAddress).toBe(succeededAddresses[index])
        expect(holder.retryCounter).toBe(0)
        expect(holder.nextRetryAt).toBeUndefined()
        expect(holder.lastError).toBeUndefined()
        expect(holder.amount).toBe(paidAmounts[index])
      })
    })

    it("should create failed holders with empty array", async () => {
      const distribution = DistributionUtils.newInstance()
      const batchPayout = BatchPayoutUtils.newInstance({ distribution })
      holderRepositoryMock.saveHolders.mockResolvedValue([])

      const result = await createHoldersDomainService.execute(batchPayout, [], [], [])

      expect(hederaServiceMock.getHederaAddressFromEvm).not.toHaveBeenCalled()
      expect(holderRepositoryMock.saveHolders).toHaveBeenCalledWith([])
      expect(result).toHaveLength(0)
    })
  })
})
