// SPDX-License-Identifier: Apache-2.0

import { ContractId } from "@hiero-ledger/sdk";
import { IAsset__factory } from "@hashgraph/asset-tokenization-contracts";
import { GAS } from "@core/Constants";
import EvmAddress from "@domain/context/contract/EvmAddress";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import LogService from "@service/log/LogService";
import { TransactionExecutor } from "../TransactionExecutor";

export class DeactivateOperations {
  constructor(private readonly executor: TransactionExecutor) {}

  async deactivate(security: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Deactivating security: ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      IAsset__factory.createInterface(),
      "deactivate",
      [],
      GAS.DEACTIVATE,
    );
  }
}
