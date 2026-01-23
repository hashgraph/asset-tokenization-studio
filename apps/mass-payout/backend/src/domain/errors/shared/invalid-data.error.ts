// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@domain/errors/shared/domain.error"

export abstract class InvalidDataError extends DomainError {
  protected constructor(message: string) {
    super(message)
  }
}
