// SPDX-License-Identifier: Apache-2.0

import TransactionAdapter from "@port/out/TransactionAdapter";
import { RuntimeError } from "./error/RuntimeError";

export default class TransactionHandlerRegistration {
  private static currentTransactionHandler: TransactionAdapter;

  static registerTransactionHandler<T extends TransactionAdapter>(cls: T): boolean {
    if (this.currentTransactionHandler) this.currentTransactionHandler.stop();
    this.currentTransactionHandler = cls;
    return true;
  }

  static resolveTransactionHandler(): TransactionAdapter {
    if (!this.currentTransactionHandler) {
      throw new RuntimeError("No Transaction Handler registered!");
    } else {
      return this.currentTransactionHandler;
    }
  }
}
