// SPDX-License-Identifier: Apache-2.0

import { LifeCycleCashFlowAddress } from "@domain/model/life-cycle-cash-flow-address.value-object"
import { faker } from "@faker-js/faker"
import { fakeHederaAddress } from "@test/shared/utils"
import {
  AssetLifeCycleCashFlowEvmAddressInvalidError,
  AssetLifeCycleCashFlowHederaAddressInvalidError,
} from "@domain/errors/asset.error"

describe(LifeCycleCashFlowAddress.name, () => {
  describe("create", () => {
    it("should create a LifeCycleCashFlowAddress", () => {
      const hederaAddress = fakeHederaAddress()
      const evmAddress = faker.finance.ethereumAddress()

      const lifeCycleCashFlowAddress = LifeCycleCashFlowAddress.create(hederaAddress, evmAddress)

      expect(lifeCycleCashFlowAddress).toBeInstanceOf(LifeCycleCashFlowAddress)
      expect(lifeCycleCashFlowAddress.hederaAddress).toBe(hederaAddress)
      expect(lifeCycleCashFlowAddress.evmAddress).toBe(evmAddress)
    })

    it("fails when hederaAddress is not in format 0.0.X", () => {
      const invalidHederaAddresses = ["1.2", "a.b.c", "0.0", faker.string.uuid()]
      const evmAddress = faker.finance.ethereumAddress()

      invalidHederaAddresses.forEach((invalidHederaAddress) => {
        expect(() => {
          LifeCycleCashFlowAddress.create(invalidHederaAddress, evmAddress)
        }).toThrow(AssetLifeCycleCashFlowHederaAddressInvalidError)
      })
    })

    it("fails when evmAddress is not a valid Ethereum address", () => {
      const hederaAddress = fakeHederaAddress()
      const invalidEvmAddresses = ["1.2", "a.b.c", "0.0", "0xInvalidEthereumAddress"]

      invalidEvmAddresses.forEach((invalidEvmAddress) => {
        expect(() => {
          LifeCycleCashFlowAddress.create(hederaAddress, invalidEvmAddress)
        }).toThrow(AssetLifeCycleCashFlowEvmAddressInvalidError)
      })
    })
  })
})
