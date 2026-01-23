// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import Account from "@domain/account/Account"
import { ContractId } from "@hiero-ledger/sdk"
import { Environment } from "@domain/network/Environment"
import DfnsSettings from "@core/settings/custodialWalletSettings/DfnsSettings"
import EvmAddress from "@domain/contract/EvmAddress"
import BigDecimal from "@domain/shared/BigDecimal"
import TransactionResponse from "@domain/transaction/TransactionResponse"
import RbacPort from "./hs/types/RbacPort"

export interface InitializationData {
  account?: Account;
  pairing?: string;
  topic?: string;
}

export interface NetworkData {
  name?: Environment;
  recognized?: boolean;
  businessLogicKeysCommon?: string[];
  businessLogicKeysEquity?: string[];
  businessLogicKeysBond?: string[];
}

interface ITransactionAdapter {
  init(): Promise<Environment>;
  register(input?: Account | DfnsSettings): Promise<InitializationData>;
  stop(): Promise<boolean>;
  importAsset(asset: EvmAddress, paymentToken: EvmAddress): Promise<EvmAddress>;
  deploy(asset: EvmAddress, paymentToken: EvmAddress, rbac: RbacPort[]): Promise<string>;
  pause(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string
  ): Promise<TransactionResponse<any, Error>>;
  unpause(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string
  ): Promise<TransactionResponse<any, Error>>;
  executeDistribution(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    distributionID: string,
    pageIndex: number,
    pageLength: number
  ): Promise<TransactionResponse<any, Error>>;
  executeDistributionByAddresses(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    distributionID: string,
    holders: EvmAddress[]
  ): Promise<TransactionResponse<any, Error>>;
  executeBondCashOut(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    bond: EvmAddress,
    pageIndex: number,
    pageLength: number
  ): Promise<TransactionResponse<any, Error>>;
  executeBondCashOutByAddresses(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    bond: EvmAddress,
    holders: EvmAddress[]
  ): Promise<TransactionResponse<any, Error>>;
  executeAmountSnapshot(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    snapshotID: string,
    pageIndex: number,
    pageLength: number,
    amount: BigDecimal
  ): Promise<TransactionResponse<any, Error>>;
  executePercentageSnapshot(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    snapshotID: string,
    pageIndex: number,
    pageLength: number,
    percentage: BigDecimal
  ): Promise<TransactionResponse<any, Error>>;
  executeAmountSnapshotByAddresses(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    snapshotID: string,
    holders: EvmAddress[],
    amount: BigDecimal
  ): Promise<TransactionResponse<any, Error>>;
  executePercentageSnapshotByAddresses(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    snapshotID: string,
    holders: EvmAddress[],
    percentage: BigDecimal
  ): Promise<TransactionResponse<any, Error>>;
  transferPaymentToken(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    to: EvmAddress,
    amount: BigDecimal
  );
  updatePaymentToken(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    paymentToken: EvmAddress
  );
  getPaymentToken(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string
  ): Promise<TransactionResponse>;
}

export default abstract class TransactionAdapter
  implements ITransactionAdapter
{
  init(): Promise<string> {
    throw new Error("Method not implemented.")
  }

  register(input?: Account | DfnsSettings): Promise<InitializationData> {
    throw new Error("Method not implemented.")
  }

  stop(): Promise<boolean> {
    throw new Error("Method not implemented.")
  }

  importAsset(
    asset: EvmAddress,
    paymentToken: EvmAddress
  ): Promise<EvmAddress> {
    throw new Error("Method not implemented.")
  }

  deploy(asset: EvmAddress, paymentToken: EvmAddress, rbac: RbacPort[]): Promise<string> {
    throw new Error("Method not implemented.")
  }

  pause(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error("Method not implemented.")
  }

  unpause(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error("Method not implemented.")
  }

  executeDistribution(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    distributionID: string,
    pageIndex: number,
    pageLength: number
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error("Method not implemented.")
  }

  executeDistributionByAddresses(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    distributionID: string,
    holders: EvmAddress[]
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error("Method not implemented.")
  }

  executeBondCashOut(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    bond: EvmAddress,
    pageIndex: number,
    pageLength: number
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error("Method not implemented.")
  }

  executeBondCashOutByAddresses(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    bond: EvmAddress,
    holders: EvmAddress[]
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error("Method not implemented.")
  }

  executeAmountSnapshot(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    snapshotID: string,
    pageIndex: number,
    pageLength: number,
    amount: BigDecimal
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error("Method not implemented.")
  }

  executePercentageSnapshot(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    snapshotID: string,
    pageIndex: number,
    pageLength: number,
    amount: BigDecimal
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error("Method not implemented.")
  }

  executeAmountSnapshotByAddresses(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    snapshotID: string,
    holders: EvmAddress[],
    amount: BigDecimal
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error("Method not implemented.")
  }

  executePercentageSnapshotByAddresses(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    snapshotID: string,
    holders: EvmAddress[],
    percentage: BigDecimal
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error("Method not implemented.")
  }

  transferPaymentToken(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    to: EvmAddress,
    amount: BigDecimal
  ) {
    throw new Error("Method not implemented.")
  }

  updatePaymentToken(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    paymentToken: EvmAddress
  ) {
    throw new Error("Method not implemented.")
  }

  getPaymentToken(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string
  ): Promise<TransactionResponse> {
    throw new Error("Method not implemented.")
  }
}
