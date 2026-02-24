// SPDX-License-Identifier: Apache-2.0

import { ContractId } from "@hiero-ledger/sdk";
import { ethers } from "ethers";
import {
  ERC1410IssuerFacet__factory,
  ERC3643OperationsFacet__factory,
  ERC3643BatchFacet__factory,
  Bond__factory,
} from "@hashgraph/asset-tokenization-contracts";
import { _PARTITION_ID_1, GAS } from "@core/Constants";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import { IssueData } from "@domain/context/factory/ERC1410Metadata";
import LogService from "@service/log/LogService";
import { TransactionExecutor } from "../TransactionExecutor";

export class IssuanceOperations {
  constructor(private readonly executor: TransactionExecutor) {}

  async issue(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Issue ${amount} ${security} to account: ${targetId.toString()}`);
    const issueData: IssueData = {
      partition: _PARTITION_ID_1,
      tokenHolder: targetId.toString(),
      value: amount.toHexString(),
      data: "0x",
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC1410IssuerFacet__factory.createInterface(),
      "issueByPartition",
      [issueData],
      GAS.ISSUE,
    );
  }

  async mint(
    security: EvmAddress,
    target: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Minting ${amount} ${security} to account: ${target.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC3643OperationsFacet__factory.createInterface(),
      "mint",
      [target.toString(), amount.toHexString()],
      GAS.MINT,
    );
  }

  async batchMint(
    security: EvmAddress,
    amountList: BigDecimal[],
    toList: EvmAddress[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Batch minting ${amountList.length} tokens to ${toList.map((item) => item.toString())}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC3643BatchFacet__factory.createInterface(),
      "batchMint",
      [toList.map((addr) => addr.toString()), amountList.map((amount) => amount.toBigInt())],
      GAS.BATCH_MINT,
    );
  }

  async redeemAtMaturityByPartition(
    security: EvmAddress,
    partitionId: string,
    sourceId: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Redeeming at maturity by partition to address ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      new ethers.Interface(Bond__factory.abi as ethers.InterfaceAbi),
      "redeemAtMaturityByPartition",
      [sourceId.toString(), partitionId, amount.toBigInt()],
      GAS.REDEEM_AT_MATURITY_BY_PARTITION_GAS,
    );
  }

  async fullRedeemAtMaturity(
    security: EvmAddress,
    sourceId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Redeeming at maturity by partition to address ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      new ethers.Interface(Bond__factory.abi as ethers.InterfaceAbi),
      "fullRedeemAtMaturity",
      [sourceId.toString()],
      GAS.FULL_REDEEM_AT_MATURITY_GAS,
    );
  }
}
