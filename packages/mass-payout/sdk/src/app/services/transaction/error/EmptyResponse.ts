// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class EmptyResponse extends BaseError {
  constructor(handler: string) {
    super(ErrorCode.EmptyResponse, `${handler} response id empty`);
  }
}
