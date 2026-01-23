// SPDX-License-Identifier: Apache-2.0

import { CommandError } from "../../../../error/CommandError";
import BaseError from "@core/error/BaseError";

export class ExecuteAmountSnapshotCommandError extends CommandError {
  constructor(error: Error) {
    const msg = `An error occurred while executing an amount snapshot: ${error.message}`;
    super(msg, error instanceof BaseError ? error.errorCode : undefined);
  }
}
