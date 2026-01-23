// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidLength extends BaseError {
  constructor(val: string, min?: number, max?: number) {
    super(
      ErrorCode.InvalidLength,
      `Value ${val} is not of a valid length${
        (min || max) && `, expected${min && " min: " + min}${max && " max: " + max}`
      }`,
    );
  }
}
