// SPDX-License-Identifier: Apache-2.0

import { BaseError } from "@core/error/BaseError";

export class GetRateQueryError extends BaseError {
  constructor(error: Error) {
    super({
      message: `Failed to get interest rate: ${error.message}`,
      cause: error,
    });
  }
}
