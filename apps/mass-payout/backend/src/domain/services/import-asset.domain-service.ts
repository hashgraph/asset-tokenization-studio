// SPDX-License-Identifier: Apache-2.0

import { Asset } from "@domain/model/asset"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { AssetTokenizationStudioService } from "@domain/ports/asset-tokenization-studio.port"
import { LifeCycleCashFlowPort } from "@domain/ports/life-cycle-cash-flow.port"
import { Inject, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ConfigKeys } from "@config/config-keys"
import { AssetHederaTokenAddressAlreadyExistsError } from "@domain/errors/asset.error"
import { SyncFromOnChainDomainService } from "@domain/services/sync-from-onchain.domain-service"
import { HederaService } from "@domain/ports/hedera.port"

@Injectable()
export class ImportAssetDomainService {
  constructor(
    @Inject("AssetRepository")
    private readonly assetRepository: AssetRepository,
    @Inject("OnChainLifeCycleCashFlowService")
    private readonly onChainLifeCycleCashFlowService: LifeCycleCashFlowPort,
    @Inject("AssetTokenizationStudioService")
    private readonly assetTokenizationStudioService: AssetTokenizationStudioService,
    @Inject("HederaService")
    private readonly hederaService: HederaService,
    private readonly configService: ConfigService,
    private readonly syncFromOnChainDomainService: SyncFromOnChainDomainService,
  ) {}

  async importAsset(hederaTokenAddress: string): Promise<Asset> {
    const hederaUsdcAddress = this.configService.get<string>(ConfigKeys.HEDERA_USDC_ADDRESS)

    if (!hederaUsdcAddress) {
      throw new Error("HEDERA_USDC_ADDRESS environment variable is not configured")
    }
    const evmTokenAddress = await this.hederaService.getEvmAddressFromHedera(hederaTokenAddress)

    const assetWithSameHederaTokenAddress = await this.assetRepository.getAssetByHederaTokenAddress(hederaTokenAddress)
    if (assetWithSameHederaTokenAddress) {
      throw new AssetHederaTokenAddressAlreadyExistsError(hederaTokenAddress)
    }

    let getAssetInfoResponse
    try {
      getAssetInfoResponse = await this.assetTokenizationStudioService.getAssetInfo(hederaTokenAddress)
    } catch (error) {
      console.error(`Error getting asset info for ${hederaTokenAddress}:`, error)
      throw new Error(`Failed to get asset information for token ${hederaTokenAddress}: ${error.message}`)
    }

    if (!getAssetInfoResponse) {
      throw new Error(`No asset information found for token ${hederaTokenAddress}`)
    }
    const isPaused = await this.onChainLifeCycleCashFlowService.isPaused(hederaTokenAddress)

    const lifeCycleCashFlowAddress = await this.onChainLifeCycleCashFlowService.deployContract(
      hederaTokenAddress,
      hederaUsdcAddress,
    )

    const asset = Asset.create(
      getAssetInfoResponse.name,
      getAssetInfoResponse.assetType,
      hederaTokenAddress,
      evmTokenAddress,
      getAssetInfoResponse.symbol,
      getAssetInfoResponse.maturityDate,
      isPaused,
    )

    const assetWithLifeCycleCashFlow = asset.withLifeCycleCashFlow(lifeCycleCashFlowAddress)

    await this.assetRepository.saveAsset(assetWithLifeCycleCashFlow)

    await this.syncFromOnChainDomainService.execute()

    return assetWithLifeCycleCashFlow
  }
}
