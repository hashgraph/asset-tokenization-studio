// SPDX-License-Identifier: Apache-2.0

import { faker } from "@faker-js/faker"
import { LifeCycleCashFlowAddress } from "@domain/model/life-cycle-cash-flow-address.value-object"
import { AccountId, TransactionId } from "@hiero-ledger/sdk"

export const fakeHederaTxId = (): string => {
  const account = AccountId.fromString(`0.0.${faker.number.int({ min: 1, max: 10_000_000 })}`)
  return TransactionId.generate(account).toString()
}

export class TestConstants {
  static BEFORE_ALL_TIMEOUT = 30000
  static AFTER_ALL_TIMEOUT = 30000
}

export const fakeHederaAddress = () => {
  const a = Math.floor(Math.random() * 100)
  const b = Math.floor(Math.random() * 100)
  const c = Math.floor(Math.random() * 1000) + 1
  return `${a}.${b}.${c}`
}

export const fakeLifeCycleCashFlowAddress = (): LifeCycleCashFlowAddress => {
  return LifeCycleCashFlowAddress.create(fakeHederaAddress(), faker.finance.ethereumAddress())
}
