// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidEvmAddress extends BaseError {
  constructor(value: string) {
    super(ErrorCode.InvalidEvmAddress, `EVM Address ${value} is not valid`);
  }
}
