// SPDX-License-Identifier: Apache-2.0

import { BlockchainEvent, TransferEvent } from "@domain/model/blockchain-listener"
import { Distribution } from "@domain/model/distribution"
import { BlockchainEventListenerService } from "@domain/ports/blockchain-event-listener.service"
import { DistributionRepository } from "@domain/ports/distribution-repository.port"
import { ExecutePayoutDistributionDomainService } from "@domain/services/execute-payout-distribution.domain-service"
import { Inject, Injectable, Logger } from "@nestjs/common"
import chalk from "chalk"

@Injectable()
export class ProcessBlockchainEventsUseCase {
  private readonly logger = new Logger(ProcessBlockchainEventsUseCase.name)

  constructor(
    @Inject("BlockchainEventListenerService")
    private readonly blockchainEventListener: BlockchainEventListenerService,
    @Inject("DistributionRepository")
    private readonly distributionRepository: DistributionRepository,
    private readonly executePayoutDistributionDomainService: ExecutePayoutDistributionDomainService,
  ) {}

  async execute(): Promise<void> {
    const events: BlockchainEvent[] = await this.blockchainEventListener.fetchNewEvents()
    let lastTimestampEvent: string = "0"
    for (const event of events) {
      if (Number(lastTimestampEvent) < Number(event.timestamp)) {
        lastTimestampEvent = event.timestamp
      }
      if (!this.isTransferEvent(event)) {
        this.logger.verbose(`Skipping non-transfer event: ${chalk.yellow(JSON.stringify(event.to))}`)
        continue
      }
      const distributions = await this.getDistributions((event as TransferEvent).to)
      if (!distributions.length) {
        this.logger.verbose(`Skipping event with no distributions: ${chalk.yellow(JSON.stringify(event.to))}`)
        continue
      }
      this.logger.verbose(`${chalk.yellow(JSON.stringify(event, null, 2))}`)
      this.logger.verbose(
        `Found ${distributions.length} distributions for event to: ${chalk.green(JSON.stringify(event.to))}`,
      )
      for (const distribution of distributions) {
        this.logger.debug(
          `Processing distribution with id: ${chalk.green(JSON.stringify(distribution.id))} to: ${chalk.green(
            JSON.stringify(event.to),
          )} from: ${chalk.green(JSON.stringify(event.from))}`,
        )
        await this.executeDistribution(distribution)
      }
    }
    await this.blockchainEventListener.updateStartTimestamp(lastTimestampEvent)
    this.logger.verbose(`Processed ${events.length} blockchain events`)
  }

  private async getDistributions(address: string): Promise<Distribution[]> {
    return await this.distributionRepository.getScheduledAutomatedDistributionsByEvmAddress(address)
  }

  private async executeDistribution(distribution: Distribution): Promise<void> {
    try {
      await this.executePayoutDistributionDomainService.execute(distribution)
    } catch (error) {
      this.logger.error(
        `Error calling automatic payout for distribution: "${distribution.id}" with error: ${error.message}`,
        error.stack,
      )
    }
  }

  private isTransferEvent(event: BlockchainEvent): boolean {
    return event.name === "Transfer" && (event as TransferEvent).value > 0
  }
}
