// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "./BaseError";

export class RuntimeError extends BaseError {
  constructor(msg: string) {
    super(ErrorCode.RuntimeError, `Runtime error: ${msg}`);
  }
}
