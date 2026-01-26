// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty } from "class-validator"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { Inject, Injectable } from "@nestjs/common"
import { DistributionNotFoundError } from "@domain/errors/distribution.error"
import { Distribution } from "@domain/model/distribution"

export class CancelDistributionCommand {
  @IsNotEmpty()
  distributionId: string
}

@Injectable()
export class CancelDistributionUseCase {
  constructor(
    @Inject("DistributionRepository")
    private readonly distributionRepository: DistributionRepository,
  ) {}

  async execute(command: CancelDistributionCommand): Promise<void> {
    const distribution: Distribution = await this.distributionRepository.getDistribution(command.distributionId)
    if (!distribution) {
      throw new DistributionNotFoundError(command.distributionId)
    }
    distribution.cancel()

    await this.distributionRepository.updateDistribution(distribution)
  }
}
