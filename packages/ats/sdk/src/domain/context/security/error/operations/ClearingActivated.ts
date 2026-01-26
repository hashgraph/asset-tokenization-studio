// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class ClearingActivated extends BaseError {
  constructor() {
    super(ErrorCode.ClearingActivated, `Operation not allowed when clearing mode is activated`);
  }
}
