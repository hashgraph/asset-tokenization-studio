// SPDX-License-Identifier: Apache-2.0

import { ContractId } from "@hiero-ledger/sdk";
import { ethers } from "ethers";
import {
  ClearingTransferFacet__factory,
  ClearingRedeemFacet__factory,
  ClearingHoldCreationFacet__factory,
  ClearingActionsFacet__factory,
} from "@hashgraph/asset-tokenization-contracts";
import { GAS } from "@core/Constants";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import {
  CastClearingOperationType,
  ClearingOperation,
  ClearingOperationFrom,
  ClearingOperationIdentifier,
  ClearingOperationType,
  ProtectedClearingOperation,
} from "@domain/context/security/Clearing";
import { Hold } from "@domain/context/security/Hold";
import LogService from "@service/log/LogService";
import { TransactionExecutor } from "../TransactionExecutor";

export class ClearingOperations {
  constructor(private readonly executor: TransactionExecutor) {}

  async activateClearing(security: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Activate Clearing to address ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      new ethers.Interface(["function activateClearing()"]),
      "activateClearing",
      [],
      GAS.ACTIVATE_CLEARING,
    );
  }

  async deactivateClearing(security: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Deactivate Clearing to address ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      new ethers.Interface(["function deactivateClearing()"]),
      "deactivateClearing",
      [],
      GAS.DEACTIVATE_CLEARING,
    );
  }

  async clearingTransferByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Clearing Transfer By Partition to address ${security.toString()}`);
    const clearingOperation: ClearingOperation = {
      partition: partitionId,
      expirationTimestamp: expirationDate.toBigInt(),
      data: "0x",
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ClearingTransferFacet__factory.createInterface(),
      "clearingTransferByPartition",
      [clearingOperation, amount.toBigInt(), targetId.toString()],
      GAS.CLEARING_TRANSFER_BY_PARTITION,
    );
  }

  async clearingTransferFromByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Clearing Transfer From By Partition to address ${security.toString()}`);
    const clearingOperationFrom: ClearingOperationFrom = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: expirationDate.toBigInt(),
        data: "0x",
      },
      from: sourceId.toString(),
      operatorData: "0x",
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ClearingTransferFacet__factory.createInterface(),
      "clearingTransferFromByPartition",
      [clearingOperationFrom, amount.toBigInt(), targetId.toString()],
      GAS.CLEARING_TRANSFER_FROM_BY_PARTITION,
    );
  }

  async protectedClearingTransferByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    deadline: BigDecimal,
    nonce: BigDecimal,
    signature: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Protected Clearing Transfer By Partition to address ${security.toString()}`);
    const protectedClearingOperation: ProtectedClearingOperation = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: expirationDate.toBigInt(),
        data: "0x",
      },
      from: sourceId.toString(),
      deadline: deadline.toBigInt(),
      nonce: nonce.toBigInt(),
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ClearingTransferFacet__factory.createInterface(),
      "protectedClearingTransferByPartition",
      [protectedClearingOperation, amount.toBigInt(), targetId.toString(), signature],
      GAS.PROTECTED_CLEARING_TRANSFER_BY_PARTITION,
    );
  }

  async approveClearingOperationByPartition(
    security: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
    clearingId: number,
    clearingOperationType: ClearingOperationType,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Approve Clearing Operation By Partition to address ${security.toString()}`);
    const clearingOperationIdentifier: ClearingOperationIdentifier = {
      partition: partitionId,
      tokenHolder: targetId.toString(),
      clearingOperationType: CastClearingOperationType.toNumber(clearingOperationType),
      clearingId: clearingId,
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ClearingActionsFacet__factory.createInterface(),
      "approveClearingOperationByPartition",
      [clearingOperationIdentifier],
      GAS.APPROVE_CLEARING_TRANSFER_BY_PARTITION,
    );
  }

  async cancelClearingOperationByPartition(
    security: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
    clearingId: number,
    clearingOperationType: ClearingOperationType,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Cancel Clearing Operation By Partition to address ${security.toString()}`);
    const clearingOperationIdentifier: ClearingOperationIdentifier = {
      partition: partitionId,
      tokenHolder: targetId.toString(),
      clearingOperationType: CastClearingOperationType.toNumber(clearingOperationType),
      clearingId: clearingId,
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ClearingActionsFacet__factory.createInterface(),
      "cancelClearingOperationByPartition",
      [clearingOperationIdentifier],
      GAS.CANCEL_CLEARING_TRANSFER_BY_PARTITION,
    );
  }

  async reclaimClearingOperationByPartition(
    security: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
    clearingId: number,
    clearingOperationType: ClearingOperationType,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Reclaim Clearing Operation By Partition to address ${security.toString()}`);
    const clearingOperationIdentifier: ClearingOperationIdentifier = {
      partition: partitionId,
      tokenHolder: targetId.toString(),
      clearingOperationType: CastClearingOperationType.toNumber(clearingOperationType),
      clearingId: clearingId,
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ClearingActionsFacet__factory.createInterface(),
      "reclaimClearingOperationByPartition",
      [clearingOperationIdentifier],
      GAS.RECLAIM_CLEARING_TRANSFER_BY_PARTITION,
    );
  }

  async clearingRedeemByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Clearing Redeem By Partition to address ${security.toString()}`);
    const clearingOperation: ClearingOperation = {
      partition: partitionId,
      expirationTimestamp: expirationDate.toBigInt(),
      data: "0x",
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ClearingRedeemFacet__factory.createInterface(),
      "clearingRedeemByPartition",
      [clearingOperation, amount.toBigInt()],
      GAS.CLEARING_REDEEM_BY_PARTITION,
    );
  }

  async clearingRedeemFromByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Clearing Redeem From By Partition to address ${security.toString()}`);
    const clearingOperationFrom: ClearingOperationFrom = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: expirationDate.toBigInt(),
        data: "0x",
      },
      from: sourceId.toString(),
      operatorData: "0x",
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ClearingRedeemFacet__factory.createInterface(),
      "clearingRedeemFromByPartition",
      [clearingOperationFrom, amount.toBigInt()],
      GAS.CLEARING_REDEEM_FROM_BY_PARTITION,
    );
  }

  async protectedClearingRedeemByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    expirationDate: BigDecimal,
    deadline: BigDecimal,
    nonce: BigDecimal,
    signature: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Protected Clearing Redeem By Partition to address ${security.toString()}`);
    const protectedClearingOperation: ProtectedClearingOperation = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: expirationDate.toBigInt(),
        data: "0x",
      },
      from: sourceId.toString(),
      deadline: deadline.toBigInt(),
      nonce: nonce.toBigInt(),
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ClearingRedeemFacet__factory.createInterface(),
      "protectedClearingRedeemByPartition",
      [protectedClearingOperation, amount.toBigInt(), signature],
      GAS.PROTECTED_CLEARING_REDEEM_BY_PARTITION,
    );
  }

  async clearingCreateHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    targetId: EvmAddress,
    clearingExpirationDate: BigDecimal,
    holdExpirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Clearing Create Hold By Partition to address ${security.toString()}`);
    const clearingOperation: ClearingOperation = {
      partition: partitionId,
      expirationTimestamp: clearingExpirationDate.toBigInt(),
      data: "0x",
    };
    const hold: Hold = {
      amount: amount.toBigInt(),
      expirationTimestamp: holdExpirationDate.toBigInt(),
      escrow: escrowId.toString(),
      to: targetId.toString(),
      data: "0x",
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ClearingHoldCreationFacet__factory.createInterface(),
      "clearingCreateHoldByPartition",
      [clearingOperation, hold],
      GAS.CLEARING_CREATE_HOLD_BY_PARTITION,
    );
  }

  async clearingCreateHoldFromByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    clearingExpirationDate: BigDecimal,
    holdExpirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Clearing Create Hold From By Partition to address ${security.toString()}`);
    const clearingOperationFrom: ClearingOperationFrom = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: clearingExpirationDate.toBigInt(),
        data: "0x",
      },
      from: sourceId.toString(),
      operatorData: "0x",
    };
    const hold: Hold = {
      amount: amount.toBigInt(),
      expirationTimestamp: holdExpirationDate.toBigInt(),
      escrow: escrowId.toString(),
      to: targetId.toString(),
      data: "0x",
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ClearingHoldCreationFacet__factory.createInterface(),
      "clearingCreateHoldFromByPartition",
      [clearingOperationFrom, hold],
      GAS.CLEARING_CREATE_HOLD_FROM_BY_PARTITION,
    );
  }

  async protectedClearingCreateHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    escrowId: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    clearingExpirationDate: BigDecimal,
    holdExpirationDate: BigDecimal,
    deadline: BigDecimal,
    nonce: BigDecimal,
    signature: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Protected Clearing Create Hold By Partition to address ${security.toString()}`);
    const protectedClearingOperation: ProtectedClearingOperation = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: clearingExpirationDate.toBigInt(),
        data: "0x",
      },
      from: sourceId.toString(),
      deadline: deadline.toBigInt(),
      nonce: nonce.toBigInt(),
    };
    const hold: Hold = {
      amount: amount.toBigInt(),
      expirationTimestamp: holdExpirationDate.toBigInt(),
      escrow: escrowId.toString(),
      to: targetId.toString(),
      data: "0x",
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ClearingHoldCreationFacet__factory.createInterface(),
      "protectedClearingCreateHoldByPartition",
      [protectedClearingOperation, hold, signature],
      GAS.PROTECTED_CLEARING_CREATE_HOLD_BY_PARTITION,
    );
  }

  async operatorClearingCreateHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    clearingExpirationDate: BigDecimal,
    holdExpirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Operator Clearing Create Hold By Partition to address ${security.toString()}`);
    const clearingOperationFrom: ClearingOperationFrom = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: clearingExpirationDate.toBigInt(),
        data: "0x",
      },
      from: sourceId.toString(),
      operatorData: "0x",
    };
    const hold: Hold = {
      amount: amount.toBigInt(),
      expirationTimestamp: holdExpirationDate.toBigInt(),
      escrow: escrowId.toString(),
      to: targetId.toString(),
      data: "0x",
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ClearingHoldCreationFacet__factory.createInterface(),
      "operatorClearingCreateHoldByPartition",
      [clearingOperationFrom, hold],
      GAS.OPERATOR_CLEARING_CREATE_HOLD_BY_PARTITION,
    );
  }

  async operatorClearingRedeemByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Operator Clearing Redeem By Partition to address ${security.toString()}`);
    const clearingOperationFrom: ClearingOperationFrom = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: expirationDate.toBigInt(),
        data: "0x",
      },
      from: sourceId.toString(),
      operatorData: "0x",
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ClearingRedeemFacet__factory.createInterface(),
      "operatorClearingRedeemByPartition",
      [clearingOperationFrom, amount.toBigInt()],
      GAS.OPERATOR_CLEARING_REDEEM_BY_PARTITION,
    );
  }

  async operatorClearingTransferByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Operator Clearing Transfer By Partition to address ${security.toString()}`);
    const clearingOperationFrom: ClearingOperationFrom = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: expirationDate.toBigInt(),
        data: "0x",
      },
      from: sourceId.toString(),
      operatorData: "0x",
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ClearingTransferFacet__factory.createInterface(),
      "operatorClearingTransferByPartition",
      [clearingOperationFrom, amount.toBigInt(), targetId.toString()],
      GAS.OPERATOR_CLEARING_TRANSFER_BY_PARTITION,
    );
  }
}
