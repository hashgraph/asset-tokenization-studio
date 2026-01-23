// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class DecimalsOverRange extends BaseError {
  constructor(val: number) {
    super(ErrorCode.InvalidRange, `The amount has more decimals than the limit (${val})`);
  }
}
