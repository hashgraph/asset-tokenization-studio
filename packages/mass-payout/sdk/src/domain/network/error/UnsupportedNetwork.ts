// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class UnsupportedNetwork extends BaseError {
  constructor() {
    super(ErrorCode.UnsupportedNetwork, "Network not supported");
  }
}
