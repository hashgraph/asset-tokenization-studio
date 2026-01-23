// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "../../error/BaseError";

export class QueryHandlerNotFoundException extends BaseError {
  constructor(queryName: string) {
    super(ErrorCode.RuntimeError, `The query handler for the "${queryName}" query was not found!`);
  }
}
