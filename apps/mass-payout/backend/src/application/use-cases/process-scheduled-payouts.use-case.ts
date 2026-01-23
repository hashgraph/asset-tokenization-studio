// SPDX-License-Identifier: Apache-2.0

import { Inject, Injectable } from "@nestjs/common"
import { Distribution, DistributionStatus, DistributionType } from "@domain/model/distribution"
import { ExecuteCorporateActionDistributionDomainService } from "@domain/services/execute-corporate-action-distribution.domain-service"
import { SyncFromOnChainDomainService } from "@domain/services/sync-from-onchain.domain-service"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { ExecutePayoutDistributionDomainService } from "@domain/services/execute-payout-distribution.domain-service"

@Injectable()
export class ProcessScheduledPayoutsUseCase {
  constructor(
    @Inject("DistributionRepository")
    private readonly distributionRepository: DistributionRepository,
    private readonly syncFromOnChainDomainService: SyncFromOnChainDomainService,
    private readonly executeCorporateActionDistributionDomainService: ExecuteCorporateActionDistributionDomainService,
    private readonly executePayoutDistributionDomainService: ExecutePayoutDistributionDomainService,
  ) {}

  async execute(): Promise<void> {
    await this.syncFromOnChainDomainService.execute()

    const { startOfDay, endOfDay } = this.getTodayDateRange()
    const distributionsDueToday = await this.distributionRepository.findByExecutionDateRange(
      startOfDay,
      endOfDay,
      DistributionStatus.SCHEDULED,
    )

    await this.processDistributions(distributionsDueToday)
  }

  private getTodayDateRange(): { startOfDay: Date; endOfDay: Date } {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(startOfDay)
    endOfDay.setHours(23, 59, 59, 999)

    return { startOfDay, endOfDay }
  }

  private async processDistributions(distributions: Distribution[]): Promise<void> {
    for (const distribution of distributions) {
      switch (distribution.details.type) {
        case DistributionType.PAYOUT:
          await this.executePayoutDistributionDomainService.execute(distribution)
          break
        case DistributionType.CORPORATE_ACTION:
          await this.executeCorporateActionDistributionDomainService.execute(distribution)
          break
      }
    }
  }
}
