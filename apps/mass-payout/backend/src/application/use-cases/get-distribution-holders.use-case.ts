// SPDX-License-Identifier: Apache-2.0

import { Holder } from "@domain/model/holder"
import { Page, PageOptions } from "@domain/model/page"
import { HolderRepository } from "@domain/ports/holder-repository.port"
import { Inject, Injectable } from "@nestjs/common"
import { GetDistributionUseCase } from "./get-distribution.use-case"

@Injectable()
export class GetDistributionHoldersUseCase {
  constructor(
    private readonly getDistributionUseCase: GetDistributionUseCase,
    @Inject("HolderRepository")
    private readonly holderRepository: HolderRepository,
  ) {}

  async execute(distributionId: string, pageOptions: PageOptions): Promise<Page<Holder>> {
    await this.getDistributionUseCase.execute(distributionId)
    return this.holderRepository.getHoldersByDistributionId(distributionId, pageOptions)
  }
}
