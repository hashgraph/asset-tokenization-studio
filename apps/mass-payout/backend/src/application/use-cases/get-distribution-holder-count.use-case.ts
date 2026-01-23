// SPDX-License-Identifier: Apache-2.0

import { HolderRepository } from "@domain/ports/holder-repository.port"
import { Inject, Injectable } from "@nestjs/common"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { DistributionNotFoundError } from "@domain/errors/distribution.error"

@Injectable()
export class GetDistributionHolderCountUseCase {
  constructor(
    @Inject("DistributionRepository")
    private readonly distributionRepository: DistributionRepository,
    @Inject("HolderRepository")
    private readonly holderRepository: HolderRepository,
  ) {}

  async execute(distributionId: string): Promise<number> {
    const distribution = await this.distributionRepository.getDistribution(distributionId)
    if (!distribution) {
      throw new DistributionNotFoundError(distributionId)
    }

    return await this.holderRepository.countHoldersByDistributionId(distributionId)
  }
}
