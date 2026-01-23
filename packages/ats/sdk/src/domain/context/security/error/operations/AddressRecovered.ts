// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "../../../../../core/error/BaseError.js";

export class AddressRecovered extends BaseError {
  constructor(address: string) {
    super(ErrorCode.AddressRecovered, `The address ${address} has been recovered`);
  }
}
