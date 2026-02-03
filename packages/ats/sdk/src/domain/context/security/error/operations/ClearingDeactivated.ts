// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class ClearingDeactivated extends BaseError {
  constructor() {
    super(ErrorCode.ClearingDeactivated, `Operation not allowed when clearing mode is deactivated`);
  }
}
