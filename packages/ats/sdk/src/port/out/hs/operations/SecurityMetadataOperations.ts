// SPDX-License-Identifier: Apache-2.0

import { ContractId } from "@hiero-ledger/sdk";
import { ethers } from "ethers";
import {
  ERC3643ManagementFacet__factory,
  ERC1643Facet__factory,
  DiamondFacet__factory,
  FreezeFacet__factory,
  ERC1410ManagementFacet__factory,
  CapFacet__factory,
} from "@hashgraph/asset-tokenization-contracts";
import { EVM_ZERO_ADDRESS, GAS } from "@core/Constants";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import { ProtectionData } from "@domain/context/factory/ProtectionData";
import LogService from "@service/log/LogService";
import { TransactionExecutor } from "../TransactionExecutor";

export class SecurityMetadataOperations {
  constructor(private readonly executor: TransactionExecutor) {}

  async setName(security: EvmAddress, name: string, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Setting name to ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC3643ManagementFacet__factory.createInterface(),
      "setName",
      [name],
      GAS.SET_NAME,
    );
  }

  async setSymbol(security: EvmAddress, symbol: string, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Setting symbol to ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC3643ManagementFacet__factory.createInterface(),
      "setSymbol",
      [symbol],
      GAS.SET_SYMBOL,
    );
  }

  async setDocument(
    security: EvmAddress,
    name: string,
    uri: string,
    hash: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Setting document: ${name}, with ${uri}, and hash ${hash} for security ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC1643Facet__factory.createInterface(),
      "setDocument",
      [name, uri, hash],
      GAS.SET_DOCUMENT,
    );
  }

  async removeDocument(
    security: EvmAddress,
    name: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Removing document: ${name} for security ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC1643Facet__factory.createInterface(),
      "removeDocument",
      [name],
      GAS.REMOVE_DOCUMENT,
    );
  }

  async updateConfigVersion(
    security: EvmAddress,
    configVersion: number,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Updating config version`);
    return this.executor.executeContractCall(
      securityId.toString(),
      DiamondFacet__factory.createInterface(),
      "updateConfigVersion",
      [configVersion],
      GAS.UPDATE_CONFIG_VERSION,
    );
  }

  async updateConfig(
    security: EvmAddress,
    configId: string,
    configVersion: number,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Updating config`);
    return this.executor.executeContractCall(
      securityId.toString(),
      DiamondFacet__factory.createInterface(),
      "updateConfig",
      [configId, configVersion],
      GAS.UPDATE_CONFIG,
    );
  }

  async updateResolver(
    security: EvmAddress,
    resolver: EvmAddress,
    configVersion: number,
    configId: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Updating Resolver`);
    return this.executor.executeContractCall(
      securityId.toString(),
      DiamondFacet__factory.createInterface(),
      "updateResolver",
      [resolver.toString(), configId, configVersion],
      GAS.UPDATE_RESOLVER,
    );
  }

  async protectPartitions(security: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Protecting Partitions for security: ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      new ethers.Interface(["function protectPartitions()"]),
      "protectPartitions",
      [],
      GAS.PROTECT_PARTITION,
    );
  }

  async unprotectPartitions(security: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Unprotecting Partitions for security: ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      new ethers.Interface(["function unprotectPartitions()"]),
      "unprotectPartitions",
      [],
      GAS.UNPROTECT_PARTITION,
    );
  }

  async protectedRedeemFromByPartition(
    security: EvmAddress,
    partitionId: string,
    sourceId: EvmAddress,
    amount: BigDecimal,
    deadline: BigDecimal,
    nounce: BigDecimal,
    signature: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Protected Redeeming ${amount} securities from account ${sourceId.toString()}`);
    const protectionData: ProtectionData = {
      deadline: deadline.toBigInt(),
      nounce: nounce.toBigInt(),
      signature: signature,
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC1410ManagementFacet__factory.createInterface(),
      "protectedRedeemFromByPartition",
      [partitionId, sourceId.toString(), amount.toBigInt(), protectionData],
      GAS.PROTECTED_REDEEM,
    );
  }

  async protectedTransferFromByPartition(
    security: EvmAddress,
    partitionId: string,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    deadline: BigDecimal,
    nounce: BigDecimal,
    signature: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Protected Transfering ${amount} securities from account ${sourceId.toString()} to account ${targetId.toString()}`,
    );
    const protectionData: ProtectionData = {
      deadline: deadline.toBigInt(),
      nounce: nounce.toBigInt(),
      signature: signature,
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC1410ManagementFacet__factory.createInterface(),
      "protectedTransferFromByPartition",
      [partitionId, sourceId.toString(), targetId.toString(), amount.toBigInt(), protectionData],
      GAS.PROTECTED_TRANSFER,
    );
  }

  async freezePartialTokens(
    security: EvmAddress,
    amount: BigDecimal,
    targetId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Freezing ${amount} tokens ${security.toString()} to account ${targetId.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      FreezeFacet__factory.createInterface(),
      "freezePartialTokens",
      [targetId.toString(), amount.toBigInt()],
      GAS.FREEZE_PARTIAL_TOKENS,
    );
  }

  async unfreezePartialTokens(
    security: EvmAddress,
    amount: BigDecimal,
    targetId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Unfreezing ${amount} tokens ${security.toString()} to account ${targetId.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      FreezeFacet__factory.createInterface(),
      "unfreezePartialTokens",
      [targetId.toString(), amount.toBigInt()],
      GAS.UNFREEZE_PARTIAL_TOKENS,
    );
  }

  async setAddressFrozen(
    security: EvmAddress,
    status: boolean,
    target: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Freezing address ${target.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      FreezeFacet__factory.createInterface(),
      "setAddressFrozen",
      [target.toString(), status],
      GAS.SET_ADDRESS_FROZEN,
    );
  }

  async batchSetAddressFrozen(
    security: EvmAddress,
    freezeList: boolean[],
    targetList: EvmAddress[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Batch setting freeze status for ${targetList.length} addresses`);
    return this.executor.executeContractCall(
      securityId.toString(),
      FreezeFacet__factory.createInterface(),
      "batchSetAddressFrozen",
      [targetList.map((addr) => addr.toString()), freezeList],
      GAS.BATCH_SET_ADDRESS_FROZEN,
    );
  }

  async batchFreezePartialTokens(
    security: EvmAddress,
    amountList: BigDecimal[],
    targetList: EvmAddress[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Batch freezing partial tokens for ${targetList.length} addresses`);
    return this.executor.executeContractCall(
      securityId.toString(),
      FreezeFacet__factory.createInterface(),
      "batchFreezePartialTokens",
      [targetList.map((addr) => addr.toString()), amountList.map((amount) => amount.toBigInt())],
      GAS.BATCH_FREEZE_PARTIAL_TOKENS,
    );
  }

  async batchUnfreezePartialTokens(
    security: EvmAddress,
    amountList: BigDecimal[],
    targetList: EvmAddress[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Batch unfreezing partial tokens for ${targetList.length} addresses`);
    return this.executor.executeContractCall(
      securityId.toString(),
      FreezeFacet__factory.createInterface(),
      "batchUnfreezePartialTokens",
      [targetList.map((addr) => addr.toString()), amountList.map((amount) => amount.toBigInt())],
      GAS.BATCH_UNFREEZE_PARTIAL_TOKENS,
    );
  }

  async recoveryAddress(
    security: EvmAddress,
    lostWalletId: EvmAddress,
    newWalletId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Recovering address ${lostWalletId.toString()} to ${newWalletId.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC3643ManagementFacet__factory.createInterface(),
      "recoveryAddress",
      [lostWalletId.toString(), newWalletId.toString(), EVM_ZERO_ADDRESS],
      GAS.RECOVERY_ADDRESS,
    );
  }

  async addAgent(
    security: EvmAddress,
    agentId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Granting agent role to ${agentId.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC3643ManagementFacet__factory.createInterface(),
      "addAgent",
      [agentId.toString()],
      GAS.ADD_AGENT,
    );
  }

  async removeAgent(
    security: EvmAddress,
    agentId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Revoking agent role from ${agentId.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC3643ManagementFacet__factory.createInterface(),
      "removeAgent",
      [agentId.toString()],
      GAS.REMOVE_AGENT,
    );
  }

  async setMaxSupply(
    security: EvmAddress,
    maxSupply: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Setting max supply ${maxSupply} for security ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      CapFacet__factory.createInterface(),
      "setMaxSupply",
      [maxSupply.toHexString()],
      GAS.SET_MAX_SUPPLY,
    );
  }
}
