// SPDX-License-Identifier: Apache-2.0

import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { ProcessScheduledPayoutsUseCase } from "@application/use-cases/process-scheduled-payouts.use-case"

@Injectable()
export class MassPayoutCronService {
  private readonly logger = new Logger(MassPayoutCronService.name)

  constructor(private readonly processScheduledPayoutsUseCase: ProcessScheduledPayoutsUseCase) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleScheduledPayouts(): Promise<void> {
    this.logger.log("Starting scheduled mass payouts execution")
    await this.processScheduledPayoutsUseCase.execute()
  }
}
