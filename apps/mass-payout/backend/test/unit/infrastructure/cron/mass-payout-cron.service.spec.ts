// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { createMock } from "@golevelup/ts-jest"
import { MassPayoutCronService } from "@infrastructure/cron/mass-payout-cron.service"
import { ProcessScheduledPayoutsUseCase } from "@application/use-cases/process-scheduled-payouts.use-case"

describe(MassPayoutCronService.name, () => {
  let massPayoutCronService: MassPayoutCronService
  const processScheduledPayoutsUseCaseMock = createMock<ProcessScheduledPayoutsUseCase>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MassPayoutCronService,
        {
          provide: ProcessScheduledPayoutsUseCase,
          useValue: processScheduledPayoutsUseCaseMock,
        },
      ],
    }).compile()

    massPayoutCronService = module.get<MassPayoutCronService>(MassPayoutCronService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("handleScheduledPayouts", () => {
    it("should handle errors from the use case and let them propagate", async () => {
      const error = new Error("Use case execution failed")
      processScheduledPayoutsUseCaseMock.execute.mockRejectedValue(error)

      await expect(massPayoutCronService.handleScheduledPayouts()).rejects.toThrow("Use case execution failed")

      expect(processScheduledPayoutsUseCaseMock.execute).toHaveBeenCalledTimes(1)
    })

    it("should call the use case without any parameters", async () => {
      processScheduledPayoutsUseCaseMock.execute.mockResolvedValue(undefined)

      await massPayoutCronService.handleScheduledPayouts()

      expect(processScheduledPayoutsUseCaseMock.execute).toHaveBeenCalledWith()
      expect(processScheduledPayoutsUseCaseMock.execute.mock.calls[0]).toHaveLength(0)
    })
  })
})
