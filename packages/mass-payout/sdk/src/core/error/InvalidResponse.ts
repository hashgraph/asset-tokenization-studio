// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "./BaseError";

export class InvalidResponse extends BaseError {
  constructor(val: unknown) {
    super(ErrorCode.InvalidResponse, `An invalid response was received from the server: ${val}`);
  }
}
