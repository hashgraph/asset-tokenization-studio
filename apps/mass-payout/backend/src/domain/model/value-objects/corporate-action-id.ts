// SPDX-License-Identifier: Apache-2.0

import { DistributionCorporateActionIDMissingError } from "@domain/errors/distribution.error"

export class CorporateActionId {
  readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(value: string): CorporateActionId {
    if (!value || value.trim().length === 0) {
      throw new DistributionCorporateActionIDMissingError()
    }
    return new CorporateActionId(value)
  }
}
