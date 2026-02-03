// SPDX-License-Identifier: Apache-2.0

import { InvalidDataError } from "@domain/errors/shared/invalid-data.error"

export class BaseEntityInvalidDatesError extends InvalidDataError {
  constructor() {
    super("createdAt and updatedAt are required; createdAt cannot be later than updatedAt")
  }
}
