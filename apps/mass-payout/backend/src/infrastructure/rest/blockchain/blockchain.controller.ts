// SPDX-License-Identifier: Apache-2.0

import { GetBlockchainEventListenerConfigUseCase } from "@application/use-cases/get-blockchain-event-listener-config.use-case"
import { StartBlockchainPollingUseCase } from "@application/use-cases/start-blockchain-polling.use-case"
import { StopBlockchainPollingUseCase } from "@application/use-cases/stop-blockchain-polling.use-case"
import { UpsertBlockchainEventListenerConfigUseCase } from "@application/use-cases/upsert-blockchain-event-listener-config.use-case"
import { BlockchainEventListenerConfig } from "@domain/model/blockchain-listener"
import { Body, Get, Patch, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags, ApiExtraModels, ApiBody } from "@nestjs/swagger"
import { RestController } from "../rest.decorator"

@ApiTags("Blockchain Event Listener")
@RestController("blockchain")
export class BlockchainController {
  constructor(
    private readonly startBlockchainUseCase: StartBlockchainPollingUseCase,
    private readonly stopBlockchainUseCase: StopBlockchainPollingUseCase,
    private readonly upsertBlockchainEventListenerConfigUseCase: UpsertBlockchainEventListenerConfigUseCase,
    private readonly getBlockchainEventListenerConfigUseCase: GetBlockchainEventListenerConfigUseCase,
  ) {}

  @ApiOperation({ summary: "Get the payment token transfers events listener polling process ." })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 200, type: BlockchainEventListenerConfig })
  @Get("/config")
  async getConfig(): Promise<BlockchainEventListenerConfig> {
    return await this.getBlockchainEventListenerConfigUseCase.execute()
  }

  @ApiOperation({ summary: "Create or update the payment token transfers events listener polling process." })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiExtraModels(BlockchainEventListenerConfig)
  @ApiBody({ type: BlockchainEventListenerConfig, required: false })
  @ApiResponse({ status: 201, type: BlockchainEventListenerConfig })
  @Post("/config")
  async upsertConfig(@Body() body: Partial<BlockchainEventListenerConfig>): Promise<BlockchainEventListenerConfig> {
    const config = await this.getBlockchainEventListenerConfigUseCase.execute()
    return await this.upsertBlockchainEventListenerConfigUseCase.execute({ ...config, ...body })
  }

  @ApiOperation({ summary: "Start the payment token transfers events polling process." })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({
    status: 200,
    description: "The polling process has been successfully started.",
  })
  @Patch("/polling/start")
  async start(): Promise<void> {
    await this.startBlockchainUseCase.execute()
  }

  @ApiOperation({ summary: "Stop the payment token transfers events polling process." })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({
    status: 200,
    description: "The polling process has been successfully stopped.",
  })
  @Patch("/polling/stop")
  async stop(): Promise<void> {
    await this.stopBlockchainUseCase.execute()
  }
}
