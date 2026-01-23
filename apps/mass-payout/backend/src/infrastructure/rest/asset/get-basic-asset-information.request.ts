// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString, Matches } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class GetBasicAssetInformationRequest {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+\.\d+\.\d+$/, { message: "hederaTokenAddress must be a valid Hedera address format" })
  @ApiProperty({ description: "The asset Hedera token contract Id", example: "0.0.123456" })
  hederaTokenAddress: string
}
