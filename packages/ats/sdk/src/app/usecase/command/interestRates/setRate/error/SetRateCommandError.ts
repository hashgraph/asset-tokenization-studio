// SPDX-License-Identifier: Apache-2.0

import { CommandError } from "@command/error/CommandError";
import BaseError from "@core/error/BaseError";

export class SetRateCommandError extends CommandError {
  constructor(error: any) {
    const msg = `Error setting rate: ${error.message}`;
    super(msg, error instanceof BaseError ? error.errorCode : undefined);
  }
}
