// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import AWSKMSSettings from '@core/settings/custodialWalletSettings/AWSKMSSettings';
import DfnsSettings from '@core/settings/custodialWalletSettings/DfnsSettings';
import FireblocksSettings from '@core/settings/custodialWalletSettings/FireblocksSettings';
import HWCSettings from '@core/settings/walletConnect/HWCSettings';
import Account from '@domain/context/account/Account';
import { BondDetails } from '@domain/context/bond/BondDetails';
import { BondFixedRateDetails } from '@domain/context/bond/BondFixedRateDetails';
import { BondKpiLinkedRateDetails } from '@domain/context/bond/BondKpiLinkedRateDetails';
import { RateStatus } from '@domain/context/bond/RateStatus';
import EvmAddress from '@domain/context/contract/EvmAddress';
import { EquityDetails } from '@domain/context/equity/EquityDetails';
import { Environment } from '@domain/context/network/Environment';
import { ClearingOperationType } from '@domain/context/security/Clearing';
import { Security } from '@domain/context/security/Security';
import BigDecimal from '@domain/context/shared/BigDecimal';
import TransactionResponse from '@domain/context/transaction/TransactionResponse';
import { ContractId } from '@hiero-ledger/sdk';
import LogService from '@service/log/LogService';

export interface InitializationData {
  account?: Account;
  pairing?: string;
  topic?: string;
}

export interface NetworkData {
  name?: Environment;
  recognized?: boolean;
  factoryId?: string;
  resolverId?: string;
  businessLogicKeysCommon?: string[];
  businessLogicKeysEquity?: string[];
  businessLogicKeysBond?: string[];
}

export interface WalletAdapter {
  init(): Promise<Environment>;
  register(
    input?: Account | HWCSettings | DfnsSettings | FireblocksSettings | AWSKMSSettings,
  ): Promise<InitializationData>;
  stop(): Promise<boolean>;
  getAccount(): Account;
}

interface ITransactionAdapter {
  setImpactData(
    security: EvmAddress,
    maxDeviationCap: BigDecimal,
    baseLine: BigDecimal,
    maxDeviationFloor: BigDecimal,
    impactDataDecimals: number,
    adjustmentPrecision: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;

  createEquity(
    security: Security,
    equityDetails: EquityDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    configId: string,
    configVersion: number,
    compliance: EvmAddress,
    identityRegistryAddress: EvmAddress,
    externalPauses?: EvmAddress[],
    externalControlLists?: EvmAddress[],
    externalKycLists?: EvmAddress[],
    diamondOwnerAccount?: EvmAddress,
    factoryId?: ContractId | string,
  ): Promise<TransactionResponse>;
  
  createBond(
    security: Security,
    bondDetails: BondDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    configId: string,
    configVersion: number,
    compliance: EvmAddress,
    identityRegistryAddress: EvmAddress,
    externalPauses?: EvmAddress[],
    externalControlLists?: EvmAddress[],
    externalKycLists?: EvmAddress[],
    diamondOwnerAccount?: EvmAddress,
    proceedRecipients?: EvmAddress[],
    proceedRecipientsData?: string[],
    factoryId?: ContractId | string,
  ): Promise<TransactionResponse>;

createBondFixedRate(
    security: Security,
    bondFixedRateDetails: BondFixedRateDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    configId: string,
    configVersion: number,
    compliance: EvmAddress,
    identityRegistryAddress: EvmAddress,
    externalPauses?: EvmAddress[],
    externalControlLists?: EvmAddress[],
    externalKycLists?: EvmAddress[],
    diamondOwnerAccount?: EvmAddress,
    proceedRecipients?: EvmAddress[],
    proceedRecipientsData?: string[],
    factoryId?: ContractId | string,
  ): Promise<TransactionResponse>;

  createBondKpiLinkedRate(
    security: Security,
    bondKpiLinkedRateDetails: BondKpiLinkedRateDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    configId: string,
    configVersion: number,
    compliance: EvmAddress,
    identityRegistryAddress: EvmAddress,
    externalPauses?: EvmAddress[],
    externalControlLists?: EvmAddress[],
    externalKycLists?: EvmAddress[],
    diamondOwnerAccount?: EvmAddress,
    proceedRecipients?: EvmAddress[],
    proceedRecipientsData?: string[],
    factoryId?: ContractId | string,
  ): Promise<TransactionResponse>;

  addKpiData(
    security: EvmAddress,
    date: number,
    value: string,
    project: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;

  controllerTransfer(
    security: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  forcedTransfer(
    security: EvmAddress,
    source: EvmAddress,
    target: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  controllerRedeem(
    security: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  issue(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  mint(
    security: EvmAddress,
    target: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  transfer(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  transferAndLock(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  redeem(security: EvmAddress, amount: BigDecimal, securityId?: ContractId | string): Promise<TransactionResponse>;
  burn(
    source: EvmAddress,
    security: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  addToControlList(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  removeFromControlList(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  pause(security: EvmAddress, securityId?: ContractId | string): Promise<TransactionResponse>;
  unpause(security: EvmAddress, securityId?: ContractId | string): Promise<TransactionResponse>;
  takeSnapshot(security: EvmAddress, securityId?: ContractId | string): Promise<TransactionResponse>;
  setDividends(
    security: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  setVotingRights(
    security: EvmAddress,
    recordDate: BigDecimal,
    data: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  setCoupon(
    security: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    rate: BigDecimal,
    startDate: BigDecimal,
    endDate: BigDecimal,
    fixingDate: BigDecimal,
    rateStatus: RateStatus,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  setDocument(
    security: EvmAddress,
    name: string,
    uri: string,
    hash: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  removeDocument(security: EvmAddress, name: string, securityId?: ContractId | string): Promise<TransactionResponse>;
  authorizeOperator(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  revokeOperator(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  authorizeOperatorByPartition(
    security: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  revokeOperatorByPartition(
    security: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  operatorTransferByPartition(
    security: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    partitionId: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  triggerPendingScheduledSnapshots(
    security: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  triggerScheduledSnapshots(
    security: EvmAddress,
    max: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  setMaxSupply(
    security: EvmAddress,
    maxSupply: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  lock(
    security: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  release(
    security: EvmAddress,
    sourceId: EvmAddress,
    lockId: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;

  updateMaturityDate(
    security: EvmAddress,
    maturityDate: number,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  setScheduledBalanceAdjustment(
    security: EvmAddress,
    executionDate: BigDecimal,
    factor: BigDecimal,
    decimals: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  protectedTransferFromByPartition(
    security: EvmAddress,
    partitionId: string,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    deadline: BigDecimal,
    nounce: BigDecimal,
    signature: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  protectedRedeemFromByPartition(
    security: EvmAddress,
    partitionId: string,
    sourceId: EvmAddress,
    amount: BigDecimal,
    deadline: BigDecimal,
    nounce: BigDecimal,
    signature: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  protectPartitions(security: EvmAddress, securityId?: ContractId | string): Promise<TransactionResponse>;
  unprotectPartitions(security: EvmAddress, securityId?: ContractId | string): Promise<TransactionResponse>;
  redeemAtMaturityByPartition(
    security: EvmAddress,
    partitionId: string,
    sourceId: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  fullRedeemAtMaturity(
    security: EvmAddress,
    sourceId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
}

interface RoleTransactionAdapter {
  grantRole(
    security: EvmAddress,
    targetId: EvmAddress,
    role: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  applyRoles(
    security: EvmAddress,
    targetId: EvmAddress,
    roles: string[],
    actives: boolean[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  revokeRole(
    security: EvmAddress,
    targetId: EvmAddress,
    role: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  renounceRole(security: EvmAddress, role: string, securityId?: ContractId | string): Promise<TransactionResponse>;
}

interface IManagementTransactionAdapter {
  updateConfigVersion(
    security: EvmAddress,
    configVersion: number,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  updateResolver(
    security: EvmAddress,
    resolver: EvmAddress,
    configVersion: number,
    configId: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse>;
}

interface IHoldTransactionAdapter {
  createHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  createHoldFromByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  controllerCreateHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  protectedCreateHoldByPartition(
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
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  releaseHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    holdId: number,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  reclaimHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    holdId: number,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  executeHoldByPartition(
    security: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    partitionId: string,
    holdId: number,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
}

interface ISsiManagementTransactionAdapter {
  setRevocationRegistryAddress(
    security: EvmAddress,
    revocationRegistry: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  addIssuer(security: EvmAddress, issuer: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse>;
  removeIssuer(security: EvmAddress, issuer: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse>;
}

interface IKycTransactionAdapter {
  grantKyc(
    security: EvmAddress,
    targetId: EvmAddress,
    vcId: string,
    validFrom: BigDecimal,
    validTo: BigDecimal,
    issuer: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  revokeKyc(security: EvmAddress, targetId: EvmAddress, securityId?: ContractId | string): Promise<TransactionResponse>;
  activateInternalKyc(security: EvmAddress, securityId?: ContractId | string): Promise<TransactionResponse>;
  deactivateInternalKyc(security: EvmAddress, securityId?: ContractId | string): Promise<TransactionResponse>;
}

interface IClearingAdapter {
  activateClearing(security: EvmAddress, securityId?: ContractId | string): Promise<TransactionResponse>;
  deactivateClearing(security: EvmAddress, securityId?: ContractId | string): Promise<TransactionResponse>;
  clearingTransferByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  clearingTransferFromByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  protectedClearingTransferByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    deadline: BigDecimal,
    nonce: BigDecimal,
    signature: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  approveClearingOperationByPartition(
    security: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
    clearingId: number,
    clearingOperationType: ClearingOperationType,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  cancelClearingOperationByPartition(
    security: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
    clearingId: number,
    clearingOperationType: ClearingOperationType,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  reclaimClearingOperationByPartition(
    security: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
    clearingId: number,
    clearingOperationType: ClearingOperationType,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  clearingRedeemByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  clearingRedeemFromByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  protectedClearingRedeemByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    expirationDate: BigDecimal,
    deadline: BigDecimal,
    nonce: BigDecimal,
    signature: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  clearingCreateHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    targetId: EvmAddress,
    clearingExpirationDate: BigDecimal,
    holdExpirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  clearingCreateHoldFromByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    clearingExpirationDate: BigDecimal,
    holdExpirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  protectedClearingCreateHoldByPartition(
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
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  operatorClearingCreateHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    clearingExpirationDate: BigDecimal,
    holdExpirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  operatorClearingRedeemByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  operatorClearingTransferByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
}

interface IExternalPausesAdapter {
  updateExternalPauses(
    security: EvmAddress,
    externalPausesAddresses: EvmAddress[],
    actives: boolean[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  addExternalPause(
    security: EvmAddress,
    externalPauseAddress: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  removeExternalPause(
    security: EvmAddress,
    externalPauseAddress: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
}

interface IExternalPausesMockAdapter {
  setPausedMock(contract: EvmAddress, paused: boolean, contractId?: ContractId | string): Promise<TransactionResponse>;
  createExternalPauseMock(): Promise<string | TransactionResponse>;
}

interface IExternalControlListsAdapter {
  updateExternalControlLists(
    security: EvmAddress,
    externalControlListsAddresses: EvmAddress[],
    actives: boolean[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  addExternalControlList(
    security: EvmAddress,
    externalControlListAddress: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  removeExternalControlList(
    security: EvmAddress,
    externalControlListAddress: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
}

interface IExternalControlListsMockAdapter {
  addToBlackListMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId?: ContractId | string,
  ): Promise<TransactionResponse>;
  addToWhiteListMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId?: ContractId | string,
  ): Promise<TransactionResponse>;
  removeFromWhiteListMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId?: ContractId | string,
  ): Promise<TransactionResponse>;
  removeFromBlackListMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId?: ContractId | string,
  ): Promise<TransactionResponse>;
  createExternalBlackListMock(): Promise<string | TransactionResponse>;
  createExternalWhiteListMock(): Promise<string | TransactionResponse>;
}

interface IExternalKycListsAdapter {
  updateExternalKycLists(
    security: EvmAddress,
    externalKycListsAddresses: EvmAddress[],
    actives: boolean[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  addExternalKycList(
    security: EvmAddress,
    externalKycListAddress: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  removeExternalKycList(
    security: EvmAddress,
    externalKycListAddress: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  createExternalKycListMock(): Promise<string | TransactionResponse>;
}

interface IExternalKycListsMockAdapter {
  grantKycMock(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  revokeKycMock(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
}

interface ITokenMetadataTransactionAdapter {
  setName(security: EvmAddress, name: string, securityId?: ContractId | string): Promise<TransactionResponse>;
  setSymbol(security: EvmAddress, symbol: string, securityId: ContractId | string): Promise<TransactionResponse>;
  setOnchainID(
    security: EvmAddress,
    onchainID: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
}

interface IComplianceTransactionAdapter {
  setCompliance(
    security: EvmAddress,
    compliance: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
}

interface IIdentityRegistryTransactionAdapter {
  setIdentityRegistry(
    security: EvmAddress,
    identityRegistry: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
}
interface IFreezeAdapter {
  setAddressFrozen(
    security: EvmAddress,
    status: boolean,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  freezePartialTokens(
    security: EvmAddress,
    amount: BigDecimal,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  unfreezePartialTokens(
    security: EvmAddress,
    amount: BigDecimal,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
}
interface IBatchAdapter {
  batchTransfer(
    security: EvmAddress,
    amountList: BigDecimal[],
    toList: EvmAddress[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  batchForcedTransfer(
    security: EvmAddress,
    amountList: BigDecimal[],
    fromList: EvmAddress[],
    toList: EvmAddress[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  batchMint(
    security: EvmAddress,
    amountList: BigDecimal[],
    toList: EvmAddress[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  batchBurn(
    security: EvmAddress,
    amountList: BigDecimal[],
    targetList: EvmAddress[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  batchSetAddressFrozen(
    security: EvmAddress,
    freezeList: boolean[],
    targetList: EvmAddress[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  batchFreezePartialTokens(
    security: EvmAddress,
    amountList: BigDecimal[],
    targetList: EvmAddress[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  batchUnfreezePartialTokens(
    security: EvmAddress,
    amountList: BigDecimal[],
    targetList: EvmAddress[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
}

interface IRecoveryAddress {
  recoveryAddress(
    security: EvmAddress,
    lostWallet: EvmAddress,
    newWallet: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
}

interface IAgent {
  addAgent(security: EvmAddress, agentId: EvmAddress, securityId?: ContractId | string): Promise<TransactionResponse>;
  removeAgent(
    security: EvmAddress,
    agentId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
}

interface IProceedRecipients {
  addProceedRecipient(
    security: EvmAddress,
    proceedRecipient: EvmAddress,
    data: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  removeProceedRecipient(
    security: EvmAddress,
    proceedRecipient: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  updateProceedRecipientData(
    security: EvmAddress,
    proceedRecipient: EvmAddress,
    data: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
}

interface IFixedRate {
  setRate(
    security: EvmAddress,
    rate: BigDecimal,
    rateDecimals: number,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
}

export default abstract class TransactionAdapter
  implements
    WalletAdapter,
    ITransactionAdapter,
    RoleTransactionAdapter,
    IManagementTransactionAdapter,
    IHoldTransactionAdapter,
    ISsiManagementTransactionAdapter,
    IKycTransactionAdapter,
    IClearingAdapter,
    IExternalPausesAdapter,
    IExternalPausesMockAdapter,
    IExternalControlListsAdapter,
    IExternalControlListsMockAdapter,
    IExternalKycListsAdapter,
    IExternalKycListsMockAdapter,
    ITokenMetadataTransactionAdapter,
    IRecoveryAddress,
    IComplianceTransactionAdapter,
    IIdentityRegistryTransactionAdapter,
    IFreezeAdapter,
    IBatchAdapter,
    IAgent,
    IProceedRecipients,
    IFixedRate
{
  abstract setImpactData(
    security: EvmAddress,
    maxDeviationCap: BigDecimal,
    baseLine: BigDecimal,
    maxDeviationFloor: BigDecimal,
    impactDataDecimals: number,
    adjustmentPrecision: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;

  abstract triggerPendingScheduledSnapshots(
    security: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;

  abstract addKpiData(
    security: EvmAddress,
    date: number,
    value: string,
    project: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;

  abstract triggerScheduledSnapshots(
    security: EvmAddress,
    max: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract authorizeOperator(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract revokeOperator(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract authorizeOperatorByPartition(
    security: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract revokeOperatorByPartition(
    security: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract operatorTransferByPartition(
    security: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    partitionId: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract createEquity(
    security: Security,
    equityDetails: EquityDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    configId: string,
    configVersion: number,
    compliance: EvmAddress,
    identityRegistryAddress: EvmAddress,
    externalPauses?: EvmAddress[],
    externalControlLists?: EvmAddress[],
    externalKycLists?: EvmAddress[],
    diamondOwnerAccount?: EvmAddress,
    factoryId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract createBond(
    security: Security,
    bondDetails: BondDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    configId: string,
    configVersion: number,
    compliance: EvmAddress,
    identityRegistryAddress: EvmAddress,
    externalPauses?: EvmAddress[],
    externalControlLists?: EvmAddress[],
    externalKycLists?: EvmAddress[],
    diamondOwnerAccount?: EvmAddress,
    proceedRecipients?: EvmAddress[],
    proceedRecipientsData?: string[],
    factoryId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract createBondFixedRate(
    security: Security,
    bondFixedRateDetails: BondFixedRateDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    configId: string,
    configVersion: number,
    compliance: EvmAddress,
    identityRegistryAddress: EvmAddress,
    externalPauses?: EvmAddress[],
    externalControlLists?: EvmAddress[],
    externalKycLists?: EvmAddress[],
    diamondOwnerAccount?: EvmAddress,
    proceedRecipients?: EvmAddress[],
    proceedRecipientsData?: string[],
    factoryId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract createBondKpiLinkedRate(
    security: Security,
    bondKpiLinkedRateDetails: BondKpiLinkedRateDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    configId: string,
    configVersion: number,
    compliance: EvmAddress,
    identityRegistryAddress: EvmAddress,
    externalPauses?: EvmAddress[],
    externalControlLists?: EvmAddress[],
    externalKycLists?: EvmAddress[],
    diamondOwnerAccount?: EvmAddress,
    proceedRecipients?: EvmAddress[],
    proceedRecipientsData?: string[],
    factoryId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract grantRole(
    security: EvmAddress,
    targetId: EvmAddress,
    role: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract applyRoles(
    security: EvmAddress,
    targetId: EvmAddress,
    roles: string[],
    actives: boolean[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract revokeRole(
    security: EvmAddress,
    targetId: EvmAddress,
    role: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract renounceRole(
    security: EvmAddress,
    role: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract init(): Promise<string>;
  abstract register(
    input?: Account | HWCSettings | DfnsSettings | FireblocksSettings | AWSKMSSettings,
    debug?: boolean,
  ): Promise<InitializationData>;
  abstract stop(): Promise<boolean>;
  abstract controllerTransfer(
    security: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract forcedTransfer(
    security: EvmAddress,
    source: EvmAddress,
    target: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract controllerRedeem(
    security: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract burn(
    security: EvmAddress,
    source: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract issue(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract mint(
    security: EvmAddress,
    target: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract transfer(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract transferAndLock(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract redeem(
    security: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract addToControlList(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract removeFromControlList(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract pause(security: EvmAddress, securityId?: ContractId | string): Promise<TransactionResponse<any, Error>>;
  abstract unpause(security: EvmAddress, securityId?: ContractId | string): Promise<TransactionResponse<any, Error>>;
  abstract takeSnapshot(
    security: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract getAccount(): Account;
  abstract setDividends(
    security: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract setCoupon(
    security: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    rate: BigDecimal,
    startDate: BigDecimal,
    endDate: BigDecimal,
    fixingDate: BigDecimal,
    rateStatus: RateStatus,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract setVotingRights(
    security: EvmAddress,
    recordDate: BigDecimal,
    data: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;

  abstract setDocument(
    security: EvmAddress,
    name: string,
    uri: string,
    hash: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract removeDocument(
    security: EvmAddress,
    name: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract setMaxSupply(
    security: EvmAddress,
    maxSupply: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract lock(
    security: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract release(
    security: EvmAddress,
    sourceId: EvmAddress,
    lockId: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  logTransaction(id: string, network: string): void {
    const HASHSCAN_URL = `https://hashscan.io/${network}/transactionsById/`;
    const HASHSCAN_TX_URL = `https://hashscan.io/${network}/tx/`;
    const msg = `\nYou can see your transaction at ${id.startsWith("0x") ? HASHSCAN_TX_URL : HASHSCAN_URL}${id}\n`;
    LogService.logInfo(msg);
    console.log(msg);
  }
  abstract updateConfigVersion(
    security: EvmAddress,
    configVersion: number,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract updateConfig(
    security: EvmAddress,
    configId: string,
    configVersion: number,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract updateResolver(
    security: EvmAddress,
    resolver: EvmAddress,
    configVersion: number,
    configId: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract protectedTransferFromByPartition(
    security: EvmAddress,
    partitionId: string,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    deadline: BigDecimal,
    nounce: BigDecimal,
    signature: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract protectedRedeemFromByPartition(
    security: EvmAddress,
    partitionId: string,
    sourceId: EvmAddress,
    amount: BigDecimal,
    deadline: BigDecimal,
    nounce: BigDecimal,
    signature: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract protectPartitions(
    security: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract unprotectPartitions(
    security: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract updateMaturityDate(
    security: EvmAddress,
    maturityDate: number,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract setScheduledBalanceAdjustment(
    security: EvmAddress,
    executionDate: BigDecimal,
    factor: BigDecimal,
    decimals: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract createHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract createHoldFromByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract controllerCreateHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract protectedCreateHoldByPartition(
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
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract releaseHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    holdId: number,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract reclaimHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    holdId: number,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract executeHoldByPartition(
    security: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    partitionId: string,
    holdId: number,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract addIssuer(
    security: EvmAddress,
    issuer: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract setRevocationRegistryAddress(
    security: EvmAddress,
    revocationRegistry: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract removeIssuer(
    security: EvmAddress,
    issuer: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract grantKyc(
    security: EvmAddress,
    targetId: EvmAddress,
    vcId: string,
    validFrom: BigDecimal,
    validTo: BigDecimal,
    issuer: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract revokeKyc(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract activateClearing(security: EvmAddress, securityId?: ContractId | string): Promise<TransactionResponse>;
  abstract deactivateClearing(security: EvmAddress, securityId?: ContractId | string): Promise<TransactionResponse>;
  abstract clearingTransferByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract clearingTransferFromByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract protectedClearingTransferByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    deadline: BigDecimal,
    nonce: BigDecimal,
    signature: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract approveClearingOperationByPartition(
    security: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
    clearingId: number,
    clearingOperationType: ClearingOperationType,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract cancelClearingOperationByPartition(
    security: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
    clearingId: number,
    clearingOperationType: ClearingOperationType,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract reclaimClearingOperationByPartition(
    security: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
    clearingId: number,
    clearingOperationType: ClearingOperationType,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract clearingRedeemByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract clearingRedeemFromByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract protectedClearingRedeemByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    expirationDate: BigDecimal,
    deadline: BigDecimal,
    nonce: BigDecimal,
    signature: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract clearingCreateHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    targetId: EvmAddress,
    clearingExpirationDate: BigDecimal,
    holdExpirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract clearingCreateHoldFromByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    clearingExpirationDate: BigDecimal,
    holdExpirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract protectedClearingCreateHoldByPartition(
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
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  abstract operatorClearingCreateHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    clearingExpirationDate: BigDecimal,
    holdExpirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract operatorClearingRedeemByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract operatorClearingTransferByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract updateExternalPauses(
    security: EvmAddress,
    externalPausesAddresses: EvmAddress[],
    actives: boolean[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract addExternalPause(
    security: EvmAddress,
    externalPauseAddress: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract removeExternalPause(
    security: EvmAddress,
    externalPauseAddress: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract setPausedMock(
    contract: EvmAddress,
    paused: boolean,
    contractId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract createExternalPauseMock(): Promise<string | TransactionResponse>;
  abstract updateExternalControlLists(
    security: EvmAddress,
    externalControlListsAddresses: EvmAddress[],
    actives: boolean[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract addExternalControlList(
    security: EvmAddress,
    externalControlListAddress: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract removeExternalControlList(
    security: EvmAddress,
    externalControlListAddress: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract addToBlackListMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract addToWhiteListMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract removeFromWhiteListMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract removeFromBlackListMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract createExternalBlackListMock(): Promise<string | TransactionResponse>;
  abstract createExternalWhiteListMock(): Promise<string | TransactionResponse>;
  abstract updateExternalKycLists(
    security: EvmAddress,
    externalKycListsAddresses: EvmAddress[],
    actives: boolean[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract addExternalKycList(
    security: EvmAddress,
    externalKycListAddress: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract removeExternalKycList(
    security: EvmAddress,
    externalKycListAddress: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract activateInternalKyc(security: EvmAddress, securityId?: ContractId | string): Promise<TransactionResponse>;
  abstract deactivateInternalKyc(security: EvmAddress, securityId?: ContractId | string): Promise<TransactionResponse>;
  abstract grantKycMock(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract revokeKycMock(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract createExternalKycListMock(): Promise<string | TransactionResponse>;
  abstract setName(security: EvmAddress, name: string, securityId?: ContractId | string): Promise<TransactionResponse>;
  abstract setSymbol(
    security: EvmAddress,
    symbol: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract setAddressFrozen(
    security: EvmAddress,
    status: boolean,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract freezePartialTokens(
    security: EvmAddress,
    amount: BigDecimal,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract unfreezePartialTokens(
    security: EvmAddress,
    amount: BigDecimal,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract setIdentityRegistry(
    security: EvmAddress,
    identityRegistry: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract setCompliance(
    security: EvmAddress,
    compliance: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract setOnchainID(
    security: EvmAddress,
    onchainID: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract batchTransfer(
    security: EvmAddress,
    amountList: BigDecimal[],
    toList: EvmAddress[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract batchForcedTransfer(
    security: EvmAddress,
    amountList: BigDecimal[],
    fromList: EvmAddress[],
    toList: EvmAddress[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract batchMint(
    security: EvmAddress,
    amountList: BigDecimal[],
    toList: EvmAddress[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract batchBurn(
    security: EvmAddress,
    amountList: BigDecimal[],
    targetList: EvmAddress[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract batchSetAddressFrozen(
    security: EvmAddress,
    freezeList: boolean[],
    targetList: EvmAddress[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract batchFreezePartialTokens(
    security: EvmAddress,
    amountList: BigDecimal[],
    targetList: EvmAddress[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract batchUnfreezePartialTokens(
    security: EvmAddress,
    amountList: BigDecimal[],
    targetList: EvmAddress[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract recoveryAddress(
    security: EvmAddress,
    lostWallet: EvmAddress,
    newWallet: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract addAgent(
    security: EvmAddress,
    agentId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract removeAgent(
    security: EvmAddress,
    agentId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract redeemAtMaturityByPartition(
    security: EvmAddress,
    partitionId: string,
    sourceId: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract fullRedeemAtMaturity(
    security: EvmAddress,
    sourceId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;

  abstract createTrexSuiteBond(
    salt: string,
    owner: string,
    irs: string,
    onchainId: string,
    irAgents: string[],
    tokenAgents: string[],
    compliancesModules: string[],
    complianceSettings: string[],
    claimTopics: number[],
    issuers: string[],
    issuerClaims: number[][],
    security: Security,
    bondDetails: BondDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    configId: string,
    configVersion: number,
    compliance: EvmAddress,
    identityRegistryAddress: EvmAddress,
    diamondOwnerAccount: EvmAddress,
    proceedRecipients?: EvmAddress[],
    proceedRecipientsData?: string[],
    externalPauses?: EvmAddress[],
    externalControlLists?: EvmAddress[],
    externalKycLists?: EvmAddress[],
    factoryId?: ContractId | string,
  ): Promise<TransactionResponse>;

  abstract createTrexSuiteEquity(
    salt: string,
    owner: string,
    irs: string,
    onchainId: string,
    irAgents: string[],
    tokenAgents: string[],
    compliancesModules: string[],
    complianceSettings: string[],
    claimTopics: number[],
    issuers: string[],
    issuerClaims: number[][],
    security: Security,
    equityDetails: EquityDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    configId: string,
    configVersion: number,
    compliance: EvmAddress,
    identityRegistryAddress: EvmAddress,
    diamondOwnerAccount: EvmAddress,
    externalPauses?: EvmAddress[],
    externalControlLists?: EvmAddress[],
    externalKycLists?: EvmAddress[],
    factoryId?: ContractId | string,
  ): Promise<TransactionResponse>;

  abstract addProceedRecipient(
    security: EvmAddress,
    proceedRecipient: EvmAddress,
    data: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract removeProceedRecipient(
    security: EvmAddress,
    proceedRecipient: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  abstract updateProceedRecipientData(
    security: EvmAddress,
    proceedRecipient: EvmAddress,
    data: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  
  abstract setRate(
    security: EvmAddress,
    rate: BigDecimal,
    rateDecimals: number,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;

  abstract setInterestRate(
    security: EvmAddress,
    maxRate: BigDecimal,
    baseRate: BigDecimal,
    minRate: BigDecimal,
    startPeriod: BigDecimal,
    startRate: BigDecimal,
    missedPenalty: BigDecimal,
    reportPeriod: BigDecimal,
    rateDecimals: number,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
}
