// SPDX-License-Identifier: Apache-2.0

import { GetBlockchainEventListenerConfigUseCase } from "@application/use-cases/get-blockchain-event-listener-config.use-case"
import { ConfigKeys } from "@config/config-keys"
import { BlockchainEventListenerConfig } from "@domain/model/blockchain-listener"
import { BlockchainEventListenerConfigRepository } from "@domain/ports/blockchain-event-config-repository.port"
import { createMock } from "@golevelup/ts-jest"
import { ConfigService } from "@nestjs/config"
import { Test, TestingModule } from "@nestjs/testing"

describe(GetBlockchainEventListenerConfigUseCase.name, () => {
  let useCase: GetBlockchainEventListenerConfigUseCase
  const repositoryMock = createMock<BlockchainEventListenerConfigRepository>()
  const configServiceMock = createMock<ConfigService>()
  const envConfigMock = {
    id: crypto.randomUUID(),
    mirrorNodeUrl: "http://localhost:5551",
    contractId: "0.0.004",
    startTimestamp: "2025-08-26T00:00:00.000Z",
    tokenDecimals: 6,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBlockchainEventListenerConfigUseCase,
        {
          provide: "BlockchainEventListenerConfigRepository",
          useValue: repositoryMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile()

    useCase = module.get(GetBlockchainEventListenerConfigUseCase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("execute", () => {
    it("should return the blockchain event listener config", async () => {
      configServiceMock.get.mockImplementation((key: string) => {
        const values: Record<string, any> = {
          [ConfigKeys.BLOCKCHAIN_MIRROR_NODE_URL]: envConfigMock.mirrorNodeUrl,
          [ConfigKeys.BLOCKCHAIN_CONTRACT_ID]: envConfigMock.contractId,
          [ConfigKeys.BLOCKCHAIN_LISTENER_START_TIMESTAMP]: envConfigMock.startTimestamp,
          [ConfigKeys.BLOCKCHAIN_TOKEN_DECIMALS]: envConfigMock.tokenDecimals,
        }
        return values[key]
      })
      const mockConfig: BlockchainEventListenerConfig = new BlockchainEventListenerConfig()
      mockConfig.id = crypto.randomUUID()
      mockConfig.mirrorNodeUrl = "0x123"
      mockConfig.contractId = "0x456"
      mockConfig.startTimestamp = "1651356000000"
      mockConfig.tokenDecimals = 2
      repositoryMock.getConfig.mockResolvedValue(mockConfig)

      const result = await useCase.execute()

      expect(repositoryMock.getConfig).toHaveBeenCalled()
      expect(result).toEqual(mockConfig)
    })

    it("should return default config if config not found", async () => {
      repositoryMock.getConfig.mockResolvedValue(undefined)
      configServiceMock.get.mockImplementation((key: string) => {
        const values: Record<string, any> = {
          [ConfigKeys.BLOCKCHAIN_MIRROR_NODE_URL]: envConfigMock.mirrorNodeUrl,
          [ConfigKeys.BLOCKCHAIN_CONTRACT_ID]: envConfigMock.contractId,
          [ConfigKeys.BLOCKCHAIN_LISTENER_START_TIMESTAMP]: envConfigMock.startTimestamp,
          [ConfigKeys.BLOCKCHAIN_TOKEN_DECIMALS]: envConfigMock.tokenDecimals,
        }
        return values[key]
      })

      await expect(useCase.execute()).resolves.toEqual({
        mirrorNodeUrl: expect.any(String),
        contractId: expect.any(String),
        startTimestamp: expect.any(String),
        tokenDecimals: expect.any(Number),
      })
      expect(repositoryMock.getConfig).toHaveBeenCalled()
    })

    it("should propagate repository errors", async () => {
      const error = new Error("DB error")
      repositoryMock.getConfig.mockRejectedValue(error)

      await expect(useCase.execute()).rejects.toThrow(error)
      expect(repositoryMock.getConfig).toHaveBeenCalled()
    })
  })
})
