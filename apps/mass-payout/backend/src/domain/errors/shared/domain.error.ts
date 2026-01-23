// SPDX-License-Identifier: Apache-2.0

import { CustomError } from "@domain/errors/shared/custom.error"

export abstract class DomainError extends CustomError {
  protected constructor(message: string) {
    super(message, undefined, message)
  }
}
