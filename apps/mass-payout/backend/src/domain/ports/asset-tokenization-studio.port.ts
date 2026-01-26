// SPDX-License-Identifier: Apache-2.0

import { GetAssetInfoResponse } from "@domain/ports/get-asset-info-response.interface"

export interface AssetTokenizationStudioService {
  getAssetInfo(hederaTokenId: string): Promise<GetAssetInfoResponse>

  takeSnapshot(hederaTokenId: string): Promise<number>
}
