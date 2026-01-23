// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export default class InvalidSupply extends BaseError {
  constructor(totalSupply: string, maxSupply: string) {
    super(ErrorCode.InvalidSupply, `Total supply ${totalSupply} exceeds max supply ${maxSupply}`);
  }
}
