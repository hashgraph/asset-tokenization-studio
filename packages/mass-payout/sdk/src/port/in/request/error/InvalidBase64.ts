// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidBase64 extends BaseError {
  constructor(value: string) {
    super(ErrorCode.InvalidBase64, `Bytes ${value} is not valid`);
  }
}
