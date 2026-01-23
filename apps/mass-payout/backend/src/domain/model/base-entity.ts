// SPDX-License-Identifier: Apache-2.0

import { BaseEntityInvalidDatesError } from "@domain/errors/shared/base-entity-invalid-dates.error"
import { isNil, isUndefined } from "@nestjs/common/utils/shared.utils"
import * as crypto from "crypto"

export class BaseEntity {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(id: string = crypto.randomUUID(), createdAt: Date = new Date(), updatedAt: Date = createdAt) {
    this.id = id
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.validateDates()
  }

  isEmpty(value: object): boolean {
    return isNil(value) || isUndefined(value)
  }

  private validateDates() {
    if (
      this.isEmpty(this.createdAt) ||
      this.isEmpty(this.updatedAt) ||
      this.createdAt.getTime() > this.updatedAt.getTime()
    ) {
      throw new BaseEntityInvalidDatesError()
    }
  }
}
