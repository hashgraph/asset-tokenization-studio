// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "./Response";

export default class TransactionResponse<T extends Response = Response, X extends Error = Error> {
  constructor(
    public readonly id?: string,
    public response?: T,
    public readonly error?: X,
  ) {}
}
