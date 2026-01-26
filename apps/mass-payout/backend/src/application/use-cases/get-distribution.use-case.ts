// SPDX-License-Identifier: Apache-2.0

import { Injectable, Inject } from "@nestjs/common"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { Distribution } from "@domain/model/distribution"
import { DistributionNotFoundError } from "@domain/errors/distribution.error"

@Injectable()
export class GetDistributionUseCase {
  constructor(@Inject("DistributionRepository") private readonly distributionRepository: DistributionRepository) {}

  async execute(distributionId: string): Promise<Distribution> {
    const distribution = await this.distributionRepository.getDistribution(distributionId)

    if (!distribution) {
      throw new DistributionNotFoundError(distributionId)
    }

    return distribution
  }
}
