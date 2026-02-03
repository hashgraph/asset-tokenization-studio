// SPDX-License-Identifier: Apache-2.0

import { isNil } from "@nestjs/common/utils/shared.utils"
import {
  AssetLifeCycleCashFlowEvmAddressInvalidError,
  AssetLifeCycleCashFlowHederaAddressInvalidError,
} from "@domain/errors/asset.error"

export class LifeCycleCashFlowAddress {
  private static readonly HEDERA_ADDRESS_REGEX = /^\d+\.\d+\.\d+$/
  private static readonly EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

  private constructor(
    readonly hederaAddress: string,
    readonly evmAddress: string,
  ) {
    this.validateHederaAddress()
    this.validateEvmAddress()
  }

  static create(hederaAddress: string, evmAddress: string): LifeCycleCashFlowAddress {
    return new LifeCycleCashFlowAddress(hederaAddress, evmAddress)
  }

  private validateHederaAddress(): void {
    if (isNil(this.hederaAddress) || !LifeCycleCashFlowAddress.HEDERA_ADDRESS_REGEX.test(this.hederaAddress)) {
      throw new AssetLifeCycleCashFlowHederaAddressInvalidError()
    }
  }

  private validateEvmAddress(): void {
    if (isNil(this.evmAddress) || !LifeCycleCashFlowAddress.EVM_ADDRESS_REGEX.test(this.evmAddress)) {
      throw new AssetLifeCycleCashFlowEvmAddressInvalidError()
    }
  }
}
