// SPDX-License-Identifier: Apache-2.0
import { ExecutePayoutCommand, ExecutePayoutUseCase } from "@application/use-cases/execute-payout.use-case"
import { AssetNotFoundError } from "@domain/errors/asset.error"
import { Asset } from "@domain/model/asset"
import { AmountType, DistributionType, PayoutSubtype, Recurrency } from "@domain/model/distribution"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { ExecutePayoutDistributionDomainService } from "@domain/services/execute-payout-distribution.domain-service"
import { createMock } from "@golevelup/ts-jest"
import { ConfigService } from "@nestjs/config"
import { Test, TestingModule } from "@nestjs/testing"
import { fakeHederaAddress } from "@test/shared/utils"

describe("ExecutePayoutUseCase", () => {
  let useCase: ExecutePayoutUseCase
  const executePayoutDistributionDomainServiceMock = createMock<ExecutePayoutDistributionDomainService>()
  const configServiceMock = createMock<ConfigService>()
  const assetRepositoryMock = createMock<AssetRepository>()
  const distributionRepositoryMock = createMock<DistributionRepository>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecutePayoutUseCase,
        {
          provide: "AssetRepository",
          useValue: assetRepositoryMock,
        },
        {
          provide: "DistributionRepository",
          useValue: distributionRepositoryMock,
        },
        {
          provide: ExecutePayoutDistributionDomainService,
          useValue: executePayoutDistributionDomainServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile()

    useCase = module.get<ExecutePayoutUseCase>(ExecutePayoutUseCase)
    jest.clearAllMocks()
  })

  describe("execute", () => {
    const assetId = "test-asset-id"
    const command: ExecutePayoutCommand = {
      assetId,
      amount: "100",
      amountType: AmountType.FIXED,
      executeAt: new Date(Date.now() + 1000 * 60 * 60),
      subtype: PayoutSubtype.IMMEDIATE,
      concept: "test concept",
    }
    const mockAsset = {
      id: assetId,
      name: "Test Asset",
      hederaTokenAddress: fakeHederaAddress(),
    } as Asset

    it("should propagate errors from AssetRepository", async () => {
      const error = new Error("Asset not found")
      configServiceMock.get.mockReturnValue(100)
      assetRepositoryMock.getAsset.mockRejectedValue(error)

      await expect(useCase.execute(command)).rejects.toThrow(error)
      expect(assetRepositoryMock.getAsset).toHaveBeenCalledWith(assetId)
      expect(executePayoutDistributionDomainServiceMock.execute).not.toHaveBeenCalled()
    })

    it("should propagate errors from ExecutePayoutDomainService", async () => {
      const error = new Error("Domain service error")
      configServiceMock.get.mockReturnValue(100)
      assetRepositoryMock.getAsset.mockResolvedValue(mockAsset)
      executePayoutDistributionDomainServiceMock.execute.mockRejectedValue(error)

      await expect(useCase.execute(command)).rejects.toThrow(error)
      expect(assetRepositoryMock.getAsset).toHaveBeenCalledWith(assetId)
      expect(executePayoutDistributionDomainServiceMock.execute).toHaveBeenCalledWith(expect.any(Object))
    })

    it("should call services in correct order", async () => {
      configServiceMock.get.mockReturnValue(100)
      assetRepositoryMock.getAsset.mockResolvedValue(mockAsset)
      executePayoutDistributionDomainServiceMock.execute.mockResolvedValue(undefined)

      await useCase.execute(command)

      const assetCall = assetRepositoryMock.getAsset.mock.invocationCallOrder[0]
      const domainServiceCall = executePayoutDistributionDomainServiceMock.execute.mock.invocationCallOrder[0]
      expect(assetCall).toBeLessThan(domainServiceCall)
    })

    it("should return undefined on successful execution", async () => {
      configServiceMock.get.mockReturnValue(100)
      assetRepositoryMock.getAsset.mockResolvedValue(mockAsset)
      executePayoutDistributionDomainServiceMock.execute.mockResolvedValue(undefined)

      const result = await useCase.execute(command)

      expect(result).toBeUndefined()
    })

    it("should call executePayoutDomainService with correct parameters for immediate payout", async () => {
      configServiceMock.get.mockReturnValue(100)
      assetRepositoryMock.getAsset.mockResolvedValue(mockAsset)
      executePayoutDistributionDomainServiceMock.execute.mockResolvedValue(undefined)

      await useCase.execute(command)

      expect(executePayoutDistributionDomainServiceMock.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          asset: mockAsset,
        }),
      )

      expect(executePayoutDistributionDomainServiceMock.execute).toHaveBeenCalledTimes(1)
    })

    it("should call distributionRepository with correct parameters for one-off payout", async () => {
      configServiceMock.get.mockReturnValue(100)
      assetRepositoryMock.getAsset.mockResolvedValue(mockAsset)
      distributionRepositoryMock.saveDistribution.mockResolvedValue(undefined)
      command.subtype = PayoutSubtype.ONE_OFF

      await useCase.execute(command)

      expect(distributionRepositoryMock.saveDistribution).toHaveBeenCalledWith(
        expect.objectContaining({
          asset: mockAsset,
          details: {
            executeAt: command.executeAt,
            amount: command.amount,
            amountType: command.amountType,
            type: DistributionType.PAYOUT,
            subtype: command.subtype,
            concept: command.concept,
          },
        }),
      )

      expect(distributionRepositoryMock.saveDistribution).toHaveBeenCalledTimes(1)
    })

    it("should call distributionRepository with correct parameters for recurring payout", async () => {
      configServiceMock.get.mockReturnValue(100)
      assetRepositoryMock.getAsset.mockResolvedValue(mockAsset)
      distributionRepositoryMock.saveDistribution.mockResolvedValue(undefined)
      command.subtype = PayoutSubtype.RECURRING
      command.recurrency = Recurrency.DAILY

      await useCase.execute(command)

      expect(distributionRepositoryMock.saveDistribution).toHaveBeenCalledWith(
        expect.objectContaining({
          asset: mockAsset,
          details: {
            executeAt: command.executeAt,
            recurrency: command.recurrency,
            amount: command.amount,
            amountType: command.amountType,
            type: DistributionType.PAYOUT,
            subtype: command.subtype,
            concept: command.concept,
          },
        }),
      )

      expect(distributionRepositoryMock.saveDistribution).toHaveBeenCalledTimes(1)
    })

    it("should call distributionRepository with correct parameters for automated payout", async () => {
      configServiceMock.get.mockReturnValue(100)
      assetRepositoryMock.getAsset.mockResolvedValue(mockAsset)
      distributionRepositoryMock.saveDistribution.mockResolvedValue(undefined)
      command.subtype = PayoutSubtype.AUTOMATED

      await useCase.execute(command)

      expect(distributionRepositoryMock.saveDistribution).toHaveBeenCalledWith(
        expect.objectContaining({
          asset: mockAsset,
          details: {
            amount: command.amount,
            amountType: command.amountType,
            type: DistributionType.PAYOUT,
            subtype: command.subtype,
            concept: command.concept,
          },
        }),
      )

      expect(distributionRepositoryMock.saveDistribution).toHaveBeenCalledTimes(1)
    })

    it("should throw AssetNotFoundError when asset is not found", async () => {
      configServiceMock.get.mockReturnValue(100)
      assetRepositoryMock.getAsset.mockResolvedValue(null)

      await expect(useCase.execute(command)).rejects.toThrow(AssetNotFoundError)
      expect(assetRepositoryMock.getAsset).toHaveBeenCalledWith(assetId)
      expect(executePayoutDistributionDomainServiceMock.execute).not.toHaveBeenCalled()
    })
  })
})
