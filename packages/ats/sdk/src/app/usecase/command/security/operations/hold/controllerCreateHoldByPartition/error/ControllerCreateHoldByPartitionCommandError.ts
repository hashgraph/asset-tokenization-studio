// SPDX-License-Identifier: Apache-2.0

import { CommandError } from "@command/error/CommandError";
import BaseError from "@core/error/BaseError";

export class ControllerCreateHoldByPartitionCommandError extends CommandError {
  constructor(error: Error) {
    const msg = `An error occurred while force create hold: ${error.message}`;
    super(msg, error instanceof BaseError ? error.errorCode : undefined);
  }
}
