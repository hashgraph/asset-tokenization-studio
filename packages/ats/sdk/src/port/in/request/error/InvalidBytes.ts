// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidBytes extends BaseError {
  constructor(value: string) {
    super(ErrorCode.InvalidBytes, `Bytes ${value} is not valid`);
  }
}
