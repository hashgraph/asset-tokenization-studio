// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { createMock, DeepMocked } from "@golevelup/ts-jest"
import { ExecutePayoutDistributionDomainService } from "@domain/services/execute-payout-distribution.domain-service"
import { BatchPayoutRepository } from "@domain/ports/batch-payout-repository.port"
import { CreateHoldersDomainService } from "@domain/services/create-holders.domain-service"
import { UpdateBatchPayoutStatusDomainService } from "@domain/services/update-batch-payout-status.domain-service"
import { UpdateDistributionStatusDomainService } from "@domain/services/update-distribution-status.domain-service"
import { ConfigService } from "@nestjs/config"
import { BatchPayout, BatchPayoutStatus } from "@domain/model/batch-payout"
import { ExecuteDistributionResponse } from "@domain/ports/execute-distribution-response.interface"
import { BatchPayoutUtils } from "@test/shared/batch-payout.utils"
import { AssetTokenizationStudioService } from "@domain/ports/asset-tokenization-studio.port"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { LifeCycleCashFlowPort } from "@domain/ports/life-cycle-cash-flow.port"
import { OnChainDistributionRepositoryPort } from "@domain/ports/on-chain-distribution-repository.port"
import { ValidateAssetPauseStateDomainService } from "@domain/services/validate-asset-pause-state.domain-service"
import { HederaService } from "@domain/ports/hedera.port"

class TestableExecutePayoutDistributionDomainService extends ExecutePayoutDistributionDomainService {
  public async testUpdateBatchPayoutTransactionHashes(batchPayout: BatchPayout, transactionId: string) {
    return (this as any).updateBatchPayoutTransactionHashes(batchPayout, transactionId)
  }

  public async testHandlePayoutResult(batchPayout: BatchPayout, result: ExecuteDistributionResponse) {
    return await (this as any).handlePayoutResult(batchPayout, result)
  }
}

describe("BasePayoutDomainService", () => {
  let service: TestableExecutePayoutDistributionDomainService
  let batchPayoutRepositoryMock: DeepMocked<BatchPayoutRepository>
  let createHoldersDomainServiceMock: DeepMocked<CreateHoldersDomainService>
  let updateBatchPayoutStatusDomainServiceMock: DeepMocked<UpdateBatchPayoutStatusDomainService>
  let updateDistributionStatusDomainServiceMock: DeepMocked<UpdateDistributionStatusDomainService>
  let configServiceMock: DeepMocked<ConfigService>
  let assetTokenizationStudioServiceMock: DeepMocked<AssetTokenizationStudioService>
  let distributionRepositoryMock: DeepMocked<DistributionRepository>
  let onChainDistributionRepositoryMock: DeepMocked<OnChainDistributionRepositoryPort>
  let onChainLifeCycleCashFlowServiceMock: DeepMocked<LifeCycleCashFlowPort>
  let validateAssetPauseStateDomainServiceMock: DeepMocked<ValidateAssetPauseStateDomainService>
  let hederaServiceMock: DeepMocked<HederaService>

  beforeEach(async () => {
    batchPayoutRepositoryMock = createMock<BatchPayoutRepository>()
    createHoldersDomainServiceMock = createMock<CreateHoldersDomainService>()
    updateBatchPayoutStatusDomainServiceMock = createMock<UpdateBatchPayoutStatusDomainService>()
    updateDistributionStatusDomainServiceMock = createMock<UpdateDistributionStatusDomainService>()
    configServiceMock = createMock<ConfigService>()
    assetTokenizationStudioServiceMock = createMock<AssetTokenizationStudioService>()
    distributionRepositoryMock = createMock<DistributionRepository>()
    onChainDistributionRepositoryMock = createMock<OnChainDistributionRepositoryPort>()
    onChainLifeCycleCashFlowServiceMock = createMock<LifeCycleCashFlowPort>()
    validateAssetPauseStateDomainServiceMock = createMock<ValidateAssetPauseStateDomainService>()
    hederaServiceMock = createMock<HederaService>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestableExecutePayoutDistributionDomainService,
        {
          provide: "BatchPayoutRepository",
          useValue: batchPayoutRepositoryMock,
        },
        {
          provide: "AssetTokenizationStudioService",
          useValue: assetTokenizationStudioServiceMock,
        },
        {
          provide: CreateHoldersDomainService,
          useValue: createHoldersDomainServiceMock,
        },
        {
          provide: "UpdateBatchPayoutStatusDomainService",
          useValue: updateBatchPayoutStatusDomainServiceMock,
        },
        {
          provide: "UpdateDistributionStatusDomainService",
          useValue: updateDistributionStatusDomainServiceMock,
        },
        {
          provide: "OnChainDistributionRepositoryPort",
          useValue: onChainDistributionRepositoryMock,
        },
        {
          provide: "DistributionRepository",
          useValue: distributionRepositoryMock,
        },
        {
          provide: "OnChainLifeCycleCashFlowService",
          useValue: onChainLifeCycleCashFlowServiceMock,
        },
        {
          provide: ValidateAssetPauseStateDomainService,
          useValue: validateAssetPauseStateDomainServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: "HederaService",
          useValue: hederaServiceMock,
        },
      ],
    }).compile()

    service = module.get<TestableExecutePayoutDistributionDomainService>(TestableExecutePayoutDistributionDomainService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("updateBatchPayoutTransactionAddresses", () => {
    it("should update batch payout with transaction addresses", async () => {
      const originalBatchPayout = BatchPayoutUtils.newInstance({
        hederaTransactionId: "0.0.0@0000000000.000000000",
        hederaTransactionHash:
          "0x000000000000000000000000000000000000000000000000000000000000000000" + "00000000000000000000000000000000",
        status: BatchPayoutStatus.IN_PROGRESS,
      })
      const transactionId = "0.0.123@1234567890.123456789"

      batchPayoutRepositoryMock.updateBatchPayout.mockResolvedValue(undefined)
      hederaServiceMock.getParentHederaTransactionHash.mockResolvedValue({
        hederaTransactionHash:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" + "1234567890abcdef1234567890abcdef",
        isFromMirrorNode: true,
      })

      await service.testUpdateBatchPayoutTransactionHashes(originalBatchPayout, transactionId)

      expect(batchPayoutRepositoryMock.updateBatchPayout).toHaveBeenCalledWith(
        expect.objectContaining({
          hederaTransactionId: transactionId,
          hederaTransactionHash: expect.stringMatching(/^0x[a-fA-F0-9]{96}$/),
        }),
      )
    })

    it("should handle repository errors gracefully", async () => {
      const originalBatchPayout = BatchPayoutUtils.newInstance({
        status: BatchPayoutStatus.IN_PROGRESS,
      })
      const transactionId = "0.0.123@1234567890.123456789"
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation()

      batchPayoutRepositoryMock.updateBatchPayout.mockRejectedValue(new Error("Database error"))
      hederaServiceMock.getParentHederaTransactionHash.mockResolvedValue({
        hederaTransactionHash:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" + "1234567890abcdef1234567890abcdef",
        isFromMirrorNode: true,
      })

      await expect(
        service.testUpdateBatchPayoutTransactionHashes(originalBatchPayout, transactionId),
      ).resolves.not.toThrow()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Failed to update transaction hashes for BatchPayout ${originalBatchPayout.id}`),
        expect.any(Error),
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe("handlePayoutResult", () => {
    it("should update transaction addresses when transactionId is provided", async () => {
      const batchPayout = BatchPayoutUtils.newInstance({
        hederaTransactionId: "0.0.0@0000000000.000000000",
        hederaTransactionHash:
          "0x000000000000000000000000000000000000000000000000000000000000000000" + "00000000000000000000000000000000",
        status: BatchPayoutStatus.IN_PROGRESS,
      })
      const executeDistributionResponse: ExecuteDistributionResponse = {
        failed: [],
        succeeded: ["0x123", "0x456"],
        paidAmount: ["100", "200"],
        transactionId: "0.0.123@1234567890.123456789",
      }

      createHoldersDomainServiceMock.execute.mockResolvedValue(undefined)
      batchPayoutRepositoryMock.updateBatchPayout.mockResolvedValue(undefined)
      hederaServiceMock.getParentHederaTransactionHash.mockResolvedValue({
        hederaTransactionHash:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" + "1234567890abcdef1234567890abcdef",
        isFromMirrorNode: true,
      })
      const spy = jest.spyOn(service["createHoldersDomainService"], "execute")

      await service.testHandlePayoutResult(batchPayout, executeDistributionResponse)

      expect(spy).toHaveBeenCalledWith(
        batchPayout,
        executeDistributionResponse.failed,
        executeDistributionResponse.succeeded,
        executeDistributionResponse.paidAmount,
      )
      expect(batchPayoutRepositoryMock.updateBatchPayout).toHaveBeenCalledWith(
        expect.objectContaining({
          hederaTransactionId: executeDistributionResponse.transactionId,
          hederaTransactionHash: expect.stringMatching(/^0x[a-fA-F0-9]{96}$/),
        }),
      )
    })

    it("should not update transaction addresses when transactionId is not provided", async () => {
      const batchPayout = BatchPayoutUtils.newInstance({
        status: BatchPayoutStatus.IN_PROGRESS,
      })
      const executeDistributionResponse: ExecuteDistributionResponse = {
        failed: [],
        succeeded: ["0x123", "0x456"],
        paidAmount: ["100", "200"],
        transactionId: "",
      }

      createHoldersDomainServiceMock.execute.mockResolvedValue(undefined)

      const result = await service.testHandlePayoutResult(batchPayout, executeDistributionResponse)

      expect(batchPayoutRepositoryMock.updateBatchPayout).not.toHaveBeenCalled()

      expect(result).toBe(batchPayout)
    })

    it("should not update transaction addresses when transactionId is null", async () => {
      const batchPayout = BatchPayoutUtils.newInstance({
        status: BatchPayoutStatus.IN_PROGRESS,
      })
      const executeDistributionResponse: ExecuteDistributionResponse = {
        failed: [],
        succeeded: ["0x123", "0x456"],
        paidAmount: ["100", "200"],
        transactionId: null as any,
      }

      createHoldersDomainServiceMock.execute.mockResolvedValue(undefined)

      const result = await service.testHandlePayoutResult(batchPayout, executeDistributionResponse)

      expect(batchPayoutRepositoryMock.updateBatchPayout).not.toHaveBeenCalled()

      expect(result).toBe(batchPayout)
    })
  })
})
