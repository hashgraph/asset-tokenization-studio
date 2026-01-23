// SPDX-License-Identifier: Apache-2.0

import {
  CorporateActionDetails,
  Distribution,
  DistributionType,
  PayoutDetails,
  PayoutSubtype,
  Recurrency,
} from "@domain/model/distribution"
import { AssetResponse } from "@infrastructure/rest/asset/asset.response"
import { Logger } from "@nestjs/common"
import { ApiProperty } from "@nestjs/swagger"

export class DistributionResponse {
  private static readonly logger = new Logger(DistributionResponse.name)

  @ApiProperty({
    description: "The id of the distribution in the service",
    example: "32264ce1-76fb-44bb-a8a2-d1a516dcf34d",
  })
  id: string

  @ApiProperty({
    type: () => AssetResponse,
  })
  asset: AssetResponse

  @ApiProperty({
    description: "The distribution type",
    example: "PAYOUT | CORPORATE_ACTION",
  })
  type: string

  @ApiProperty({
    description: "The ID of the corporate action",
    example: "23514",
    required: false,
  })
  corporateActionID?: string

  @ApiProperty({
    description: "The execution date",
    example: "2025-01-15 13:45:30",
    required: false,
  })
  executionDate?: Date

  @ApiProperty({
    description: "The amount of the distribution when the distribution corresponds to a snapshot payment",
    example: "50",
    required: false,
  })
  amount?: string

  @ApiProperty({
    description: "The amount type when the distribution corresponds to a snapshot payment",
    example: "FIXED | PERCENTAGE",
    required: false,
  })
  amountType?: string

  @ApiProperty({
    description: "The concept",
    example: "Settlement",
    required: false,
  })
  concept?: string

  @ApiProperty({
    description: "The payout subtype",
    example: "IMMEDIATE | ONE_OFF | RECURRING | AUTOMATED",
    required: false,
  })
  subtype?: string

  @ApiProperty({
    description: "The status of the distribution process",
    example: "SCHEDULED | IN_PROGRESS | FAILED | COMPLETED | CANCELLED",
  })
  status: string

  @ApiProperty({
    description: "The holders number the distribution has to pay to",
    example: "80",
  })
  holdersNumber: number

  @ApiProperty({
    description: "The recurrency of the distribution process",
    example: "HOURLY | DAILY | WEEKLY | MONTHLY",
    required: false,
  })
  recurrency?: Recurrency

  @ApiProperty({
    description: "The distribution creation date in the service",
    example: "2025-01-15 13:45:30",
  })
  createdAt: Date

  @ApiProperty({
    description: "The distribution update date in the service",
    example: "2025-01-15 13:45:30",
  })
  updatedAt: Date

  static fromDistribution(distribution: Distribution): DistributionResponse {
    const response = new DistributionResponse()
    response.id = distribution.id
    response.asset = AssetResponse.fromAsset(distribution.asset)
    response.type = distribution.details.type
    response.status = distribution.status
    response.createdAt = distribution.createdAt
    response.updatedAt = distribution.updatedAt

    if (distribution.details.type === DistributionType.CORPORATE_ACTION) {
      const corporateActionDetails = distribution.details as CorporateActionDetails
      response.corporateActionID = corporateActionDetails.corporateActionId?.value || null
      response.executionDate = corporateActionDetails.executionDate
    } else if (distribution.details.type === DistributionType.PAYOUT) {
      const payoutDetails = distribution.details as PayoutDetails
      response.amount = payoutDetails.amount
      response.amountType = payoutDetails.amountType
      response.concept = payoutDetails.concept
      response.subtype = payoutDetails.subtype

      if (distribution.details.subtype == PayoutSubtype.IMMEDIATE) {
        response.executionDate = distribution.createdAt
      } else if ("executeAt" in payoutDetails) {
        response.executionDate = payoutDetails.executeAt
      }
      if (distribution.details.subtype == PayoutSubtype.RECURRING) {
        response.recurrency = distribution.details.recurrency
      }
    }

    return response
  }
}
