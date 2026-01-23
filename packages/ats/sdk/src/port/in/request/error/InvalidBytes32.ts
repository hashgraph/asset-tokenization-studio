// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidBytes32 extends BaseError {
  constructor(value: string) {
    super(ErrorCode.InvalidBytes32, `Bytes32 ${value} is not valid`);
  }
}
