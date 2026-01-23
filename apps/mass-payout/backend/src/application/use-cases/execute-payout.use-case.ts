// SPDX-License-Identifier: Apache-2.0

import { AssetNotFoundError } from "@domain/errors/asset.error"
import { InvalidPayoutSubtypeError } from "@domain/errors/payout.error"
import { AmountType, Distribution, PayoutSubtype, Recurrency } from "@domain/model/distribution"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { ExecutePayoutDistributionDomainService } from "@domain/services/execute-payout-distribution.domain-service"
import { Inject, Injectable } from "@nestjs/common"

export interface ExecutePayoutCommand {
  assetId: string
  subtype: PayoutSubtype
  executeAt?: Date
  recurrency?: Recurrency
  amount: string
  amountType: AmountType
  concept?: string
}
@Injectable()
export class ExecutePayoutUseCase {
  constructor(
    @Inject("AssetRepository")
    private readonly assetRepository: AssetRepository,
    @Inject("DistributionRepository")
    private readonly distributionRepository: DistributionRepository,
    private readonly executePayoutDistributionDomainService: ExecutePayoutDistributionDomainService,
  ) {}

  async execute(command: ExecutePayoutCommand): Promise<void> {
    const { assetId, subtype, executeAt, amount, amountType, recurrency, concept } = command
    const asset = await this.assetRepository.getAsset(assetId)
    if (!asset) {
      throw new AssetNotFoundError(`Asset with id ${assetId} not found`)
    }
    let distribution: Distribution
    switch (subtype) {
      case PayoutSubtype.IMMEDIATE: {
        distribution = Distribution.createImmediate(asset, amount, amountType, undefined, undefined, concept)
        await this.distributionRepository.saveDistribution(distribution)
        await this.executePayoutDistributionDomainService.execute(distribution)
        break
      }
      case PayoutSubtype.ONE_OFF: {
        distribution = Distribution.createOneOff(asset, executeAt, amount, amountType, undefined, undefined, concept)
        await this.distributionRepository.saveDistribution(distribution)
        break
      }
      case PayoutSubtype.RECURRING: {
        distribution = Distribution.createRecurring(
          asset,
          executeAt,
          recurrency,
          amount,
          amountType,
          undefined,
          undefined,
          concept,
        )
        await this.distributionRepository.saveDistribution(distribution)
        break
      }
      case PayoutSubtype.AUTOMATED: {
        distribution = Distribution.createAutomated(asset, amount, amountType, concept)
        await this.distributionRepository.saveDistribution(distribution)
        break
      }
      default:
        throw new InvalidPayoutSubtypeError(`Unsupported payout subtype: ${subtype}`)
    }
  }
}
