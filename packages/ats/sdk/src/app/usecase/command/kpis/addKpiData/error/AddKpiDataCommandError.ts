// SPDX-License-Identifier: Apache-2.0

import { CommandError } from "@command/error/CommandError";
import BaseError from "@core/error/BaseError";

export class AddKpiDataCommandError extends CommandError {
  constructor(error: Error) {
    const msg = `Error adding KPI data: ${error.message}`;
    super(msg, error instanceof BaseError ? error.errorCode : undefined);
  }
}
