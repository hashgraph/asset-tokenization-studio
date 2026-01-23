// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export default class InvalidKeyForContract extends BaseError {
  constructor(val: unknown) {
    super(ErrorCode.ContractKeyInvalid, `Invalid Key ${val}.`);
  }
}
