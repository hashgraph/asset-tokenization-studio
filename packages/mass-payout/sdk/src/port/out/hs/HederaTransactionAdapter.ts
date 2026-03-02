// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
/* eslint-disable camelcase */
/* eslint-disable unused-imports/no-unused-vars */
import { Logger } from "@nestjs/common";
import {
  PAUSE_GAS,
  UNPAUSE_GAS,
  PROXY_DEPLOYMENT_GAS,
  PROXY_ADMIN_DEPLOYMENT_GAS,
  LIFE_CYCLE_CASH_FLOW_DEPLOYMENT_GAS,
  EXECUTE_DISTRIBUTION_GAS,
  EXECUTE_DISTRIBUTION_BY_ADDRESSES_GAS,
  EXECUTE_BOND_CASHOUT_GAS,
  EXECUTE_BOND_CASHOUT_BY_ADDRESSES_GAS,
  EXECUTE_AMOUNT_SNAPSHOT_GAS,
  EXECUTE_AMOUNT_SNAPSHOT_BY_ADDRESSES_GAS,
  EXECUTE_PERCENTAGE_SNAPSHOT_GAS,
  EXECUTE_PERCENTAGE_SNAPSHOT_BY_ADDRESSES_GAS,
} from "@core/Constants";

import {
  Hbar,
  Signer,
  ContractId,
  Transaction,
  TransactionReceipt,
  FileAppendTransaction,
  FileCreateTransaction,
  ContractCreateTransaction,
  ContractExecuteTransaction,
} from "@hiero-ledger/sdk";
import TransactionAdapter from "../TransactionAdapter";
import { MirrorNodeAdapter } from "../mirror/MirrorNodeAdapter";
import NetworkService from "@app/services/network/NetworkService";
import TransactionResponse from "@domain/transaction/TransactionResponse";
import { MirrorNodes } from "@domain/network/MirrorNode";
import { JsonRpcRelays } from "@domain/network/JsonRpcRelay";
import { TransactionType } from "../TransactionResponseEnums";
import Account from "@domain/account/Account";
import EvmAddress from "@domain/contract/EvmAddress";
import BigDecimal from "@domain/shared/BigDecimal";
import RbacPort from "./types/RbacPort";
import { AbiCoder, Interface, BaseContract, ContractRunner } from "ethers";
import {
  LifeCycleCashFlow__factory,
  ProxyAdmin__factory,
  TransparentUpgradeableProxy__factory,
} from "@hashgraph/mass-payout-contracts";

export abstract class HederaTransactionAdapter extends TransactionAdapter {
  protected readonly logger = new Logger(HederaTransactionAdapter.name);

  mirrorNodes: MirrorNodes;
  jsonRpcRelays: JsonRpcRelays;

  // common
  protected signer: Signer;

  constructor(
    protected readonly mirrorNodeAdapter: MirrorNodeAdapter,
    protected readonly networkService: NetworkService,
  ) {
    super();
  }

  private async executeWithArgs<C extends BaseContract>(
    contractInstance: C,
    functionName: string,
    contractId: ContractId | string,
    gas: number,
    args: any[],
  ): Promise<TransactionResponse<any, Error>> {
    const encodedHex = contractInstance.interface.encodeFunctionData(functionName, args as any);
    const encoded = new Uint8Array(Buffer.from(encodedHex.slice(2), "hex"));

    return this.buildAndSendTransaction(
      contractId,
      gas,
      (tx) => {
        tx.setFunctionParameters(encoded);
      },
      functionName,
    );
  }

  private async buildAndSendTransaction(
    contractId: ContractId | string,
    gas: number,
    setup: (tx: ContractExecuteTransaction) => void,
    functionName: string,
  ): Promise<TransactionResponse<any, Error>> {
    const tx = new ContractExecuteTransaction().setContractId(contractId).setGas(gas);

    setup(tx);

    return this.signAndSendTransaction(
      tx,
      TransactionType.RECORD,
      functionName,
      LifeCycleCashFlow__factory.abi as unknown as object[],
    );
  }

  // * Operations NOT Smart Contract related
  public setMirrorNodes(mirrorNodes?: MirrorNodes): void {
    if (mirrorNodes) this.mirrorNodes = mirrorNodes;
  }

  public setJsonRpcRelays(jsonRpcRelays?: JsonRpcRelays): void {
    if (jsonRpcRelays) this.jsonRpcRelays = jsonRpcRelays;
  }

  protected getSignerOrProvider(): ContractRunner {
    return this.signer as unknown as ContractRunner;
  }

  importAsset(asset: EvmAddress, paymentToken: EvmAddress): Promise<EvmAddress> {
    throw new Error("Method not implemented.");
  }

  async deploy(asset: EvmAddress, paymentToken: EvmAddress, rbac: RbacPort[]): Promise<string> {
    const lifeCycleCashFlowBytecodeHex = LifeCycleCashFlow__factory.bytecode.startsWith("0x")
      ? LifeCycleCashFlow__factory.bytecode.slice(2)
      : LifeCycleCashFlow__factory.bytecode;

    const lifeCycleCashFlowContractId = await this.deployLifeCycleCashFlow(lifeCycleCashFlowBytecodeHex);

    const lifeCycleCashFlowContractAddress = (
      await this.mirrorNodeAdapter.getContractInfo(lifeCycleCashFlowContractId.toString())
    ).evmAddress;
    this.logger.log("Deployed LifeCycleCashFlow ID:", lifeCycleCashFlowContractId, lifeCycleCashFlowContractAddress);

    const proxyAdminBytecodeHex = ProxyAdmin__factory.bytecode.startsWith("0x")
      ? ProxyAdmin__factory.bytecode.slice(2)
      : ProxyAdmin__factory.bytecode;

    const initialOwnerEvmAddress = this.getAccount().evmAddress;
    const abiCoder = new AbiCoder();
    const constructorParamsProxyAdminHex = abiCoder.encode(["address"], [initialOwnerEvmAddress]);

    const fullBytecodeProxyAdminHex = "0x" + proxyAdminBytecodeHex + constructorParamsProxyAdminHex.slice(2);
    const fullBytecodeProxyAdmin = Uint8Array.from(Buffer.from(fullBytecodeProxyAdminHex.slice(2), "hex"));

    const proxyAdminTransaction = new ContractCreateTransaction()
      .setBytecode(fullBytecodeProxyAdmin)
      .setGas(PROXY_ADMIN_DEPLOYMENT_GAS);

    const resProxyAdmin = await this.signAndSendTransactionForDeployment(proxyAdminTransaction);
    const proxyAdminAddress = "0x".concat(resProxyAdmin.contractId.toSolidityAddress());

    this.logger.log("ProxyAdmin:", resProxyAdmin.contractId, proxyAdminAddress);

    const proxyBytecodeHex = TransparentUpgradeableProxy__factory.bytecode.startsWith("0x")
      ? TransparentUpgradeableProxy__factory.bytecode.slice(2)
      : TransparentUpgradeableProxy__factory.bytecode;

    const iface = new Interface(LifeCycleCashFlow__factory.abi);
    const callDataHex = iface.encodeFunctionData("initialize", [asset.value, paymentToken.value.slice(2), rbac]);

    const constructorParamsProxyHex = abiCoder.encode(
      ["address", "address", "bytes"],
      [lifeCycleCashFlowContractAddress, proxyAdminAddress, callDataHex],
    );
    const fullBytecodeProxyHex = "0x" + proxyBytecodeHex + constructorParamsProxyHex.slice(2);
    const fullBytecodeProxy = Uint8Array.from(Buffer.from(fullBytecodeProxyHex.slice(2), "hex"));

    const proxyTransaction = new ContractCreateTransaction()
      .setBytecode(fullBytecodeProxy)
      .setGas(PROXY_DEPLOYMENT_GAS);

    const resProxy = await this.signAndSendTransactionForDeployment(proxyTransaction);
    const proxyAddress = "0x".concat(resProxy.contractId.toSolidityAddress());

    this.logger.log("Proxy:", resProxy.contractId, proxyAddress);

    return proxyAddress;
  }

  private async deployLifeCycleCashFlow(bytecode: string): Promise<string> {
    const fileCreateTransaction = new FileCreateTransaction().setKeys([]).setMaxTransactionFee(new Hbar(5));

    const fileCreateReceipt: TransactionReceipt | undefined =
      await this.signAndSendTransactionForDeployment(fileCreateTransaction);
    const fileId = fileCreateReceipt.fileId;

    const appendTransaction = new FileAppendTransaction()
      .setFileId(fileId)
      .setContents(bytecode) // your 15650 bytes
      .setMaxTransactionFee(new Hbar(5));

    await this.signAndSendTransactionForDeployment(appendTransaction);

    const contractCreateTransaction = new ContractCreateTransaction()
      .setBytecodeFileId(fileId)
      .setGas(LIFE_CYCLE_CASH_FLOW_DEPLOYMENT_GAS)
      .setMaxTransactionFee(new Hbar(30));

    const contractCreateReceipt: TransactionReceipt | undefined =
      await this.signAndSendTransactionForDeployment(contractCreateTransaction);

    return contractCreateReceipt.contractId.toString();
  }

  async pause(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = "pause";
    this.logger.log(`Pausing LifeCycleCashFlow on address ${lifeCycleCashFlow.toString()}`);

    const functionDataEncodedHex = new Interface(LifeCycleCashFlow__factory.abi).encodeFunctionData(FUNCTION_NAME);

    const functionDataEncoded = new Uint8Array(Buffer.from(functionDataEncodedHex.slice(2), "hex"));

    const transaction = new ContractExecuteTransaction()
      .setContractId(lifeCycleCashFlowId)
      .setGas(PAUSE_GAS)
      .setFunctionParameters(functionDataEncoded);

    return await this.signAndSendTransaction(transaction);
  }

  async unpause(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = "unpause";
    this.logger.log(`Pausing LifeCycleCashFlow on address ${lifeCycleCashFlow.toString()}`);

    const functionDataEncodedHex = new Interface(LifeCycleCashFlow__factory.abi).encodeFunctionData(FUNCTION_NAME);

    const functionDataEncoded = new Uint8Array(Buffer.from(functionDataEncodedHex.slice(2), "hex"));

    const transaction = new ContractExecuteTransaction()
      .setContractId(lifeCycleCashFlowId)
      .setGas(UNPAUSE_GAS)
      .setFunctionParameters(functionDataEncoded);

    return await this.signAndSendTransaction(transaction);
  }

  executeDistribution(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    distributionID: string,
    pageIndex: number,
    pageLength: number,
  ): Promise<TransactionResponse<any, Error>> {
    this.logger.log(`Executing distribution on address ${lifeCycleCashFlow.toString()}`);

    return this.executeWithArgs(
      LifeCycleCashFlow__factory.connect(lifeCycleCashFlow.toString(), this.getSignerOrProvider()),
      "executeDistribution",
      lifeCycleCashFlowId,
      EXECUTE_DISTRIBUTION_GAS,
      [asset.toString(), distributionID, pageIndex, pageLength],
    );
  }

  executeDistributionByAddresses(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    distributionID: string,
    holders: EvmAddress[],
  ): Promise<TransactionResponse<any, Error>> {
    this.logger.log(`Executing distribution by addresses on address ${lifeCycleCashFlow.toString()}`);

    return this.executeWithArgs(
      LifeCycleCashFlow__factory.connect(lifeCycleCashFlow.toString(), this.getSignerOrProvider()),
      "executeDistributionByAddresses",
      lifeCycleCashFlowId,
      EXECUTE_DISTRIBUTION_BY_ADDRESSES_GAS,
      [asset.toString(), distributionID, holders.map((holder) => holder.toString())],
    );
  }

  executeBondCashOut(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    bond: EvmAddress,
    pageIndex: number,
    pageLength: number,
  ): Promise<TransactionResponse<any, Error>> {
    this.logger.log(`Executing bond cash out on address ${lifeCycleCashFlow.toString()}`);

    return this.executeWithArgs(
      LifeCycleCashFlow__factory.connect(lifeCycleCashFlow.toString(), this.getSignerOrProvider()),
      "executeBondCashOut",
      lifeCycleCashFlowId,
      EXECUTE_BOND_CASHOUT_GAS,
      [bond.toString(), pageIndex, pageLength],
    );
  }

  executeBondCashOutByAddresses(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    bond: EvmAddress,
    holders: EvmAddress[],
  ): Promise<TransactionResponse<any, Error>> {
    this.logger.log(`Executing bond cash out by addresses on address ${lifeCycleCashFlow.toString()}`);

    return this.executeWithArgs(
      LifeCycleCashFlow__factory.connect(lifeCycleCashFlow.toString(), this.getSignerOrProvider()),
      "executeBondCashOutByAddresses",
      lifeCycleCashFlowId,
      EXECUTE_BOND_CASHOUT_BY_ADDRESSES_GAS,
      [bond.toString(), holders.map((holder) => holder.toString())],
    );
  }

  executeAmountSnapshot(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    snapshotID: string,
    pageIndex: number,
    pageLength: number,
    amount: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    this.logger.log(`Executing amount snapshot on address ${lifeCycleCashFlow.toString()}`);

    return this.executeWithArgs(
      LifeCycleCashFlow__factory.connect(lifeCycleCashFlow.toString(), this.getSignerOrProvider()),
      "executeAmountSnapshot",
      lifeCycleCashFlowId,
      EXECUTE_AMOUNT_SNAPSHOT_GAS,
      [asset.toString(), snapshotID, pageIndex, pageLength, amount.toHexString()],
    );
  }

  executePercentageSnapshot(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    snapshotID: string,
    pageIndex: number,
    pageLength: number,
    percentage: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    this.logger.log(`Executing percentage snapshot on address ${lifeCycleCashFlow.toString()}`);

    return this.executeWithArgs(
      LifeCycleCashFlow__factory.connect(lifeCycleCashFlow.toString(), this.getSignerOrProvider()),
      "executePercentageSnapshot",
      lifeCycleCashFlowId,
      EXECUTE_PERCENTAGE_SNAPSHOT_GAS,
      [asset.toString(), snapshotID, pageIndex, pageLength, percentage.toHexString()],
    );
  }

  executeAmountSnapshotByAddresses(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    snapshotID: string,
    holders: EvmAddress[],
    amount: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    this.logger.log(`Executing amount snapshot by addresses on address ${lifeCycleCashFlow.toString()}`);

    return this.executeWithArgs(
      LifeCycleCashFlow__factory.connect(lifeCycleCashFlow.toString(), this.getSignerOrProvider()),
      "executeAmountSnapshotByAddresses",
      lifeCycleCashFlowId,
      EXECUTE_AMOUNT_SNAPSHOT_BY_ADDRESSES_GAS,
      [asset.toString(), snapshotID, holders.map((holder) => holder.toString()), amount.toHexString()],
    );
  }

  executePercentageSnapshotByAddresses(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    asset: EvmAddress,
    snapshotID: string,
    holders: EvmAddress[],
    percentage: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    this.logger.log(`Executing percentage snapshot by addresses on address ${lifeCycleCashFlow.toString()}`);

    return this.executeWithArgs(
      LifeCycleCashFlow__factory.connect(lifeCycleCashFlow.toString(), this.getSignerOrProvider()),
      "executePercentageSnapshotByAddresses",
      lifeCycleCashFlowId,
      EXECUTE_PERCENTAGE_SNAPSHOT_BY_ADDRESSES_GAS,
      [asset.toString(), snapshotID, holders.map((holder) => holder.toString()), percentage.toHexString()],
    );
  }

  transferPaymentToken(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    to: EvmAddress,
    amount: BigDecimal,
  ) {
    throw new Error("Method not implemented.");
  }

  updatePaymentToken(
    lifeCycleCashFlow: EvmAddress,
    lifeCycleCashFlowId: ContractId | string,
    paymentToken: EvmAddress,
  ) {
    throw new Error("Method not implemented.");
  }

  abstract signAndSendTransaction(
    transaction: Transaction,
    transactionType?: TransactionType,
    functionName?: string,
    abi?: object[],
  ): Promise<TransactionResponse>;

  abstract signAndSendTransactionForDeployment(transaction: Transaction): Promise<TransactionReceipt>;

  abstract getAccount(): Account;
}
