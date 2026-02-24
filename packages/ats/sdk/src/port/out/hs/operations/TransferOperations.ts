// SPDX-License-Identifier: Apache-2.0

import { ContractId } from "@hiero-ledger/sdk";
import {
  ERC1410TokenHolderFacet__factory,
  ERC1410ManagementFacet__factory,
  ERC3643OperationsFacet__factory,
  ERC3643BatchFacet__factory,
  TransferAndLockFacet__factory,
} from "@hashgraph/asset-tokenization-contracts";
import { _PARTITION_ID_1, GAS } from "@core/Constants";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import { BasicTransferInfo, OperatorTransferData } from "@domain/context/factory/ERC1410Metadata";
import LogService from "@service/log/LogService";
import { TransactionExecutor } from "../TransactionExecutor";

export class TransferOperations {
  constructor(private readonly executor: TransactionExecutor) {}

  async transfer(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Transfering ${amount} securities to account ${targetId.toString()}`);
    const basicTransferInfo: BasicTransferInfo = {
      to: targetId.toString(),
      value: amount.toHexString(),
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC1410TokenHolderFacet__factory.createInterface(),
      "transferByPartition",
      [_PARTITION_ID_1, basicTransferInfo, "0x"],
      GAS.TRANSFER,
    );
  }

  async transferAndLock(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Transfering ${amount} securities to account ${targetId.toString()} and locking them until ${expirationDate.toString()}`,
    );
    return this.executor.executeContractCall(
      securityId.toString(),
      TransferAndLockFacet__factory.createInterface(),
      "transferAndLockByPartition",
      [_PARTITION_ID_1, targetId.toString(), amount.toHexString(), "0x", expirationDate.toHexString()],
      GAS.TRANSFER_AND_LOCK,
    );
  }

  async redeem(
    security: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Redeeming ${amount} securities from account ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC1410TokenHolderFacet__factory.createInterface(),
      "redeemByPartition",
      [_PARTITION_ID_1, amount.toHexString(), "0x"],
      GAS.REDEEM,
    );
  }

  async burn(
    security: EvmAddress,
    source: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Burning ${amount} securities from account ${source.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC3643OperationsFacet__factory.createInterface(),
      "burn",
      [source.toString(), amount.toHexString()],
      GAS.BURN,
    );
  }

  async controllerTransfer(
    security: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Controller transfer ${amount} tokens from account ${sourceId.toString()} to account ${targetId.toString()}`,
    );
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC1410ManagementFacet__factory.createInterface(),
      "controllerTransferByPartition",
      [_PARTITION_ID_1, sourceId.toString(), targetId.toString(), amount.toHexString(), "0x", "0x"],
      GAS.CONTROLLER_TRANSFER,
    );
  }

  async forcedTransfer(
    security: EvmAddress,
    source: EvmAddress,
    target: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Forced transfer ${amount} tokens from account ${source.toString()} to account ${target.toString()}`,
    );
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC3643OperationsFacet__factory.createInterface(),
      "forcedTransfer",
      [source.toString(), target.toString(), amount.toHexString()],
      GAS.FORCED_TRANSFER,
    );
  }

  async controllerRedeem(
    security: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Force redeem ${amount} tokens from account ${sourceId.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC1410ManagementFacet__factory.createInterface(),
      "controllerRedeemByPartition",
      [_PARTITION_ID_1, sourceId.toString(), amount.toHexString(), "0x", "0x"],
      GAS.CONTROLLER_REDEEM,
    );
  }

  async operatorTransferByPartition(
    security: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    partitionId: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Transfering ${amount} securities to account ${targetId.toString()} from account ${sourceId.toString()} on partition ${partitionId}`,
    );
    const operatorTransferData: OperatorTransferData = {
      partition: partitionId,
      from: sourceId.toString(),
      to: targetId.toString(),
      value: amount.toHexString(),
      data: "0x",
      operatorData: "0x",
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC1410ManagementFacet__factory.createInterface(),
      "operatorTransferByPartition",
      [operatorTransferData],
      GAS.TRANSFER_OPERATOR,
    );
  }

  async batchTransfer(
    security: EvmAddress,
    amountList: BigDecimal[],
    toList: EvmAddress[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Batch transferring ${amountList.length} tokens from ${security.toString()} to ${toList.map((item) => item.toString())}`,
    );
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC3643BatchFacet__factory.createInterface(),
      "batchTransfer",
      [toList.map((addr) => addr.toString()), amountList.map((amount) => amount.toBigInt())],
      GAS.BATCH_TRANSFER,
    );
  }

  async batchForcedTransfer(
    security: EvmAddress,
    amountList: BigDecimal[],
    fromList: EvmAddress[],
    toList: EvmAddress[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Batch forced transferring ${amountList.length} tokens from ${fromList.map((item) => item.toString())} to ${toList.map((item) => item.toString())}`,
    );
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC3643BatchFacet__factory.createInterface(),
      "batchForcedTransfer",
      [
        fromList.map((addr) => addr.toString()),
        toList.map((addr) => addr.toString()),
        amountList.map((amount) => amount.toBigInt()),
      ],
      GAS.BATCH_FORCED_TRANSFER,
    );
  }

  async batchBurn(
    security: EvmAddress,
    amountList: BigDecimal[],
    targetList: EvmAddress[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Batch burning ${amountList.length} tokens from ${targetList.map((item) => item.toString())}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC3643BatchFacet__factory.createInterface(),
      "batchBurn",
      [targetList.map((addr) => addr.toString()), amountList.map((amount) => amount.toBigInt())],
      GAS.BATCH_BURN,
    );
  }
}
