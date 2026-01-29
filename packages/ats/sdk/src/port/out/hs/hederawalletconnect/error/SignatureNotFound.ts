// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class SignatureNotFound extends BaseError {
  constructor(value?: string) {
    super(ErrorCode.SignatureNotFound, `❌ No signatures found in response ${value ?? ""}`);
  }
}
