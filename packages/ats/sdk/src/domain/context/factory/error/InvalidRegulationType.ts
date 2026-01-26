// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidRegulationType extends BaseError {
  constructor(value: number) {
    super(ErrorCode.InvalidRegulationType, `Regulation Type ${value} is not valid`);
  }
}
