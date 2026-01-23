// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class SetNetworkError extends BaseError {
  constructor(val: unknown) {
    super(ErrorCode.NetworkNotSet, `An error ocurred when setting the network: ${val}`);
  }
}
