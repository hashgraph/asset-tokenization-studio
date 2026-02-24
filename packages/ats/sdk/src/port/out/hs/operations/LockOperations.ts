// SPDX-License-Identifier: Apache-2.0

import { ContractId } from "@hiero-ledger/sdk";
import { LockFacet__factory } from "@hashgraph/asset-tokenization-contracts";
import { _PARTITION_ID_1, GAS } from "@core/Constants";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import LogService from "@service/log/LogService";
import { TransactionExecutor } from "../TransactionExecutor";

export class LockOperations {
  constructor(private readonly executor: TransactionExecutor) {}

  async lock(
    security: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Locking ${amount} tokens from account ${sourceId.toString()} until ${expirationDate}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      LockFacet__factory.createInterface(),
      "lockByPartition",
      [_PARTITION_ID_1, amount.toHexString(), sourceId.toString(), expirationDate.toHexString()],
      GAS.LOCK,
    );
  }

  async release(
    security: EvmAddress,
    sourceId: EvmAddress,
    lockId: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Releasing lock ${lockId} from account ${sourceId.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      LockFacet__factory.createInterface(),
      "releaseByPartition",
      [_PARTITION_ID_1, lockId.toHexString(), sourceId.toString()],
      GAS.RELEASE,
    );
  }
}
