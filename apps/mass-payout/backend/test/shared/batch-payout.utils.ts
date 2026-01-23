// SPDX-License-Identifier: Apache-2.0

import { faker } from "@faker-js/faker/."
import crypto from "crypto"
import { BatchPayout, BatchPayoutStatus } from "@domain/model/batch-payout"
import { fakeHederaTxId } from "@test/shared/utils"
import { DistributionUtils } from "@test/shared/distribution.utils"

export class BatchPayoutUtils {
  static newInstance(partial?: Partial<BatchPayout>): BatchPayout {
    return BatchPayout.createExisting(
      partial?.id ?? crypto.randomUUID(),
      partial?.distribution ?? DistributionUtils.newInstance(),
      partial?.name ?? faker.string.alpha({ length: 10 }),
      partial?.hederaTransactionId ?? fakeHederaTxId(),
      partial?.hederaTransactionHash ?? BatchPayoutUtils.generateHederaTransactionHash(),
      partial?.holdersNumber ?? faker.number.int({ min: 1, max: 100 }),
      partial?.status ?? BatchPayoutStatus.IN_PROGRESS,
      partial?.createdAt ?? faker.date.past(),
      partial?.updatedAt ?? new Date(),
    )
  }

  private static generateHederaTransactionHash(): string {
    return `0x${crypto.randomBytes(48).toString("hex")}`
  }
}
