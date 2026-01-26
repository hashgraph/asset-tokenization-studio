// SPDX-License-Identifier: Apache-2.0

import { CommandError } from "@command/error/CommandError";
import BaseError, { ErrorCode } from "@core/error/BaseError";

export class SetCouponCommandError extends CommandError {
  constructor(error: Error) {
    const errorCode = SetCouponCommandError.mapErrorToCode(error);
    const msg = `An error occurred while setting the coupon: ${error.message}`;
    super(msg, errorCode);
  }

  private static mapErrorToCode(error: Error): ErrorCode | undefined {
    if (error instanceof BaseError) {
      return error.errorCode;
    }

    return undefined;
  }
}
