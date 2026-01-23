// SPDX-License-Identifier: Apache-2.0

import { DisableAssetSyncUseCase } from "@application/use-cases/disable-asset-sync.use-case"
import { EnableAssetSyncUseCase } from "@application/use-cases/enable-asset-sync.use-case"
import { ExecutePayoutUseCase } from "@application/use-cases/execute-payout.use-case"
import { GetAssetDistributionsUseCase } from "@application/use-cases/get-asset-distributions.use-case"
import { GetAssetUseCase } from "@application/use-cases/get-asset.use-case"
import { GetAssetsUseCase } from "@application/use-cases/get-assets.use-case"
import { GetBasicAssetInformationUseCase } from "@application/use-cases/get-basic-asset-information.use-case"
import { ImportAssetUseCase } from "@application/use-cases/import-asset.use-case"
import { PauseAssetUseCase } from "@application/use-cases/pause-asset.use-case"
import { UnpauseAssetUseCase } from "@application/use-cases/unpause-asset.use-case"
import { Body, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from "@nestjs/swagger"
import { DistributionResponse } from "../distribution/distribution.response"
import { PageOptionsRequest } from "../page-options.request"
import { PageResponse } from "../page.response"
import { RestController } from "../rest.decorator"
import { AssetResponse } from "./asset.response"
import { CreatePayoutRequest } from "./create-payout.request"
import { GetBasicAssetInformationRequest } from "./get-basic-asset-information.request"
import { GetBasicAssetInformationResponse } from "./get-basic-asset-information.response"
import { ImportAssetRequest } from "./import-asset.request"
import { GetDistributionHolderCountUseCase } from "@application/use-cases/get-distribution-holder-count.use-case"

@ApiTags("Assets")
@RestController("assets")
export class AssetController {
  constructor(
    private readonly disableAssetSyncUseCase: DisableAssetSyncUseCase,
    private readonly enableAssetSyncUseCase: EnableAssetSyncUseCase,
    private readonly importAssetUseCase: ImportAssetUseCase,
    private readonly pauseAssetUseCase: PauseAssetUseCase,
    private readonly unpauseAssetUseCase: UnpauseAssetUseCase,
    private readonly getAssetUseCase: GetAssetUseCase,
    private readonly getAssetsUseCase: GetAssetsUseCase,
    private readonly getBasicAssetInformationUseCase: GetBasicAssetInformationUseCase,
    private readonly getAssetDistributionsUseCase: GetAssetDistributionsUseCase,
    private readonly getDistributionHolderCountUseCase: GetDistributionHolderCountUseCase,
    private readonly executePayoutUseCase: ExecutePayoutUseCase,
  ) {}

  @ApiOperation({
    summary: "Import an asset so the payments to its holders are managed by the Scheduler Payment Distribution Service",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 201, type: AssetResponse })
  @Post("import")
  async importAsset(@Body() request: ImportAssetRequest): Promise<AssetResponse> {
    const asset = await this.importAssetUseCase.execute(request.hederaTokenAddress)
    return AssetResponse.fromAsset(asset)
  }

  @ApiOperation({ summary: "Pause the Scheduler Payment Distribution Service for a certain asset." })
  @ApiParam({
    name: "assetId",
    description: "The ID of the asset to pause.",
    example: "0.0.123456",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({
    status: 200,
    description: "The asset LifeCycleCashFlow contract has been successfully paused.",
  })
  @Patch(":assetId/pause")
  @HttpCode(HttpStatus.OK)
  async pauseAsset(@Param("assetId") assetId: string): Promise<void> {
    await this.pauseAssetUseCase.execute(assetId)
  }

  @ApiOperation({ summary: "Unpause the Scheduler Payment Distribution Service for a certain asset." })
  @ApiParam({
    name: "assetId",
    description: "The ID of the asset to unpause.",
    example: "0.0.123456",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({
    status: 200,
    description: "The asset LifeCycleCashFlow contract has been successfully unpaused.",
  })
  @Patch(":assetId/unpause")
  @HttpCode(HttpStatus.OK)
  async unpauseAsset(@Param("assetId") assetId: string): Promise<void> {
    await this.unpauseAssetUseCase.execute(assetId)
  }

  @ApiOperation({ summary: "Get the assets list managed by the Scheduler Payment Distribution Service." })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 200, type: PageResponse<AssetResponse> })
  @Get()
  async getAssets(@Query() pageOptions: PageOptionsRequest): Promise<PageResponse<AssetResponse>> {
    const result = await this.getAssetsUseCase.execute(pageOptions.toPageOptions())
    return PageResponse.fromPage(result, AssetResponse.fromAsset)
  }

  @ApiOperation({ summary: "Get a certain asset managed by the Scheduler Payment Distribution Service." })
  @ApiParam({
    name: "assetId",
    description: "The ID of the asset to unpause.",
    example: "0.0.123456",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 200, type: AssetResponse })
  @Get(":assetId")
  async getAsset(@Param("assetId") assetId: string): Promise<AssetResponse> {
    const asset = await this.getAssetUseCase.execute(assetId)
    return AssetResponse.fromAsset(asset)
  }

  @ApiOperation({
    summary: "Get the basic information of a certain asset managed by the Scheduler Payment Distribution Service.",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 200, type: GetBasicAssetInformationResponse })
  @Get(":hederaTokenAddress/metadata")
  async getBasicAssetInformation(
    @Param() request: GetBasicAssetInformationRequest,
  ): Promise<GetBasicAssetInformationResponse> {
    const response = await this.getBasicAssetInformationUseCase.execute(request.hederaTokenAddress)
    return new GetBasicAssetInformationResponse(
      response.hederaTokenAddress,
      response.name,
      response.symbol,
      response.assetType,
      response.maturityDate,
    )
  }

  @ApiOperation({
    summary: "Get distributions information of a certain asset managed by the Scheduler Payment Distribution Service.",
  })
  @ApiParam({
    name: "assetId",
    description: "The ID of the asset to get its distributions information.",
    example: "0.0.123456",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 200, type: PageResponse<DistributionResponse> })
  @Get(":assetId/distributions")
  async getAssetDistributions(
    @Param("assetId") assetId: string,
    @Query() pageOptions: PageOptionsRequest,
  ): Promise<PageResponse<DistributionResponse>> {
    const result = await this.getAssetDistributionsUseCase.execute(assetId, pageOptions.toPageOptions())

    const distributions = PageResponse.fromPage(result, DistributionResponse.fromDistribution)
    for (let i: number = 0; i < distributions.items.length; i++) {
      const distribution = distributions.items[i]
      distribution.holdersNumber = await this.getDistributionHolderCountUseCase.execute(distribution.id)
    }
    return distributions
  }

  @ApiOperation({ summary: "Create a batch payout." })
  @ApiParam({
    name: "assetId",
    description: "The ID of the asset to create a batch payout for",
    example: "0.0.123456",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({
    status: 201,
    description: "The asset payout has been successfully created.",
  })
  @Post(":assetId/distributions/payout")
  @HttpCode(HttpStatus.CREATED)
  async createPayout(@Param("assetId") assetId: string, @Body() request: CreatePayoutRequest): Promise<void> {
    await this.executePayoutUseCase.execute({
      assetId,
      subtype: request.subtype,
      executeAt: request.executeAt ? new Date(request.executeAt) : undefined,
      recurrency: request.recurrency,
      amount: request.amount,
      amountType: request.amountType,
      concept: request.concept,
    })
  }

  @ApiOperation({ summary: "Enable the asset synchronization." })
  @ApiParam({
    name: "assetId",
    description: "The ID of the asset to enable the sync.",
    example: "0.0.123456",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 200, type: AssetResponse })
  @Patch(":assetId/enable-sync")
  @HttpCode(HttpStatus.OK)
  async enableAssetSync(@Param("assetId") assetId: string): Promise<AssetResponse> {
    const asset = await this.enableAssetSyncUseCase.execute(assetId)
    return AssetResponse.fromAsset(asset)
  }

  @ApiOperation({ summary: "Disable the asset synchronization." })
  @ApiParam({
    name: "assetId",
    description: "The ID of the asset to disable the sync.",
    example: "0.0.123456",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 200, type: AssetResponse })
  @Patch(":assetId/disable-sync")
  @HttpCode(HttpStatus.OK)
  async disableAssetSync(@Param("assetId") assetId: string): Promise<AssetResponse> {
    const asset = await this.disableAssetSyncUseCase.execute(assetId)
    return AssetResponse.fromAsset(asset)
  }
}
