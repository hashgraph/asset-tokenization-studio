// SPDX-License-Identifier: Apache-2.0

import { InvalidDataError } from "@domain/errors/shared/invalid-data.error"
import { DomainError } from "@domain/errors/shared/domain.error"
import { DistributionStatus } from "@domain/model/distribution"
import { ConflictError } from "@domain/errors/shared/conflict-error"

export class DistributionAssetIdMissingError extends InvalidDataError {
  constructor() {
    super("assetId is required")
  }
}

export class DistributionCorporateActionIDMissingError extends InvalidDataError {
  constructor() {
    super("corporateActionID is required")
  }
}

export class DistributionExecutionDateMissingError extends InvalidDataError {
  constructor() {
    super("executionDate is required")
  }
}

export class DistributionExecutionDateInPastError extends InvalidDataError {
  constructor() {
    super("executionDate must be in the future")
  }
}

export class DistributionRecurrencyMissingError extends InvalidDataError {
  constructor() {
    super("recurrency is required")
  }
}

export class DistributionSnapshotIDMissingError extends InvalidDataError {
  constructor() {
    super("Distribution snapshot ID is missing")
  }
}

export class DistributionNotFoundError extends DomainError {
  constructor(distributionId: string) {
    super(`Distribution with id ${distributionId} not found`)
  }
}

export class DistributionNotPayoutError extends ConflictError {
  constructor(distributionId: string) {
    super(`Distribution ${distributionId} is not a payout distribution`)
  }
}

export class DistributionNotCorporateActionError extends ConflictError {
  constructor(distributionId: string) {
    super(`Distribution ${distributionId} is not a corporate action distribution`)
  }
}

export class DistributionNotInStatusError extends ConflictError {
  constructor(distributionId: string, status: DistributionStatus) {
    super(`Distribution ${distributionId} should be in status ${status}`)
  }
}
