// SPDX-License-Identifier: Apache-2.0

import { AssetType } from "@domain/model/asset-type.enum"
import { ApiProperty } from "@nestjs/swagger"

export class GetBasicAssetInformationResponse {
  @ApiProperty({
    description: "The asset Hedera token contract Id",
    example: "0.0.123456",
  })
  hederaTokenAddress: string

  @ApiProperty({
    description: "The name of the asset",
    example: "Sella River Clean",
  })
  name: string

  @ApiProperty({
    description: "The symbol of the asset",
    example: "SRC",
  })
  symbol: string

  @ApiProperty({
    description: "The type of the asset",
    example: "Bond | Equity",
  })
  assetType: AssetType

  @ApiProperty({
    description: "The asset maturity date",
    example: "2025-01-15 13:45:30",
  })
  maturityDate?: Date

  constructor(hederaTokenAddress: string, name: string, symbol: string, assetType: AssetType, maturityDate?: Date) {
    this.hederaTokenAddress = hederaTokenAddress
    this.name = name
    this.symbol = symbol
    this.assetType = assetType
    this.maturityDate = maturityDate
  }
}
