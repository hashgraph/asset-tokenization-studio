// SPDX-License-Identifier: Apache-2.0

import { CustomError } from "@domain/errors/shared/custom.error"
import { Asset } from "@domain/model/asset"

export class AssetRepositoryError extends CustomError {
  static readonly ERRORS = {
    SAVE_ASSET: (asset: Asset) => `Error saving asset: ${JSON.stringify(asset)}.`,
    DUPLICATED_ASSET: (name: string, hederaTokenAddress: string) =>
      `Duplicate asset detected – name “${name}” or Hedera address “${hederaTokenAddress}” is already registered.`,
    GET_ASSET: (id: string) => `Error getting asset with id: ${id}.`,
    GET_ASSET_BY_NAME: (name: string) => `Error getting asset with name: ${name}.`,
    GET_ASSET_BY_HEDERA_TOKEN_ADDRESS: (hederaTokenAddress: string) =>
      `Error getting asset with hederaTokenAddress: ${hederaTokenAddress}.`,
    UPDATE_ASSET: (id: string) => `Error updating asset with id: ${JSON.stringify(id)}.`,
    GET_ASSETS: () => "Error getting assets",
    GET_SYNC_ENABLED_ASSETS: () => "Error getting sync enabled assets",
    DELETE_ASSETS: (ids: string[]) => `Error deleting assets with ids: ${JSON.stringify(ids)}.`,
  }

  constructor(
    message: string,
    public originalError?: Error,
  ) {
    super(message, originalError)
  }
}
