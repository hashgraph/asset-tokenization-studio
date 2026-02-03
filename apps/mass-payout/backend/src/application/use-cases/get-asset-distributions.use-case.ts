// SPDX-License-Identifier: Apache-2.0

import { Distribution } from "@domain/model/distribution"
import { Page, PageOptions } from "@domain/model/page"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { Inject, Injectable } from "@nestjs/common"

@Injectable()
export class GetAssetDistributionsUseCase {
  constructor(
    @Inject("DistributionRepository")
    private readonly distributionRepository: DistributionRepository,
  ) {}

  async execute(assetId: string, pageOptions: PageOptions = PageOptions.DEFAULT): Promise<Page<Distribution>> {
    return this.distributionRepository.getDistributionsByAssetId(assetId, pageOptions)
  }
}
