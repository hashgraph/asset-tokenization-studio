// SPDX-License-Identifier: Apache-2.0

import { GetDistributionHoldersUseCase } from "@application/use-cases/get-distribution-holders.use-case"
import { GetDistributionsUseCase } from "@application/use-cases/get-distributions.use-case"
import { DistributionResponse } from "@infrastructure/rest/distribution/distribution.response"
import { PageOptionsRequest } from "@infrastructure/rest/page-options.request"
import { PageResponse } from "@infrastructure/rest/page.response"
import { RestController } from "@infrastructure/rest/rest.decorator"
import { Get, HttpCode, HttpStatus, Param, Patch, Query } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from "@nestjs/swagger"
import { HolderResponse } from "@infrastructure/rest/responses/holder.response"
import { GetDistributionUseCase } from "@application/use-cases/get-distribution.use-case"
import { CancelDistributionUseCase } from "@application/use-cases/cancel-distribution.use-case"
import { RetryFailedHoldersUseCase } from "@application/use-cases/retry-failed-holders.use-case"

@ApiTags("Distributions")
@RestController("distributions")
export class DistributionController {
  constructor(
    private readonly getDistributionsUseCase: GetDistributionsUseCase,
    private readonly getDistributionHoldersUseCase: GetDistributionHoldersUseCase,
    private readonly getDistributionUseCase: GetDistributionUseCase,
    private readonly cancelDistributionUseCase: CancelDistributionUseCase,
    private readonly retryFailedHoldersUseCase: RetryFailedHoldersUseCase,
  ) {}

  @ApiOperation({ summary: "Get all distributions managed by the Scheduler Payment Distribution Service." })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 200, type: PageResponse<DistributionResponse> })
  @Get()
  async getDistributions(@Query() pageOptionsRequest: PageOptionsRequest): Promise<PageResponse<DistributionResponse>> {
    const pageOptions = pageOptionsRequest.toPageOptions()
    const distributions = await this.getDistributionsUseCase.execute(pageOptions)
    return PageResponse.fromPage(distributions, DistributionResponse.fromDistribution)
  }

  @ApiOperation({ summary: "Get a certain distribution managed by the Scheduler Payment Distribution Service." })
  @ApiParam({
    name: "distributionId",
    description: "The ID of the distribution to get.",
    example: "123456",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 200, type: DistributionResponse })
  @Get(":distributionId")
  async getDistribution(@Param("distributionId") distributionId: string): Promise<DistributionResponse> {
    const distribution = await this.getDistributionUseCase.execute(distributionId)
    return DistributionResponse.fromDistribution(distribution)
  }

  @ApiOperation({
    summary: "Get the holders of a certain distribution managed by the Scheduler Payment Distribution Service.",
  })
  @ApiParam({
    name: "distributionId",
    description: "The ID of the distribution to get its holders.",
    example: "123456",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 200, type: PageResponse<HolderResponse> })
  @Get(":distributionId/holders")
  async getHolders(
    @Param("distributionId") distributionId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<HolderResponse>> {
    const pageOptions = pageOptionsRequest.toPageOptions()
    const holders = await this.getDistributionHoldersUseCase.execute(distributionId, pageOptions)
    return PageResponse.fromPage(holders, HolderResponse.fromHolder)
  }

  @ApiOperation({ summary: "Cancel a distribution." })
  @ApiParam({
    name: "distributionId",
    description: "The ID of the distribution to cancel.",
    example: "123456",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({
    status: 200,
    description: "The distribution has been successfully cancelled.",
  })
  @Patch(":distributionId/cancel")
  @HttpCode(HttpStatus.OK)
  async cancelDistribution(@Param("distributionId") distributionId: string): Promise<void> {
    await this.cancelDistributionUseCase.execute({
      distributionId,
    })
  }

  @ApiOperation({ summary: "Retry a distribution." })
  @ApiParam({
    name: "distributionId",
    description: "The ID of the distribution to cancel.",
    example: "123456",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({
    status: 200,
    description: "The distribution has been successfully retried.",
  })
  @ApiResponse({})
  @Patch(":distributionId/retry")
  @HttpCode(HttpStatus.OK)
  async retryDistribution(@Param("distributionId") distributionId: string): Promise<void> {
    await this.retryFailedHoldersUseCase.execute({
      distributionId,
    })
  }
}
