// SPDX-License-Identifier: Apache-2.0

import { Injectable, Logger } from "@nestjs/common"
import { Asset } from "@domain/model/asset"
import { AssetPausedError } from "@domain/errors/asset.error"

@Injectable()
export class ValidateAssetPauseStateDomainService {
  private readonly logger = new Logger(ValidateAssetPauseStateDomainService.name)

  /**
   * Validates the pause state of an asset using only the domain state.
   * This is a simplified version that doesn't check the DLT state for better performance.
   * If the asset is paused in the domain, throws AssetPausedError.
   *
   * @param asset - The asset to validate
   * @param distributionId - The distribution ID for logging purposes (optional)
   * @throws AssetPausedError if the asset is paused in the domain
   */
  async validateDomainPauseState(asset: Asset, distributionId?: string): Promise<void> {
    if (asset.isPaused) {
      const logMessage = distributionId
        ? `Attempted to execute operation for paused asset. Asset: ${asset.name} ` +
          `(${asset.hederaTokenAddress}), Distribution ID: ${distributionId}`
        : `Attempted to execute operation on paused asset. Asset: ${asset.name} (${asset.hederaTokenAddress})`

      this.logger.error(logMessage)
      throw new AssetPausedError(asset.name, asset.hederaTokenAddress)
    }

    this.logger.debug(
      `Asset pause state validation passed. Asset: ${asset.name} (${asset.hederaTokenAddress}) is not paused.`,
    )
  }
}
