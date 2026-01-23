// SPDX-License-Identifier: Apache-2.0

import { CommandError } from "../../../../error/CommandError";
import BaseError from "@core/error/BaseError";

export class ExecutePercentageSnapshotCommandError extends CommandError {
  constructor(error: Error) {
    const msg = `An error occurred while executing a percentage snapshot: ${error.message}`;
    super(msg, error instanceof BaseError ? error.errorCode : undefined);
  }
}
