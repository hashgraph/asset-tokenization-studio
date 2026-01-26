// SPDX-License-Identifier: Apache-2.0

import { Holder, HolderStatus } from "@domain/model/holder"
import { Page, PageOptions } from "@domain/model/page"

export interface HolderRepository {
  saveHolder(holder: Holder): Promise<Holder>

  saveHolders(holders: Holder[]): Promise<Holder[]>

  updateHolder(holder: Holder): Promise<Holder>

  getHoldersByBatchPayout(batchPayoutId: string): Promise<Holder[]>

  getAllHoldersByDistributionId(distributionId: string): Promise<Holder[]>

  getHoldersByDistributionId(distributionId: string, pageOptions: PageOptions): Promise<Page<Holder>>

  countHoldersByDistributionId(distributionId: string): Promise<number>

  getHoldersByDistributionIdAndStatus(distributionId: string, holderStatus: HolderStatus): Promise<Holder[]>
}
