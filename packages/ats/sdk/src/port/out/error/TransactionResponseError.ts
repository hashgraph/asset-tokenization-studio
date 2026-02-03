// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export const REGEX_TRANSACTION =
  /^(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))(?:-([a-z]{5}))?@([1-9]\d*)\.([1-9]\d*)$/;
const HASHSCAN_BASE = "https://hashscan.io/";
const TRANSACTION_PATH = "/transactionsById/";
const RPC_RELAY_PATH = "/tx/";

type TransactionResponseErrorPayload = {
  message: string;
  network: string;
  name?: string;
  status?: string;
  transactionId?: string;
  RPC_relay?: boolean;
};

export class TransactionResponseError extends BaseError {
  error: TransactionResponseErrorPayload;
  transactionUrl: string | null;
  constructor(val: TransactionResponseErrorPayload) {
    super(ErrorCode.TransactionError, `Transaction failed: ${val.message}`);
    this.error = val;
    if (val.transactionId) {
      if (val.RPC_relay) {
        this.transactionUrl = `${HASHSCAN_BASE}${val.network}${RPC_RELAY_PATH}${val.transactionId}`;
      } else {
        this.transactionUrl = `${HASHSCAN_BASE}${val.network}${TRANSACTION_PATH}${val.transactionId}`;
      }
    }
  }
}
