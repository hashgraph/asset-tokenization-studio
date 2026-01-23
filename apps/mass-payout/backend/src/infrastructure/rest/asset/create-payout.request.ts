// SPDX-License-Identifier: Apache-2.0

import { AmountType, PayoutSubtype, Recurrency } from "@domain/model/distribution"
import { IsEnum, IsNotEmpty, IsOptional, ValidateIf } from "class-validator"
import { IsFutureDateString } from "src/utils/IsFutureDateString"
import { IsPositiveNumberString } from "src/utils/IsPositiveNumberString"
import { ApiProperty } from "@nestjs/swagger"

export class CreatePayoutRequest {
  @ApiProperty({
    description: "The payout subtype",
    example: "IMMEDIATE | ONE_OFF | RECURRING | AUTOMATED",
  })
  @IsEnum(PayoutSubtype)
  subtype: PayoutSubtype

  @ApiProperty({
    description: "The payout execution date when the subtype is ONE_OFF or RECURRING",
    example: "2025-01-15 13:45:30",
    required: false,
  })
  @ValidateIf((o) => o.subtype && (o.subtype === PayoutSubtype.ONE_OFF || o.subtype === PayoutSubtype.RECURRING))
  @IsFutureDateString()
  executeAt?: string

  @ApiProperty({
    description: "The recurrency of the payout",
    example: "HOURLY | DAILY | WEEKLY | MONTHLY",
    required: false,
  })
  @ValidateIf((o) => o.recurrency)
  @IsEnum(Recurrency)
  recurrency?: Recurrency

  @ApiProperty({
    description: "The amount of the payout when the distribution corresponds to a snapshot payment",
    example: "50",
  })
  @IsNotEmpty()
  @IsPositiveNumberString()
  amount: string

  @ApiProperty({
    description: "The amount type when the distribution corresponds to a snapshot payment",
    example: "FIXED | PERCENTAGE",
  })
  @IsEnum(AmountType)
  amountType: AmountType

  @ApiProperty({
    description: "The concept",
    example: "Settlement",
  })
  @IsOptional()
  concept: string
}
