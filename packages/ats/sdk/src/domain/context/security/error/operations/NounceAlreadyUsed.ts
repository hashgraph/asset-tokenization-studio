// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class NounceAlreadyUsed extends BaseError {
  constructor(nounce: number) {
    super(ErrorCode.NounceAlreadyUsed, `Nounce ${nounce} has already been used`);
  }
}
