// SPDX-License-Identifier: Apache-2.0

import { CancelDistributionUseCase } from "@application/use-cases/cancel-distribution.use-case"
import { DisableAssetSyncUseCase } from "@application/use-cases/disable-asset-sync.use-case"
import { EnableAssetSyncUseCase } from "@application/use-cases/enable-asset-sync.use-case"
import { ExecutePayoutUseCase } from "@application/use-cases/execute-payout.use-case"
import { GetAssetDistributionsUseCase } from "@application/use-cases/get-asset-distributions.use-case"
import { GetAssetUseCase } from "@application/use-cases/get-asset.use-case"
import { GetAssetsUseCase } from "@application/use-cases/get-assets.use-case"
import { GetBasicAssetInformationUseCase } from "@application/use-cases/get-basic-asset-information.use-case"
import { GetBlockchainEventListenerConfigUseCase } from "@application/use-cases/get-blockchain-event-listener-config.use-case"
import { GetDistributionHoldersUseCase } from "@application/use-cases/get-distribution-holders.use-case"
import { GetDistributionHolderCountUseCase } from "@application/use-cases/get-distribution-holder-count.use-case"
import { GetDistributionUseCase } from "@application/use-cases/get-distribution.use-case"
import { GetDistributionsUseCase } from "@application/use-cases/get-distributions.use-case"
import { ImportAssetUseCase } from "@application/use-cases/import-asset.use-case"
import { PauseAssetUseCase } from "@application/use-cases/pause-asset.use-case"
import { ProcessBlockchainEventsUseCase } from "@application/use-cases/process-blockchain-events.use-case"
import { ProcessScheduledPayoutsUseCase } from "@application/use-cases/process-scheduled-payouts.use-case"
import { StartBlockchainPollingUseCase } from "@application/use-cases/start-blockchain-polling.use-case"
import { StopBlockchainPollingUseCase } from "@application/use-cases/stop-blockchain-polling.use-case"
import { UnpauseAssetUseCase } from "@application/use-cases/unpause-asset.use-case"
import { UpdateAssetUseCase } from "@application/use-cases/update-asset.use-case"
import { UpsertBlockchainEventListenerConfigUseCase } from "@application/use-cases/upsert-blockchain-event-listener-config.use-case"
import { CreateHoldersDomainService } from "@domain/services/create-holders.domain-service"
import { DisableAssetSyncDomainService } from "@domain/services/disable-asset-sync.domain-service"
import { EnableAssetSyncDomainService } from "@domain/services/enable-asset-sync.domain-service"
import { ExecuteCorporateActionDistributionDomainService } from "@domain/services/execute-corporate-action-distribution.domain-service"
import { ExecutePayoutDistributionDomainService } from "@domain/services/execute-payout-distribution.domain-service"
import { ImportAssetDomainService } from "@domain/services/import-asset.domain-service"
import { PauseAssetDomainService } from "@domain/services/pause-asset.domain-service"
import { SyncFromOnChainDomainService } from "@domain/services/sync-from-onchain.domain-service"
import { UnpauseAssetDomainService } from "@domain/services/unpause-asset.domain-service"
import { UpdateAssetDomainService } from "@domain/services/update-asset.domain-service"
import { UpdateBatchPayoutStatusDomainService } from "@domain/services/update-batch-payout-status.domain-service"
import { UpdateDistributionStatusDomainService } from "@domain/services/update-distribution-status.domain-service"
import { ValidateAssetPauseStateDomainService } from "@domain/services/validate-asset-pause-state.domain-service"
import { AssetTokenizationStudioSdkService } from "@infrastructure/adapters/asset-tokenization-studio-sdk.service"
import { BlockchainPollingService } from "@infrastructure/adapters/blockchain/blockchain-polling.service"
import { HederaBlockchainListenerService } from "@infrastructure/adapters/blockchain/listener/hedera-blockchain-listener.service"
import { HederaServiceImpl } from "@infrastructure/adapters/hedera.service"
import { LifeCycleCashFlowSdkService } from "@infrastructure/adapters/life-cycle-cash-flow-sdk.service"
import { OnChainDistributionRepository } from "@infrastructure/adapters/on-chain-distribution.repository"
import { AssetTypeOrmRepository } from "@infrastructure/adapters/repositories/typeorm-asset.repository"
import { BatchPayoutTypeOrmRepository } from "@infrastructure/adapters/repositories/typeorm-batch-payout.repository"
import { BlockchainEventListenerConfigTypeOrmRepository } from "@infrastructure/adapters/repositories/typeorm-blockchain-event-listener-config.repository"
import { DistributionTypeOrmRepository } from "@infrastructure/adapters/repositories/typeorm-distribution.repository"
import { HolderTypeOrmRepository } from "@infrastructure/adapters/repositories/typeorm-holder.repository"
import { MassPayoutCronService } from "@infrastructure/cron/mass-payout-cron.service"
import { AssetController } from "@infrastructure/rest/asset/asset.controller"
import { BlockchainController } from "@infrastructure/rest/blockchain/blockchain.controller"
import { DistributionController } from "@infrastructure/rest/distribution/distribution.controller"
import { Provider, Type } from "@nestjs/common"
import { RetryFailedHoldersUseCase } from "@application/use-cases/retry-failed-holders.use-case"
import { RetryFailedHoldersDomainService } from "@domain/services/retry-failed-holders.domain-service"

const USE_CASES: Provider[] = [
  ImportAssetUseCase,
  UpdateAssetUseCase,
  ProcessScheduledPayoutsUseCase,
  PauseAssetUseCase,
  UnpauseAssetUseCase,
  GetAssetUseCase,
  GetAssetsUseCase,
  GetBasicAssetInformationUseCase,
  GetDistributionsUseCase,
  GetDistributionUseCase,
  GetAssetDistributionsUseCase,
  GetDistributionHoldersUseCase,
  GetDistributionHolderCountUseCase,
  ExecutePayoutUseCase,
  CancelDistributionUseCase,
  ProcessBlockchainEventsUseCase,
  GetBlockchainEventListenerConfigUseCase,
  UpsertBlockchainEventListenerConfigUseCase,
  DisableAssetSyncUseCase,
  EnableAssetSyncUseCase,
  StartBlockchainPollingUseCase,
  StopBlockchainPollingUseCase,
  RetryFailedHoldersUseCase,
]

const REPOSITORIES: Provider[] = [
  {
    provide: "AssetRepository",
    useClass: AssetTypeOrmRepository,
  },
  {
    provide: "DistributionRepository",
    useClass: DistributionTypeOrmRepository,
  },
  {
    provide: "HolderRepository",
    useClass: HolderTypeOrmRepository,
  },
  {
    provide: "BatchPayoutRepository",
    useClass: BatchPayoutTypeOrmRepository,
  },
  {
    provide: "OnChainDistributionRepositoryPort",
    useClass: OnChainDistributionRepository,
  },
  {
    provide: "BlockchainEventListenerConfigRepository",
    useClass: BlockchainEventListenerConfigTypeOrmRepository,
  },
]

const SERVICES: Provider[] = [
  ImportAssetDomainService,
  UpdateAssetDomainService,
  {
    provide: "UpdateBatchPayoutStatusDomainService",
    useClass: UpdateBatchPayoutStatusDomainService,
  },
  SyncFromOnChainDomainService,
  MassPayoutCronService,
  ExecuteCorporateActionDistributionDomainService,
  ExecutePayoutDistributionDomainService,
  CreateHoldersDomainService,
  PauseAssetDomainService,
  UnpauseAssetDomainService,
  ValidateAssetPauseStateDomainService,
  DisableAssetSyncDomainService,
  EnableAssetSyncDomainService,
  RetryFailedHoldersDomainService,
  {
    provide: "UpdateDistributionStatusDomainService",
    useClass: UpdateDistributionStatusDomainService,
  },
  {
    provide: "OnChainLifeCycleCashFlowService",
    useClass: LifeCycleCashFlowSdkService,
  },
  {
    provide: "AssetTokenizationStudioService",
    useClass: AssetTokenizationStudioSdkService,
  },
  {
    provide: "LifeCycleCashFlowPort",
    useClass: LifeCycleCashFlowSdkService,
  },
  {
    provide: "BlockchainPollingPort",
    useClass: BlockchainPollingService,
  },
  {
    provide: "BlockchainEventListenerService",
    useClass: HederaBlockchainListenerService,
  },
  {
    provide: "HederaService",
    useClass: HederaServiceImpl,
  },
]

export const CONTROLLERS: Type[] = [AssetController, DistributionController, BlockchainController]

export const PROVIDERS: Provider[] = [...USE_CASES, ...SERVICES, ...REPOSITORIES]
