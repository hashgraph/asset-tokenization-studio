// SPDX-License-Identifier: Apache-2.0

import { AssetType } from "@domain/model/asset-type.enum"

export interface GetAssetInfoResponse {
  readonly hederaTokenAddress: string
  readonly name: string
  readonly symbol: string
  readonly assetType: AssetType
  readonly maturityDate?: Date
}
