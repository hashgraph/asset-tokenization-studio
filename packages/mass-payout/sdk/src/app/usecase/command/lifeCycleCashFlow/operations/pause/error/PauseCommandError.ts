// SPDX-License-Identifier: Apache-2.0

import { CommandError } from "../../../../error/CommandError";
import BaseError from "@core/error/BaseError";

export class PauseCommandError extends CommandError {
  constructor(error: Error) {
    const msg = `An error occurred while pausing the LifeCycleCashFlow: ${error.message}`;
    super(msg, error instanceof BaseError ? error.errorCode : undefined);
  }
}
