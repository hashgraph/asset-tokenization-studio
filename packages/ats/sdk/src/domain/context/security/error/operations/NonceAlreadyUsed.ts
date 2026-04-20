// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class NonceAlreadyUsed extends BaseError {
  constructor(nonce: number) {
    super(ErrorCode.NonceAlreadyUsed, `Nonce ${nonce} has already been used`);
  }
}
