// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class ErrorDecodingVc extends BaseError {
  constructor(error: unknown) {
    super(ErrorCode.ErrorDecodingVc, `Failed to decode Base64 VC: ${(error as Error).message}`);
  }
}
