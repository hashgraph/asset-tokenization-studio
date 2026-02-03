// SPDX-License-Identifier: Apache-2.0

import { BatchPayout } from "@domain/model/batch-payout"
import { Holder, HolderStatus } from "@domain/model/holder"
import { Inject, Injectable } from "@nestjs/common"
import { HolderRepository } from "@domain/ports/holder-repository.port"
import { isZeroAddress } from "../../utils/isZeroAddress"
import { HederaService } from "@domain/ports/hedera.port"

export const ONE_HOUR = 60 * 60 * 1000
const INITIAL_RETRY_COUNT = 0

@Injectable()
export class CreateHoldersDomainService {
  constructor(
    @Inject("HolderRepository")
    private readonly holderRepository: HolderRepository,
    @Inject("HederaService")
    private readonly hederaService: HederaService,
  ) {}

  async execute(
    batchPayout: BatchPayout,
    failedAddresses: string[],
    succeededAddresses: string[],
    paidAmounts: string[],
  ): Promise<Holder[]> {
    const filteredFailedAddresses = failedAddresses.filter((address) => !isZeroAddress(address))
    const filteredSucceededAddresses = succeededAddresses.filter((address) => !isZeroAddress(address))

    const nextRetryAt = new Date(Date.now() + ONE_HOUR)

    let holders: Holder[] = await Promise.all(
      filteredFailedAddresses.map(async (address) => {
        return Holder.create(
          batchPayout,
          await this.hederaService.getHederaAddressFromEvm(address),
          address,
          INITIAL_RETRY_COUNT,
          HolderStatus.FAILED,
          nextRetryAt,
          "Payment execution failed",
        )
      }),
    )

    const successHolders = await Promise.all(
      filteredSucceededAddresses.map(async (address, index) => {
        return Holder.create(
          batchPayout,
          await this.hederaService.getHederaAddressFromEvm(address),
          address,
          INITIAL_RETRY_COUNT,
          HolderStatus.SUCCESS,
          undefined,
          undefined,
          paidAmounts[index],
        )
      }),
    )

    holders = holders.concat(successHolders)

    return await this.holderRepository.saveHolders(holders)
  }
}
