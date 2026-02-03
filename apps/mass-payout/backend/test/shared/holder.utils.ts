// SPDX-License-Identifier: Apache-2.0

import { faker } from "@faker-js/faker"
import { Holder, HolderStatus } from "@domain/model/holder"
import { BatchPayoutUtils } from "@test/shared/batch-payout.utils"

const fakeHederaId = () => `${faker.number.int()}.${faker.number.int()}.${faker.number.int({ min: 1 })}`

export class HolderUtils {
  static newInstance(data?: Partial<Holder>): Holder {
    return Holder.create(
      data?.batchPayout ?? BatchPayoutUtils.newInstance(),
      data?.holderHederaAddress ?? fakeHederaId(),
      data?.holderEvmAddress ?? faker.finance.ethereumAddress(),
      data?.retryCounter ?? 0,
      data?.status ?? HolderStatus.PENDING,
      data?.nextRetryAt ?? new Date(),
      data?.lastError,
      data?.amount ?? null,
      data?.createdAt,
      data?.updatedAt,
    )
  }
}
