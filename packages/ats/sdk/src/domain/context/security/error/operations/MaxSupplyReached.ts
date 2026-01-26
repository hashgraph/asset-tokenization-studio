// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class MaxSupplyReached extends BaseError {
  constructor() {
    super(ErrorCode.MaxSupplyReached, `Max supply reached`);
  }
}
