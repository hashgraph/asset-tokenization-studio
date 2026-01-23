// SPDX-License-Identifier: Apache-2.0

import { Asset } from "@domain/model/asset"
import { ApiProperty } from "@nestjs/swagger"

export class AssetResponse {
  @ApiProperty({
    description: "The id of the asset in the service",
    example: "32264ce1-76fb-44bb-a8a2-d1a516dcf34d",
  })
  id: string

  @ApiProperty({
    description: "The name of the asset",
    example: "Sella River Clean",
  })
  name: string

  @ApiProperty({
    description: "The type of the asset",
    example: "BOND | EQUITY",
  })
  type: string

  @ApiProperty({
    description: "The asset Hedera token contract Id",
    example: "0.0.123456",
  })
  hederaTokenAddress: string

  @ApiProperty({
    description: "The EVM address of the asset Hedera token contract",
    example: "0x0123456789abcdef0123456789abcdef01234567",
  })
  evmTokenAddress: string

  @ApiProperty({
    description: "The symbol of the asset",
    example: "SRC",
  })
  symbol: string

  @ApiProperty({
    description: "The LifeCycleCashFlow Hedera contract Id",
    example: "0.0.123456",
    required: false,
  })
  lifeCycleCashFlowHederaAddress?: string

  @ApiProperty({
    description: "The EVM address of the LifeCycleCashFlow Hedera contract",
    example: "0x0123456789abcdef0123456789abcdef01234567",
    required: false,
  })
  lifeCycleCashFlowEvmAddress?: string

  @ApiProperty({
    description: "The asset maturity date",
    example: "2025-01-15 13:45:30",
    required: false,
  })
  maturityDate?: Date

  @ApiProperty({
    description: "Whether the asset is paused",
    example: "true | false",
  })
  isPaused: boolean

  @ApiProperty({
    description: "Whether the asset sync is enabled",
    example: "true | false",
  })
  syncEnabled: boolean

  @ApiProperty({
    description: "The asset creation date in the service",
    example: "2025-01-15 13:45:30",
  })
  createdAt: Date

  @ApiProperty({
    description: "The asset update date in the service",
    example: "2025-01-15 13:45:30",
  })
  updatedAt: Date

  static fromAsset(asset: Asset): AssetResponse {
    const response = new AssetResponse()
    response.id = asset.id
    response.name = asset.name
    response.type = asset.type
    response.hederaTokenAddress = asset.hederaTokenAddress
    response.evmTokenAddress = asset.evmTokenAddress
    response.symbol = asset.symbol
    response.lifeCycleCashFlowHederaAddress = asset.lifeCycleCashFlowHederaAddress
    response.lifeCycleCashFlowEvmAddress = asset.lifeCycleCashFlowEvmAddress
    response.maturityDate = asset.maturityDate
    response.isPaused = asset.isPaused
    response.syncEnabled = asset.syncEnabled
    response.createdAt = asset.createdAt
    response.updatedAt = asset.updatedAt
    return response
  }
}
