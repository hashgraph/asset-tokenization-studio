// SPDX-License-Identifier: Apache-2.0

import { faker } from "@faker-js/faker"
import { createMock } from "@golevelup/ts-jest"
import { Test, TestingModule } from "@nestjs/testing"
import {
  RetryFailedHoldersCommand,
  RetryFailedHoldersUseCase,
} from "@application/use-cases/retry-failed-holders.use-case"
import { RetryFailedHoldersDomainService } from "@domain/services/retry-failed-holders.domain-service"

describe(RetryFailedHoldersUseCase.name, () => {
  let retryFailedHoldersUseCase: RetryFailedHoldersUseCase
  const retryFailedHoldersDomainServiceMock = createMock<RetryFailedHoldersDomainService>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetryFailedHoldersUseCase,
        {
          provide: RetryFailedHoldersDomainService,
          useValue: retryFailedHoldersDomainServiceMock,
        },
      ],
    }).compile()

    retryFailedHoldersUseCase = module.get<RetryFailedHoldersUseCase>(RetryFailedHoldersUseCase)
  })

  describe("execute", () => {
    it("should call domain service with correct parameters", async () => {
      const command = {
        distributionId: faker.string.uuid(),
      } as RetryFailedHoldersCommand

      await retryFailedHoldersUseCase.execute(command)

      expect(retryFailedHoldersDomainServiceMock.execute).toHaveBeenCalledWith(command.distributionId)
    })
  })
})
