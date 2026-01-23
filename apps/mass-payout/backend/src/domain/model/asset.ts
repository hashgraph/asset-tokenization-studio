// SPDX-License-Identifier: Apache-2.0

import {
  AssetEvmTokenAddressInvalidError,
  AssetHederaTokenAddressInvalidError,
  AssetLifeCycleCashFlowEvmAddressInvalidError,
  AssetLifeCycleCashFlowHederaAddressInvalidError,
  AssetNameMissingError,
} from "@domain/errors/asset.error"
import { AssetType } from "@domain/model/asset-type.enum"
import { BaseEntity } from "@domain/model/base-entity"
import { isNil } from "@nestjs/common/utils/shared.utils"
import { LifeCycleCashFlowAddress } from "./life-cycle-cash-flow-address.value-object"

export class Asset extends BaseEntity {
  private static readonly HEDERA_ADDRESS_REGEX = /^\d+\.\d+\.\d+$/
  private static readonly EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

  constructor(
    readonly id: string,
    readonly name: string,
    readonly type: AssetType,
    readonly hederaTokenAddress: string,
    readonly evmTokenAddress: string,
    readonly symbol: string,
    readonly maturityDate?: Date,
    readonly lifeCycleCashFlowHederaAddress?: string,
    readonly lifeCycleCashFlowEvmAddress?: string,
    readonly isPaused: boolean = false,
    readonly syncEnabled: boolean = true,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt)
    this.validateFields()
  }

  copyWith(props: Partial<Asset>): Asset {
    return new Asset(
      props.id ?? this.id,
      props.name ?? this.name,
      props.type ?? this.type,
      props.hederaTokenAddress ?? this.hederaTokenAddress,
      props.evmTokenAddress ?? this.evmTokenAddress,
      props.symbol ?? this.symbol,
      props.maturityDate ?? this.maturityDate,
      props.lifeCycleCashFlowHederaAddress ?? this.lifeCycleCashFlowHederaAddress,
      props.lifeCycleCashFlowEvmAddress ?? this.lifeCycleCashFlowEvmAddress,
      props.isPaused ?? this.isPaused,
      props.syncEnabled ?? this.syncEnabled,
      props.createdAt ?? this.createdAt,
      props.updatedAt ?? this.updatedAt,
    )
  }

  static create(
    name: string,
    type: AssetType,
    hederaTokenAddress: string,
    evmTokenAddress: string,
    symbol: string,
    maturityDate?: Date,
    isPaused: boolean = false,
    syncEnabled: boolean = true,
  ): Asset {
    return new Asset(
      crypto.randomUUID(),
      name,
      type,
      hederaTokenAddress,
      evmTokenAddress,
      symbol,
      maturityDate,
      undefined,
      undefined,
      isPaused,
      syncEnabled,
    )
  }

  static createExisting(
    assetId: string,
    name: string,
    type: AssetType,
    hederaTokenAddress: string,
    evmTokenAddress: string,
    symbol: string,
    maturityDate: Date | undefined,
    hederaLifeCycleCashFlowAddress: string,
    evmLifeCycleCashFlowAddress: string,
    isPaused: boolean,
    syncEnabled: boolean,
    createdAt: Date,
    updatedAt: Date,
  ): Asset {
    return new Asset(
      assetId,
      name,
      type,
      hederaTokenAddress,
      evmTokenAddress,
      symbol,
      maturityDate,
      hederaLifeCycleCashFlowAddress,
      evmLifeCycleCashFlowAddress,
      isPaused,
      syncEnabled,
      createdAt,
      updatedAt,
    )
  }

  withLifeCycleCashFlow(lifeCycleCashFlowAddress: LifeCycleCashFlowAddress): Asset {
    return this.copyWith({
      lifeCycleCashFlowHederaAddress: lifeCycleCashFlowAddress.hederaAddress,
      lifeCycleCashFlowEvmAddress: lifeCycleCashFlowAddress.evmAddress,
      updatedAt: new Date(),
    })
  }

  withName(name: string): Asset {
    return this.copyWith({
      name,
      updatedAt: new Date(),
    })
  }

  withType(type: AssetType): Asset {
    return this.copyWith({
      type,
      updatedAt: new Date(),
    })
  }

  pause(): Asset {
    return this.copyWith({
      isPaused: true,
      updatedAt: new Date(),
    })
  }

  unpause(): Asset {
    return this.copyWith({
      isPaused: false,
      updatedAt: new Date(),
    })
  }

  enableSync(): Asset {
    return this.copyWith({
      syncEnabled: true,
      updatedAt: new Date(),
    })
  }

  disableSync(): Asset {
    return this.copyWith({
      syncEnabled: false,
      updatedAt: new Date(),
    })
  }

  private validateFields(): void {
    this.validateName()
    this.validateHederaTokenAddress()
    this.validateEvmTokenAddress()
    this.validateHederaLifeCycleCashFlowAddress()
    this.validateEvmLifeCycleCashFlowAddress()
  }

  private validateName(): void {
    if (isNil(this.name) || this.name.trim().length === 0) {
      throw new AssetNameMissingError()
    }
  }

  private validateHederaTokenAddress(): void {
    if (isNil(this.hederaTokenAddress) || !Asset.HEDERA_ADDRESS_REGEX.test(this.hederaTokenAddress)) {
      throw new AssetHederaTokenAddressInvalidError()
    }
  }

  private validateEvmTokenAddress(): void {
    if (isNil(this.evmTokenAddress) || !Asset.EVM_ADDRESS_REGEX.test(this.evmTokenAddress)) {
      throw new AssetEvmTokenAddressInvalidError()
    }
  }

  private validateHederaLifeCycleCashFlowAddress(): void {
    if (this.lifeCycleCashFlowHederaAddress && !Asset.HEDERA_ADDRESS_REGEX.test(this.lifeCycleCashFlowHederaAddress)) {
      throw new AssetLifeCycleCashFlowHederaAddressInvalidError()
    }
  }

  private validateEvmLifeCycleCashFlowAddress(): void {
    if (this.lifeCycleCashFlowEvmAddress && !Asset.EVM_ADDRESS_REGEX.test(this.lifeCycleCashFlowEvmAddress)) {
      throw new AssetLifeCycleCashFlowEvmAddressInvalidError()
    }
  }
}
