// SPDX-License-Identifier: Apache-2.0

import {
  AmountType,
  CorporateActionDetails,
  Distribution,
  DistributionStatus,
  DistributionType,
  PayoutDetails,
  PayoutSubtype,
  Recurrency,
} from "@domain/model/distribution"
import { CorporateActionId } from "@domain/model/value-objects/corporate-action-id"
import { SnapshotId } from "@domain/model/value-objects/snapshot-id"
import { faker } from "@faker-js/faker/."
import { AssetUtils } from "@test/shared/asset.utils"

export class DistributionUtils {
  static newInstance(partial?: Partial<Distribution>): Distribution {
    const type = partial?.details?.type ?? DistributionType.CORPORATE_ACTION
    const asset = partial?.asset ?? AssetUtils.newInstance()
    const status = partial?.status ?? DistributionStatus.SCHEDULED
    const createdAt = partial?.createdAt ?? new Date()
    const updatedAt = partial?.updatedAt ?? new Date()

    if (type === DistributionType.CORPORATE_ACTION) {
      const corporateActionIDValue =
        (partial?.details as CorporateActionDetails)?.corporateActionId?.value ?? faker.string.alpha({ length: 10 })
      const corporateActionID = CorporateActionId.create(corporateActionIDValue)
      const executionDate = (partial?.details as any)?.executionDate ?? faker.date.future({ years: 2 })

      if (executionDate.getTime() <= new Date().getTime()) {
        return Distribution.createExistingCorporateAction(
          partial?.id ?? faker.string.uuid(),
          asset,
          corporateActionID,
          executionDate,
          status,
          createdAt,
          updatedAt,
        )
      }

      return Distribution.createCorporateAction(asset, corporateActionID, executionDate, status, createdAt, updatedAt)
    } else if (type === DistributionType.PAYOUT) {
      const subtype = (partial?.details as any)?.subtype ?? PayoutSubtype.IMMEDIATE
      const amount = (partial?.details as PayoutDetails)?.amount ?? "10"
      const amountType = (partial?.details as PayoutDetails)?.amountType ?? AmountType.FIXED
      const concept = (partial?.details as PayoutDetails)?.concept ?? "test"

      if (subtype === PayoutSubtype.ONE_OFF) {
        const executeAt = (partial?.details as any)?.executeAt ?? faker.date.future({ years: 1 })
        const snapshotId = (partial?.details as any)?.snapshotId ?? SnapshotId.create(faker.string.uuid())
        return Distribution.createOneOff(
          asset,
          executeAt,
          amount,
          amountType,
          snapshotId,
          status,
          concept,
          createdAt,
          updatedAt,
        )
      } else if (subtype === PayoutSubtype.RECURRING) {
        const executeAt = (partial?.details as any)?.executeAt ?? faker.date.future({ years: 1 })
        const snapshotId = (partial?.details as any)?.snapshotId ?? SnapshotId.create(faker.string.uuid())
        if (executeAt.getTime() <= new Date().getTime()) {
          return Distribution.createExistingRecurring(
            partial?.id ?? faker.string.uuid(),
            asset,
            executeAt,
            (partial?.details as any)?.recurrency ?? faker.helpers.objectValue(Recurrency),
            amount,
            amountType,
            snapshotId,
            status,
            createdAt,
            updatedAt,
            concept,
          )
        }

        return Distribution.createRecurring(
          asset,
          executeAt,
          (partial?.details as any)?.recurrency ?? faker.helpers.objectValue(Recurrency),
          amount,
          amountType,
          snapshotId,
          status,
          concept,
          createdAt,
          updatedAt,
        )
      } else {
        const snapshotId = (partial?.details as any)?.snapshotId ?? SnapshotId.create(faker.string.uuid())
        return Distribution.createImmediate(
          asset,
          amount,
          amountType,
          snapshotId,
          status,
          concept,
          createdAt,
          updatedAt,
        )
      }
    }

    throw new Error("Invalid distribution type provided for newInstance")
  }
}
