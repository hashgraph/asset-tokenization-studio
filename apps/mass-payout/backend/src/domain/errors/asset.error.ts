// SPDX-License-Identifier: Apache-2.0

import { InvalidDataError } from "@domain/errors/shared/invalid-data.error"
import { ConflictError } from "@domain/errors/shared/conflict-error"
import { DomainError } from "@domain/errors/shared/domain.error"

export class AssetNameMissingError extends InvalidDataError {
  constructor() {
    super("Asset name is required")
  }
}

export class AssetHederaTokenAddressInvalidError extends InvalidDataError {
  constructor() {
    super("hederaTokenAddress must be in the format 0.0.X")
  }
}

export class AssetEvmTokenAddressInvalidError extends InvalidDataError {
  constructor() {
    super("evmTokenAddress must be a valid Ethereum address")
  }
}

export class AssetLifeCycleCashFlowHederaAddressInvalidError extends InvalidDataError {
  constructor() {
    super("hederaLifeCycleCashFlowAddress must be in the format 0.0.X")
  }
}

export class AssetLifeCycleCashFlowEvmAddressInvalidError extends InvalidDataError {
  constructor() {
    super("evmLifeCycleCashFlowAddress must be a valid Ethereum address")
  }
}

export class AssetNameAlreadyExistsError extends ConflictError {
  constructor(name: string) {
    super(`Asset with name ${name} already exists`)
  }
}

export class AssetHederaTokenAddressAlreadyExistsError extends ConflictError {
  constructor(hederaTokenAddress: string) {
    super(`Asset with hederaTokenAddress ${hederaTokenAddress} already exists`)
  }
}

export class AssetNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Asset with ID ${id} not found`)
  }
}

export class AssetPausedError extends ConflictError {
  constructor(assetName: string, hederaTokenAddress: string) {
    super(`Asset '${assetName}' (${hederaTokenAddress}) is currently paused and cannot be used for distributions`)
  }
}
