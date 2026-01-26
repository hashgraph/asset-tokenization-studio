// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class InvalidContractId extends BaseError {
  constructor(contractId: string) {
    super(ErrorCode.InvalidContractId, `Contract ${contractId} is not valid`);
  }
}
