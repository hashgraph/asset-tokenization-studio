// SPDX-License-Identifier: Apache-2.0

import { CommandError } from "@command/error/CommandError";
import BaseError from "@core/error/BaseError";

export class SetImpactDataCommandError extends CommandError {
  constructor(error: Error) {
    const msg = `Error setting impact data: ${error.message}`;
    super(msg, error instanceof BaseError ? error.errorCode : undefined);
  }
}
