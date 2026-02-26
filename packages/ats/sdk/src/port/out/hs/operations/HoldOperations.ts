// SPDX-License-Identifier: Apache-2.0

import { ContractId } from "@hiero-ledger/sdk";
import {
  HoldTokenHolderFacet__factory,
  HoldManagementFacet__factory,
} from "@hashgraph/asset-tokenization-contracts";
import { GAS } from "@core/Constants";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import { Hold, HoldIdentifier, ProtectedHold } from "@domain/context/security/Hold";
import LogService from "@service/log/LogService";
import { TransactionExecutor } from "../TransactionExecutor";

export class HoldOperations {
  constructor(private readonly executor: TransactionExecutor) {}

  async createHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Holding ${amount} tokens from account ${targetId.toString()} until ${expirationDate} with escrow ${escrowId}`,
    );
    const hold: Hold = {
      amount: amount.toBigInt(),
      expirationTimestamp: expirationDate.toBigInt(),
      escrow: escrowId.toString(),
      to: targetId.toString(),
      data: "0x",
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      HoldTokenHolderFacet__factory.createInterface(),
      "createHoldByPartition",
      [partitionId, hold],
      GAS.CREATE_HOLD,
    );
  }

  async createHoldFromByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Holding ${amount} tokens from account ${sourceId.toString()} until ${expirationDate} with escrow ${escrowId}`,
    );
    const hold: Hold = {
      amount: amount.toBigInt(),
      expirationTimestamp: expirationDate.toBigInt(),
      escrow: escrowId.toString(),
      to: targetId.toString(),
      data: "0x",
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      HoldTokenHolderFacet__factory.createInterface(),
      "createHoldFromByPartition",
      [partitionId, sourceId.toString(), hold, "0x"],
      GAS.CREATE_HOLD_FROM,
    );
  }

  async controllerCreateHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Controller Holding ${amount} tokens from account ${sourceId.toString()} until ${expirationDate} with escrow ${escrowId}`,
    );
    const hold: Hold = {
      amount: amount.toBigInt(),
      expirationTimestamp: expirationDate.toBigInt(),
      escrow: escrowId.toString(),
      to: targetId.toString(),
      data: "0x",
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      HoldManagementFacet__factory.createInterface(),
      "controllerCreateHoldByPartition",
      [partitionId, sourceId.toString(), hold, "0x"],
      GAS.CONTROLLER_CREATE_HOLD,
    );
  }

  async protectedCreateHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    escrowId: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    deadline: BigDecimal,
    nonce: BigDecimal,
    signature: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Protected Holding ${amount} tokens from account ${sourceId.toString()} until ${expirationDate} with escrow ${escrowId}`,
    );
    const hold: Hold = {
      amount: amount.toBigInt(),
      expirationTimestamp: expirationDate.toBigInt(),
      escrow: escrowId.toString(),
      to: targetId.toString(),
      data: "0x",
    };
    const protectedHold: ProtectedHold = {
      hold: hold,
      deadline: deadline.toBigInt(),
      nonce: nonce.toBigInt(),
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      HoldManagementFacet__factory.createInterface(),
      "protectedCreateHoldByPartition",
      [partitionId, sourceId.toString(), protectedHold, signature],
      GAS.PROTECTED_CREATE_HOLD,
    );
  }

  async releaseHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    holdId: number,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Releasing hold amount ${amount} from account ${targetId.toString()}}`);
    const holdIdentifier: HoldIdentifier = {
      partition: partitionId,
      tokenHolder: targetId.toString(),
      holdId,
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      HoldTokenHolderFacet__factory.createInterface(),
      "releaseHoldByPartition",
      [holdIdentifier, amount.toBigInt()],
      GAS.RELEASE_HOLD,
    );
  }

  async reclaimHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    holdId: number,
    targetId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Reclaiming hold from account ${targetId.toString()}}`);
    const holdIdentifier: HoldIdentifier = {
      partition: partitionId,
      tokenHolder: targetId.toString(),
      holdId,
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      HoldTokenHolderFacet__factory.createInterface(),
      "reclaimHoldByPartition",
      [holdIdentifier],
      GAS.RECLAIM_HOLD,
    );
  }

  async executeHoldByPartition(
    security: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    partitionId: string,
    holdId: number,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Executing hold with Id ${holdId} from account ${sourceId.toString()} to account ${targetId.toString()}`,
    );
    const holdIdentifier: HoldIdentifier = {
      partition: partitionId,
      tokenHolder: sourceId.toString(),
      holdId,
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      HoldTokenHolderFacet__factory.createInterface(),
      "executeHoldByPartition",
      [holdIdentifier, targetId.toString(), amount.toBigInt()],
      GAS.EXECUTE_HOLD_BY_PARTITION,
    );
  }
}
