// SPDX-License-Identifier: Apache-2.0

import { Transaction } from "@hiero-ledger/sdk";
import { ethers } from "ethers";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import { TransactionType } from "@port/out/TransactionResponseEnums";
import Account from "@domain/context/account/Account";

/**
 * Output port interface for transaction execution.
 * Operation classes depend on this interface, not on the concrete adapter.
 *
 * This breaks the circular dependency: adapter → operations → adapter.
 * Operations only see this interface, not HederaTransactionAdapter.
 */
export interface TransactionExecutor {
  processTransaction(
    tx: Transaction,
    transactionType: TransactionType,
    startDate?: string,
  ): Promise<TransactionResponse>;

  executeContractCall(
    contractId: string,
    iface: ethers.Interface,
    functionName: string,
    params: unknown[],
    gasLimit: number,
    transactionType?: TransactionType,
    payableAmountHbar?: string,
    startDate?: string,
    evmAddress?: string,
  ): Promise<TransactionResponse>;

  getAccount(): Account;

  supportsEvmOperations(): boolean;
}
