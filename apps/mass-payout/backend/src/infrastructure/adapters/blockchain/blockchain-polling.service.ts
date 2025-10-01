import { ProcessBlockchainEventsUseCase } from "@application/use-cases/process-blockchain-events.use-case"
import { ConfigKeys } from "@config/config-keys"
import { BlockchainPollingPort } from "@domain/ports/blockchain-polling.port"
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class BlockchainPollingService implements OnModuleInit, OnModuleDestroy, BlockchainPollingPort {
  private readonly logger = new Logger(BlockchainPollingService.name)
  private intervalId: NodeJS.Timeout | null = null
  private readonly pollTimeout: number
  private readonly isEnabled: boolean = true

  constructor(
    private readonly processBlockchainEventsUseCase: ProcessBlockchainEventsUseCase,
    private readonly configService: ConfigService,
  ) {
    this.pollTimeout = configService.get(ConfigKeys.BLOCKCHAIN_LISTENER_POLL_TIMEOUT)
  }

  onModuleInit() {
    if (this.isEnabled) {
      this.start()
    }
  }

  onModuleDestroy() {
    this.stop()
  }

  async start(): Promise<void> {
    if (this.intervalId || !this.isEnabled) {
      return
    }
    this.logger.log(`Blockchain polling started: (interval: ${this.pollTimeout}ms)`)
    await this.executeWithErrorHandling()
    this.intervalId = setInterval(async () => {
      await this.executeWithErrorHandling()
    }, this.pollTimeout)
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      this.logger.log("Blockchain Polling stopped")
    }
  }

  restart(): void {
    this.stop()
    this.start()
  }

  get isRunning(): boolean {
    return this.intervalId !== null
  }

  private async executeWithErrorHandling(): Promise<void> {
    try {
      await this.processBlockchainEventsUseCase.execute()
    } catch (error) {
      this.logger.error(`Blockchain polling error: ${error.message}`, error.stack)
    }
  }
}
