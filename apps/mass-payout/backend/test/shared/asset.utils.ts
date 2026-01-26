// SPDX-License-Identifier: Apache-2.0

import { Asset } from "@domain/model/asset"
import { AssetType } from "@domain/model/asset-type.enum"
import { LifeCycleCashFlowAddress } from "@domain/model/life-cycle-cash-flow-address.value-object"
import { faker } from "@faker-js/faker"
import { fakeHederaAddress, fakeLifeCycleCashFlowAddress } from "@test/shared/utils"

export const AssetUtils = {
  newInstance: (props: Partial<Asset> = {}): Asset => {
    return Asset.create(
      props.name ?? faker.string.alphanumeric({ length: 10 }),
      props.type ?? AssetType.EQUITY,
      props.hederaTokenAddress ?? fakeHederaAddress(),
      props.evmTokenAddress ?? faker.finance.ethereumAddress(),
      props.symbol ?? faker.string.alpha({ length: 4 }).toUpperCase(),
      props.maturityDate,
      props.isPaused ?? false,
    )
  },

  newInstanceWithLifeCycleCashFlow: (lifeCycleCashFlowAddress?: LifeCycleCashFlowAddress): Asset => {
    const asset = AssetUtils.newInstance()
    return asset.withLifeCycleCashFlow(lifeCycleCashFlowAddress ?? fakeLifeCycleCashFlowAddress())
  },
}
