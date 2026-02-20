// SPDX-License-Identifier: Apache-2.0

import { CommandError } from "@command/error/CommandError";
import BaseError, { ErrorCode } from "@core/error/BaseError";

export class CreateBondKpiLinkedRateCommandError extends CommandError {
  constructor(error: Error) {
    const errorCode = CreateBondKpiLinkedRateCommandError.mapErrorToCode(error);
    const msg = `An error occurred while creating the bond kpi linked rate: ${error.message}`;
    super(msg, errorCode);
  }

  private static mapErrorToCode(error: Error): ErrorCode | undefined {
    if (error instanceof BaseError) {
      return error.errorCode;
    }

    return undefined;
  }
}
