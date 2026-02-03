// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidRange extends BaseError {
  constructor(val: unknown, min?: string | number | bigint, max?: string | number | bigint) {
    let msg = `Value ${val} is out of range`;
    if (!min && max) {
      msg = `Value ${val} must be less than ${max.toString()}`;
    } else if (!max && min) {
      msg = `Value ${val} must be at least ${min.toString()}`;
    } else if (max && min) {
      msg = `Value ${val} must be between ${min.toString()} and ${max.toString()}`;
    }
    super(ErrorCode.InvalidRange, msg);
  }
}
