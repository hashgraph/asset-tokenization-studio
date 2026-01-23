// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidBytes3 extends BaseError {
  constructor(value: string) {
    super(ErrorCode.InvalidBytes3, `Bytes3 ${value} is not valid`);
  }
}
