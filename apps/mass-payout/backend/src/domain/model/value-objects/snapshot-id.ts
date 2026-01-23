// SPDX-License-Identifier: Apache-2.0

import { DistributionSnapshotIDMissingError } from "@domain/errors/distribution.error"

export class SnapshotId {
  readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(value: string): SnapshotId {
    if (!value || value.trim().length === 0) {
      throw new DistributionSnapshotIDMissingError()
    }
    return new SnapshotId(value)
  }
}
