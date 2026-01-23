// SPDX-License-Identifier: Apache-2.0

import { PageOptions } from "@domain/model/page"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { Inject, Injectable } from "@nestjs/common"

@Injectable()
export class GetDistributionsUseCase {
  constructor(
    @Inject("DistributionRepository")
    private readonly distributionRepository: DistributionRepository,
  ) {}

  async execute(pageOptions: PageOptions) {
    return this.distributionRepository.getDistributions(pageOptions)
  }
}
