// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty } from "class-validator"
import { Injectable } from "@nestjs/common"
import { RetryFailedHoldersDomainService } from "@domain/services/retry-failed-holders.domain-service"

export class RetryFailedHoldersCommand {
  @IsNotEmpty()
  distributionId: string
}

@Injectable()
export class RetryFailedHoldersUseCase {
  constructor(private readonly retryFailedHolderDomainService: RetryFailedHoldersDomainService) {}

  async execute(command: RetryFailedHoldersCommand): Promise<void> {
    await this.retryFailedHolderDomainService.execute(command.distributionId)
  }
}
