// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ContractExecuteTransaction,
  Signer,
  Transaction,
} from "@hiero-ledger/sdk";
import { ethers } from "ethers";
import TransactionAdapter from "../TransactionAdapter";
import { MirrorNodeAdapter } from "../mirror/MirrorNodeAdapter";
import NetworkService from "@service/network/NetworkService";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import { MirrorNodes } from "@domain/context/network/MirrorNode";
import { JsonRpcRelays } from "@domain/context/network/JsonRpcRelay";
import { Factories } from "@domain/context/factory/Factories";
import { Resolvers } from "@domain/context/factory/Resolvers";
import { BusinessLogicKeys } from "@domain/context/factory/BusinessLogicKeys";
import { TransactionType } from "../TransactionResponseEnums";
import Account from "@domain/context/account/Account";
import { TransactionExecutor } from "./TransactionExecutor";
import { FactoryOperations } from "./operations/FactoryOperations";
import { TransferOperations } from "./operations/TransferOperations";
import { IssuanceOperations } from "./operations/IssuanceOperations";
import { RoleOperations } from "./operations/RoleOperations";
import { HoldOperations } from "./operations/HoldOperations";
import { ClearingOperations } from "./operations/ClearingOperations";
import { ComplianceOperations } from "./operations/ComplianceOperations";
import { ControlListOperations } from "./operations/ControlListOperations";
import { PauseOperations } from "./operations/PauseOperations";
import { LockOperations } from "./operations/LockOperations";
import { SecurityOperations } from "./operations/SecurityOperations";
import { SecurityMetadataOperations } from "./operations/SecurityMetadataOperations";

export abstract class BaseHederaTransactionAdapter extends TransactionAdapter implements TransactionExecutor {
  mirrorNodes: MirrorNodes;
  jsonRpcRelays: JsonRpcRelays;
  factories: Factories;
  resolvers: Resolvers;
  businessLogicKeysCommon: BusinessLogicKeys;
  businessLogicKeysEquity: BusinessLogicKeys;
  businessLogicKeysBond: BusinessLogicKeys;
  // common
  protected signer: Signer;

  protected factoryOps!: FactoryOperations;
  protected transferOps!: TransferOperations;
  protected issuanceOps!: IssuanceOperations;
  protected roleOps!: RoleOperations;
  protected holdOps!: HoldOperations;
  protected clearingOps!: ClearingOperations;
  protected complianceOps!: ComplianceOperations;
  protected controlListOps!: ControlListOperations;
  protected pauseOps!: PauseOperations;
  protected lockOps!: LockOperations;
  protected securityOps!: SecurityOperations;
  protected securityMetadataOps!: SecurityMetadataOperations;

  constructor(
    protected readonly mirrorNodeAdapter: MirrorNodeAdapter,
    protected readonly networkService: NetworkService,
  ) {
    super();
    this.factoryOps = new FactoryOperations(this);
    this.transferOps = new TransferOperations(this);
    this.issuanceOps = new IssuanceOperations(this);
    this.roleOps = new RoleOperations(this);
    this.holdOps = new HoldOperations(this);
    this.clearingOps = new ClearingOperations(this);
    this.complianceOps = new ComplianceOperations(this);
    this.controlListOps = new ControlListOperations(this);
    this.pauseOps = new PauseOperations(this);
    this.lockOps = new LockOperations(this);
    this.securityOps = new SecurityOperations(this);
    this.securityMetadataOps = new SecurityMetadataOperations(this);
  }

  // ===== Abstract methods (implemented by concrete adapters) =====

  abstract processTransaction(
    tx: Transaction,
    transactionType: TransactionType,
    startDate?: string,
  ): Promise<TransactionResponse>;

  abstract getAccount(): Account;

  abstract supportsEvmOperations(): boolean;

  // ===== Concrete executeContractCall =====

  public async executeContractCall(
    contractId: string,
    iface: ethers.Interface,
    functionName: string,
    params: unknown[],
    gasLimit: number,
    transactionType: TransactionType = TransactionType.RECEIPT,
    payableAmountHbar?: string,
    startDate?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _evmAddress?: string,
  ): Promise<TransactionResponse> {
    const encodedHex = iface.encodeFunctionData(functionName, params as any[]);
    const encoded = Uint8Array.from(Buffer.from(encodedHex.slice(2), "hex"));
    let tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setFunctionParameters(encoded)
      .setGas(gasLimit);
    if (payableAmountHbar) tx = tx.setPayableAmount(parseFloat(payableAmountHbar));
    return this.processTransaction(tx, transactionType, startDate);
  }

  // ===== Public getters =====

  public getNetworkService(): NetworkService {
    return this.networkService;
  }

  public getMirrorNodeAdapter(): MirrorNodeAdapter {
    return this.mirrorNodeAdapter;
  }

  // ===== Operations NOT Smart Contract related =====

  public setMirrorNodes(mirrorNodes?: MirrorNodes): void {
    if (mirrorNodes) this.mirrorNodes = mirrorNodes;
  }

  public setJsonRpcRelays(jsonRpcRelays?: JsonRpcRelays): void {
    if (jsonRpcRelays) this.jsonRpcRelays = jsonRpcRelays;
  }

  public setFactories(factories?: Factories): void {
    if (factories) this.factories = factories;
  }

  public setResolvers(resolvers?: Resolvers): void {
    if (resolvers) this.resolvers = resolvers;
  }

  public setBusinessLogicKeysCommon(businessLogicKeys?: BusinessLogicKeys): void {
    if (businessLogicKeys) this.businessLogicKeysCommon = businessLogicKeys;
  }

  public setBusinessLogicKeysEquity(businessLogicKeys?: BusinessLogicKeys): void {
    if (businessLogicKeys) this.businessLogicKeysEquity = businessLogicKeys;
  }

  public setBusinessLogicKeysBond(businessLogicKeys?: BusinessLogicKeys): void {
    if (businessLogicKeys) this.businessLogicKeysBond = businessLogicKeys;
  }

  // ===== Factory Operations =====

  async createEquity(...args: Parameters<FactoryOperations["createEquity"]>): Promise<TransactionResponse> {
    return this.factoryOps.createEquity(...args);
  }

  async createBond(...args: Parameters<FactoryOperations["createBond"]>): Promise<TransactionResponse> {
    return this.factoryOps.createBond(...args);
  }

  async createBondFixedRate(...args: Parameters<FactoryOperations["createBondFixedRate"]>): Promise<TransactionResponse> {
    return this.factoryOps.createBondFixedRate(...args);
  }

  async createBondKpiLinkedRate(...args: Parameters<FactoryOperations["createBondKpiLinkedRate"]>): Promise<TransactionResponse> {
    return this.factoryOps.createBondKpiLinkedRate(...args);
  }

  async createTrexSuiteBond(...args: Parameters<FactoryOperations["createTrexSuiteBond"]>): Promise<TransactionResponse> {
    return this.factoryOps.createTrexSuiteBond(...args);
  }

  async createTrexSuiteEquity(...args: Parameters<FactoryOperations["createTrexSuiteEquity"]>): Promise<TransactionResponse> {
    return this.factoryOps.createTrexSuiteEquity(...args);
  }

  // ===== Transfer Operations =====

  async transfer(...args: Parameters<TransferOperations["transfer"]>): Promise<TransactionResponse> {
    return this.transferOps.transfer(...args);
  }

  async transferAndLock(...args: Parameters<TransferOperations["transferAndLock"]>): Promise<TransactionResponse> {
    return this.transferOps.transferAndLock(...args);
  }

  async redeem(...args: Parameters<TransferOperations["redeem"]>): Promise<TransactionResponse> {
    return this.transferOps.redeem(...args);
  }

  async burn(...args: Parameters<TransferOperations["burn"]>): Promise<TransactionResponse> {
    return this.transferOps.burn(...args);
  }

  async controllerTransfer(...args: Parameters<TransferOperations["controllerTransfer"]>): Promise<TransactionResponse> {
    return this.transferOps.controllerTransfer(...args);
  }

  async forcedTransfer(...args: Parameters<TransferOperations["forcedTransfer"]>): Promise<TransactionResponse> {
    return this.transferOps.forcedTransfer(...args);
  }

  async controllerRedeem(...args: Parameters<TransferOperations["controllerRedeem"]>): Promise<TransactionResponse> {
    return this.transferOps.controllerRedeem(...args);
  }

  async operatorTransferByPartition(...args: Parameters<TransferOperations["operatorTransferByPartition"]>): Promise<TransactionResponse> {
    return this.transferOps.operatorTransferByPartition(...args);
  }

  async batchTransfer(...args: Parameters<TransferOperations["batchTransfer"]>): Promise<TransactionResponse> {
    return this.transferOps.batchTransfer(...args);
  }

  async batchForcedTransfer(...args: Parameters<TransferOperations["batchForcedTransfer"]>): Promise<TransactionResponse> {
    return this.transferOps.batchForcedTransfer(...args);
  }

  async batchBurn(...args: Parameters<TransferOperations["batchBurn"]>): Promise<TransactionResponse> {
    return this.transferOps.batchBurn(...args);
  }

  // ===== Issuance Operations =====

  async issue(...args: Parameters<IssuanceOperations["issue"]>): Promise<TransactionResponse> {
    return this.issuanceOps.issue(...args);
  }

  async mint(...args: Parameters<IssuanceOperations["mint"]>): Promise<TransactionResponse> {
    return this.issuanceOps.mint(...args);
  }

  async batchMint(...args: Parameters<IssuanceOperations["batchMint"]>): Promise<TransactionResponse> {
    return this.issuanceOps.batchMint(...args);
  }

  async redeemAtMaturityByPartition(...args: Parameters<IssuanceOperations["redeemAtMaturityByPartition"]>): Promise<TransactionResponse> {
    return this.issuanceOps.redeemAtMaturityByPartition(...args);
  }

  async fullRedeemAtMaturity(...args: Parameters<IssuanceOperations["fullRedeemAtMaturity"]>): Promise<TransactionResponse> {
    return this.issuanceOps.fullRedeemAtMaturity(...args);
  }

  // ===== Role Operations =====

  async grantRole(...args: Parameters<RoleOperations["grantRole"]>): Promise<TransactionResponse> {
    return this.roleOps.grantRole(...args);
  }

  async applyRoles(...args: Parameters<RoleOperations["applyRoles"]>): Promise<TransactionResponse> {
    return this.roleOps.applyRoles(...args);
  }

  async revokeRole(...args: Parameters<RoleOperations["revokeRole"]>): Promise<TransactionResponse> {
    return this.roleOps.revokeRole(...args);
  }

  async renounceRole(...args: Parameters<RoleOperations["renounceRole"]>): Promise<TransactionResponse> {
    return this.roleOps.renounceRole(...args);
  }

  async authorizeOperator(...args: Parameters<RoleOperations["authorizeOperator"]>): Promise<TransactionResponse> {
    return this.roleOps.authorizeOperator(...args);
  }

  async revokeOperator(...args: Parameters<RoleOperations["revokeOperator"]>): Promise<TransactionResponse> {
    return this.roleOps.revokeOperator(...args);
  }

  async authorizeOperatorByPartition(...args: Parameters<RoleOperations["authorizeOperatorByPartition"]>): Promise<TransactionResponse> {
    return this.roleOps.authorizeOperatorByPartition(...args);
  }

  async revokeOperatorByPartition(...args: Parameters<RoleOperations["revokeOperatorByPartition"]>): Promise<TransactionResponse> {
    return this.roleOps.revokeOperatorByPartition(...args);
  }

  // ===== Hold Operations =====

  async createHoldByPartition(...args: Parameters<HoldOperations["createHoldByPartition"]>): Promise<TransactionResponse> {
    return this.holdOps.createHoldByPartition(...args);
  }

  async createHoldFromByPartition(...args: Parameters<HoldOperations["createHoldFromByPartition"]>): Promise<TransactionResponse> {
    return this.holdOps.createHoldFromByPartition(...args);
  }

  async controllerCreateHoldByPartition(...args: Parameters<HoldOperations["controllerCreateHoldByPartition"]>): Promise<TransactionResponse> {
    return this.holdOps.controllerCreateHoldByPartition(...args);
  }

  async protectedCreateHoldByPartition(...args: Parameters<HoldOperations["protectedCreateHoldByPartition"]>): Promise<TransactionResponse> {
    return this.holdOps.protectedCreateHoldByPartition(...args);
  }

  async releaseHoldByPartition(...args: Parameters<HoldOperations["releaseHoldByPartition"]>): Promise<TransactionResponse> {
    return this.holdOps.releaseHoldByPartition(...args);
  }

  async reclaimHoldByPartition(...args: Parameters<HoldOperations["reclaimHoldByPartition"]>): Promise<TransactionResponse> {
    return this.holdOps.reclaimHoldByPartition(...args);
  }

  async executeHoldByPartition(...args: Parameters<HoldOperations["executeHoldByPartition"]>): Promise<TransactionResponse> {
    return this.holdOps.executeHoldByPartition(...args);
  }

  // ===== Clearing Operations =====

  async activateClearing(...args: Parameters<ClearingOperations["activateClearing"]>): Promise<TransactionResponse> {
    return this.clearingOps.activateClearing(...args);
  }

  async deactivateClearing(...args: Parameters<ClearingOperations["deactivateClearing"]>): Promise<TransactionResponse> {
    return this.clearingOps.deactivateClearing(...args);
  }

  async clearingTransferByPartition(...args: Parameters<ClearingOperations["clearingTransferByPartition"]>): Promise<TransactionResponse> {
    return this.clearingOps.clearingTransferByPartition(...args);
  }

  async clearingTransferFromByPartition(...args: Parameters<ClearingOperations["clearingTransferFromByPartition"]>): Promise<TransactionResponse> {
    return this.clearingOps.clearingTransferFromByPartition(...args);
  }

  async protectedClearingTransferByPartition(...args: Parameters<ClearingOperations["protectedClearingTransferByPartition"]>): Promise<TransactionResponse> {
    return this.clearingOps.protectedClearingTransferByPartition(...args);
  }

  async approveClearingOperationByPartition(...args: Parameters<ClearingOperations["approveClearingOperationByPartition"]>): Promise<TransactionResponse> {
    return this.clearingOps.approveClearingOperationByPartition(...args);
  }

  async cancelClearingOperationByPartition(...args: Parameters<ClearingOperations["cancelClearingOperationByPartition"]>): Promise<TransactionResponse> {
    return this.clearingOps.cancelClearingOperationByPartition(...args);
  }

  async reclaimClearingOperationByPartition(...args: Parameters<ClearingOperations["reclaimClearingOperationByPartition"]>): Promise<TransactionResponse> {
    return this.clearingOps.reclaimClearingOperationByPartition(...args);
  }

  async clearingRedeemByPartition(...args: Parameters<ClearingOperations["clearingRedeemByPartition"]>): Promise<TransactionResponse> {
    return this.clearingOps.clearingRedeemByPartition(...args);
  }

  async clearingRedeemFromByPartition(...args: Parameters<ClearingOperations["clearingRedeemFromByPartition"]>): Promise<TransactionResponse> {
    return this.clearingOps.clearingRedeemFromByPartition(...args);
  }

  async protectedClearingRedeemByPartition(...args: Parameters<ClearingOperations["protectedClearingRedeemByPartition"]>): Promise<TransactionResponse> {
    return this.clearingOps.protectedClearingRedeemByPartition(...args);
  }

  async clearingCreateHoldByPartition(...args: Parameters<ClearingOperations["clearingCreateHoldByPartition"]>): Promise<TransactionResponse> {
    return this.clearingOps.clearingCreateHoldByPartition(...args);
  }

  async clearingCreateHoldFromByPartition(...args: Parameters<ClearingOperations["clearingCreateHoldFromByPartition"]>): Promise<TransactionResponse> {
    return this.clearingOps.clearingCreateHoldFromByPartition(...args);
  }

  async protectedClearingCreateHoldByPartition(...args: Parameters<ClearingOperations["protectedClearingCreateHoldByPartition"]>): Promise<TransactionResponse> {
    return this.clearingOps.protectedClearingCreateHoldByPartition(...args);
  }

  async operatorClearingCreateHoldByPartition(...args: Parameters<ClearingOperations["operatorClearingCreateHoldByPartition"]>): Promise<TransactionResponse> {
    return this.clearingOps.operatorClearingCreateHoldByPartition(...args);
  }

  async operatorClearingRedeemByPartition(...args: Parameters<ClearingOperations["operatorClearingRedeemByPartition"]>): Promise<TransactionResponse> {
    return this.clearingOps.operatorClearingRedeemByPartition(...args);
  }

  async operatorClearingTransferByPartition(...args: Parameters<ClearingOperations["operatorClearingTransferByPartition"]>): Promise<TransactionResponse> {
    return this.clearingOps.operatorClearingTransferByPartition(...args);
  }

  // ===== Compliance Operations =====

  async grantKyc(...args: Parameters<ComplianceOperations["grantKyc"]>): Promise<TransactionResponse> {
    return this.complianceOps.grantKyc(...args);
  }

  async revokeKyc(...args: Parameters<ComplianceOperations["revokeKyc"]>): Promise<TransactionResponse> {
    return this.complianceOps.revokeKyc(...args);
  }

  async addIssuer(...args: Parameters<ComplianceOperations["addIssuer"]>): Promise<TransactionResponse> {
    return this.complianceOps.addIssuer(...args);
  }

  async removeIssuer(...args: Parameters<ComplianceOperations["removeIssuer"]>): Promise<TransactionResponse> {
    return this.complianceOps.removeIssuer(...args);
  }

  async setRevocationRegistryAddress(...args: Parameters<ComplianceOperations["setRevocationRegistryAddress"]>): Promise<TransactionResponse> {
    return this.complianceOps.setRevocationRegistryAddress(...args);
  }

  async activateInternalKyc(...args: Parameters<ComplianceOperations["activateInternalKyc"]>): Promise<TransactionResponse> {
    return this.complianceOps.activateInternalKyc(...args);
  }

  async deactivateInternalKyc(...args: Parameters<ComplianceOperations["deactivateInternalKyc"]>): Promise<TransactionResponse> {
    return this.complianceOps.deactivateInternalKyc(...args);
  }

  async setOnchainID(...args: Parameters<ComplianceOperations["setOnchainID"]>): Promise<TransactionResponse> {
    return this.complianceOps.setOnchainID(...args);
  }

  async setIdentityRegistry(...args: Parameters<ComplianceOperations["setIdentityRegistry"]>): Promise<TransactionResponse> {
    return this.complianceOps.setIdentityRegistry(...args);
  }

  async setCompliance(...args: Parameters<ComplianceOperations["setCompliance"]>): Promise<TransactionResponse> {
    return this.complianceOps.setCompliance(...args);
  }

  async updateExternalKycLists(...args: Parameters<ComplianceOperations["updateExternalKycLists"]>): Promise<TransactionResponse> {
    return this.complianceOps.updateExternalKycLists(...args);
  }

  async addExternalKycList(...args: Parameters<ComplianceOperations["addExternalKycList"]>): Promise<TransactionResponse> {
    return this.complianceOps.addExternalKycList(...args);
  }

  async removeExternalKycList(...args: Parameters<ComplianceOperations["removeExternalKycList"]>): Promise<TransactionResponse> {
    return this.complianceOps.removeExternalKycList(...args);
  }

  async grantKycMock(...args: Parameters<ComplianceOperations["grantKycMock"]>): Promise<TransactionResponse> {
    return this.complianceOps.grantKycMock(...args);
  }

  async revokeKycMock(...args: Parameters<ComplianceOperations["revokeKycMock"]>): Promise<TransactionResponse> {
    return this.complianceOps.revokeKycMock(...args);
  }

  async createExternalKycListMock(): Promise<TransactionResponse> {
    return this.complianceOps.createExternalKycListMock();
  }

  // ===== Control List Operations =====

  async addToControlList(...args: Parameters<ControlListOperations["addToControlList"]>): Promise<TransactionResponse> {
    return this.controlListOps.addToControlList(...args);
  }

  async removeFromControlList(...args: Parameters<ControlListOperations["removeFromControlList"]>): Promise<TransactionResponse> {
    return this.controlListOps.removeFromControlList(...args);
  }

  async updateExternalControlLists(...args: Parameters<ControlListOperations["updateExternalControlLists"]>): Promise<TransactionResponse> {
    return this.controlListOps.updateExternalControlLists(...args);
  }

  async addExternalControlList(...args: Parameters<ControlListOperations["addExternalControlList"]>): Promise<TransactionResponse> {
    return this.controlListOps.addExternalControlList(...args);
  }

  async removeExternalControlList(...args: Parameters<ControlListOperations["removeExternalControlList"]>): Promise<TransactionResponse> {
    return this.controlListOps.removeExternalControlList(...args);
  }

  async addToBlackListMock(...args: Parameters<ControlListOperations["addToBlackListMock"]>): Promise<TransactionResponse> {
    return this.controlListOps.addToBlackListMock(...args);
  }

  async addToWhiteListMock(...args: Parameters<ControlListOperations["addToWhiteListMock"]>): Promise<TransactionResponse> {
    return this.controlListOps.addToWhiteListMock(...args);
  }

  async removeFromBlackListMock(...args: Parameters<ControlListOperations["removeFromBlackListMock"]>): Promise<TransactionResponse> {
    return this.controlListOps.removeFromBlackListMock(...args);
  }

  async removeFromWhiteListMock(...args: Parameters<ControlListOperations["removeFromWhiteListMock"]>): Promise<TransactionResponse> {
    return this.controlListOps.removeFromWhiteListMock(...args);
  }

  async createExternalBlackListMock(): Promise<TransactionResponse> {
    return this.controlListOps.createExternalBlackListMock();
  }

  async createExternalWhiteListMock(): Promise<TransactionResponse> {
    return this.controlListOps.createExternalWhiteListMock();
  }

  // ===== Pause Operations =====

  async pause(...args: Parameters<PauseOperations["pause"]>): Promise<TransactionResponse> {
    return this.pauseOps.pause(...args);
  }

  async unpause(...args: Parameters<PauseOperations["unpause"]>): Promise<TransactionResponse> {
    return this.pauseOps.unpause(...args);
  }

  async updateExternalPauses(...args: Parameters<PauseOperations["updateExternalPauses"]>): Promise<TransactionResponse> {
    return this.pauseOps.updateExternalPauses(...args);
  }

  async addExternalPause(...args: Parameters<PauseOperations["addExternalPause"]>): Promise<TransactionResponse> {
    return this.pauseOps.addExternalPause(...args);
  }

  async removeExternalPause(...args: Parameters<PauseOperations["removeExternalPause"]>): Promise<TransactionResponse> {
    return this.pauseOps.removeExternalPause(...args);
  }

  async setPausedMock(...args: Parameters<PauseOperations["setPausedMock"]>): Promise<TransactionResponse> {
    return this.pauseOps.setPausedMock(...args);
  }

  async createExternalPauseMock(): Promise<TransactionResponse> {
    return this.pauseOps.createExternalPauseMock();
  }

  // ===== Lock Operations =====

  async lock(...args: Parameters<LockOperations["lock"]>): Promise<TransactionResponse> {
    return this.lockOps.lock(...args);
  }

  async release(...args: Parameters<LockOperations["release"]>): Promise<TransactionResponse> {
    return this.lockOps.release(...args);
  }

  // ===== Security Operations =====

  async setCoupon(...args: Parameters<SecurityOperations["setCoupon"]>): Promise<TransactionResponse> {
    return this.securityOps.setCoupon(...args);
  }

  setRate(...args: Parameters<SecurityOperations["setRate"]>): Promise<TransactionResponse> {
    return this.securityOps.setRate(...args);
  }

  setInterestRate(...args: Parameters<SecurityOperations["setInterestRate"]>): Promise<TransactionResponse> {
    return this.securityOps.setInterestRate(...args);
  }

  setImpactData(...args: Parameters<SecurityOperations["setImpactData"]>): Promise<TransactionResponse> {
    return this.securityOps.setImpactData(...args);
  }

  addKpiData(...args: Parameters<SecurityOperations["addKpiData"]>): Promise<TransactionResponse> {
    return this.securityOps.addKpiData(...args);
  }

  async updateMaturityDate(...args: Parameters<SecurityOperations["updateMaturityDate"]>): Promise<TransactionResponse> {
    return this.securityOps.updateMaturityDate(...args);
  }

  addProceedRecipient(...args: Parameters<SecurityOperations["addProceedRecipient"]>): Promise<TransactionResponse> {
    return this.securityOps.addProceedRecipient(...args);
  }

  removeProceedRecipient(...args: Parameters<SecurityOperations["removeProceedRecipient"]>): Promise<TransactionResponse> {
    return this.securityOps.removeProceedRecipient(...args);
  }

  updateProceedRecipientData(...args: Parameters<SecurityOperations["updateProceedRecipientData"]>): Promise<TransactionResponse> {
    return this.securityOps.updateProceedRecipientData(...args);
  }

  async setDividends(...args: Parameters<SecurityOperations["setDividends"]>): Promise<TransactionResponse> {
    return this.securityOps.setDividends(...args);
  }

  async setVotingRights(...args: Parameters<SecurityOperations["setVotingRights"]>): Promise<TransactionResponse> {
    return this.securityOps.setVotingRights(...args);
  }

  async setScheduledBalanceAdjustment(...args: Parameters<SecurityOperations["setScheduledBalanceAdjustment"]>): Promise<TransactionResponse> {
    return this.securityOps.setScheduledBalanceAdjustment(...args);
  }

  async takeSnapshot(...args: Parameters<SecurityOperations["takeSnapshot"]>): Promise<TransactionResponse> {
    return this.securityOps.takeSnapshot(...args);
  }

  async triggerPendingScheduledSnapshots(...args: Parameters<SecurityOperations["triggerPendingScheduledSnapshots"]>): Promise<TransactionResponse> {
    return this.securityOps.triggerPendingScheduledSnapshots(...args);
  }

  async triggerScheduledSnapshots(...args: Parameters<SecurityOperations["triggerScheduledSnapshots"]>): Promise<TransactionResponse> {
    return this.securityOps.triggerScheduledSnapshots(...args);
  }

  // ===== Security Metadata Operations =====

  async setName(...args: Parameters<SecurityMetadataOperations["setName"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.setName(...args);
  }

  async setSymbol(...args: Parameters<SecurityMetadataOperations["setSymbol"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.setSymbol(...args);
  }

  async setDocument(...args: Parameters<SecurityMetadataOperations["setDocument"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.setDocument(...args);
  }

  async removeDocument(...args: Parameters<SecurityMetadataOperations["removeDocument"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.removeDocument(...args);
  }

  async updateConfigVersion(...args: Parameters<SecurityMetadataOperations["updateConfigVersion"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.updateConfigVersion(...args);
  }

  async updateConfig(...args: Parameters<SecurityMetadataOperations["updateConfig"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.updateConfig(...args);
  }

  async updateResolver(...args: Parameters<SecurityMetadataOperations["updateResolver"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.updateResolver(...args);
  }

  async protectPartitions(...args: Parameters<SecurityMetadataOperations["protectPartitions"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.protectPartitions(...args);
  }

  async unprotectPartitions(...args: Parameters<SecurityMetadataOperations["unprotectPartitions"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.unprotectPartitions(...args);
  }

  async protectedRedeemFromByPartition(...args: Parameters<SecurityMetadataOperations["protectedRedeemFromByPartition"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.protectedRedeemFromByPartition(...args);
  }

  async protectedTransferFromByPartition(...args: Parameters<SecurityMetadataOperations["protectedTransferFromByPartition"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.protectedTransferFromByPartition(...args);
  }

  async freezePartialTokens(...args: Parameters<SecurityMetadataOperations["freezePartialTokens"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.freezePartialTokens(...args);
  }

  async unfreezePartialTokens(...args: Parameters<SecurityMetadataOperations["unfreezePartialTokens"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.unfreezePartialTokens(...args);
  }

  async setAddressFrozen(...args: Parameters<SecurityMetadataOperations["setAddressFrozen"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.setAddressFrozen(...args);
  }

  async batchSetAddressFrozen(...args: Parameters<SecurityMetadataOperations["batchSetAddressFrozen"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.batchSetAddressFrozen(...args);
  }

  async batchFreezePartialTokens(...args: Parameters<SecurityMetadataOperations["batchFreezePartialTokens"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.batchFreezePartialTokens(...args);
  }

  async batchUnfreezePartialTokens(...args: Parameters<SecurityMetadataOperations["batchUnfreezePartialTokens"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.batchUnfreezePartialTokens(...args);
  }

  async recoveryAddress(...args: Parameters<SecurityMetadataOperations["recoveryAddress"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.recoveryAddress(...args);
  }

  async addAgent(...args: Parameters<SecurityMetadataOperations["addAgent"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.addAgent(...args);
  }

  async removeAgent(...args: Parameters<SecurityMetadataOperations["removeAgent"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.removeAgent(...args);
  }

  async setMaxSupply(...args: Parameters<SecurityMetadataOperations["setMaxSupply"]>): Promise<TransactionResponse> {
    return this.securityMetadataOps.setMaxSupply(...args);
  }
}
