// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class SecurityNotFound extends BaseError {
  constructor(val: unknown) {
    super(ErrorCode.NotFound, `${val} was not found`);
  }
}
