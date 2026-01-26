// SPDX-License-Identifier: Apache-2.0

import { ConfigurationModule } from "@config/configuration.module"
import { ENTITIES, PostgresModule } from "@config/postgres.module"
import { AssetTokenizationStudioService } from "@domain/ports/asset-tokenization-studio.port"
import { BlockchainEventListenerConfigRepository } from "@domain/ports/blockchain-event-config-repository.port"
import { BlockchainEventListenerService } from "@domain/ports/blockchain-event-listener.service"
import { LifeCycleCashFlowPort } from "@domain/ports/life-cycle-cash-flow.port"
import { HederaService } from "@domain/ports/hedera.port"
import { createMock } from "@golevelup/ts-jest"
import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import { LifeCycleCashFlow } from "@hashgraph/mass-payout-sdk"
import { PostgreSqlContainer } from "@test/shared/containers/postgresql-container"
import { Repository } from "typeorm"
import { CONTROLLERS, PROVIDERS } from "../../../src/app.module-components"
import { MockOnChainDistributionRepository } from "./mocks/mock-on-chain-distribution.repository"

export class E2eTestApp {
  app: INestApplication
  onChainDistributionMock: MockOnChainDistributionRepository
  assetTokenizationStudioServiceMock = createMock<AssetTokenizationStudioService>()
  lifeCycleCashFlowMock = createMock<LifeCycleCashFlowPort>()
  lifeCycleCashFlowSdkMock = createMock<LifeCycleCashFlow>()
  blockchainRepositoryMock = createMock<BlockchainEventListenerService>()
  blockchainConfigRepositoryMock = createMock<BlockchainEventListenerConfigRepository>()
  hederaServiceMock = createMock<HederaService>()

  private appModule: TestingModule
  private postgresqlContainer: PostgreSqlContainer

  public static async create(): Promise<E2eTestApp> {
    const e2eTestApp = new E2eTestApp()
    await e2eTestApp.initContainers()

    e2eTestApp.appModule = await e2eTestApp.compileTestingModule()
    e2eTestApp.app = e2eTestApp.appModule.createNestApplication()
    e2eTestApp.onChainDistributionMock = e2eTestApp.app.get("OnChainDistributionRepositoryPort")
    await e2eTestApp.app.init()
    return e2eTestApp
  }

  public async initContainers() {
    this.postgresqlContainer = await PostgreSqlContainer.create()
  }

  public async compileTestingModule() {
    const metadata = {
      imports: [
        ConfigurationModule.forRoot("/.env.test"),
        PostgresModule.forRoot(this.postgresqlContainer.getConfig(), ENTITIES),
      ],
      controllers: [...CONTROLLERS],
      providers: [
        ...PROVIDERS,
        {
          provide: "AssetTokenizationStudioService",
          useValue: this.assetTokenizationStudioServiceMock,
        },
        {
          provide: "OnChainDistributionRepositoryPort",
          useClass: MockOnChainDistributionRepository,
        },
        {
          provide: "OnChainLifeCycleCashFlowService",
          useValue: this.lifeCycleCashFlowMock,
        },
        {
          provide: LifeCycleCashFlow,
          useValue: this.lifeCycleCashFlowSdkMock,
        },
        {
          provide: "BlockchainEventRepository",
          useValue: this.blockchainRepositoryMock,
        },
        {
          provide: "BlockchainEventListenerConfigRepository",
          useValue: this.blockchainConfigRepositoryMock,
        },
        {
          provide: "HederaService",
          useValue: this.hederaServiceMock,
        },
      ],
    }
    return await Test.createTestingModule(metadata).compile()
  }

  public async stop() {
    await this.app.close()
    await this.stopContainers()
  }

  public getRepository<Entity>(entityClass: EntityClassOrSchema): Repository<Entity> | any {
    return this.app.get(getRepositoryToken(entityClass))
  }

  private async stopContainers() {
    await this.postgresqlContainer.stop()
  }
}
