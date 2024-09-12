/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import TransactionResponse from '../../domain/context/transaction/TransactionResponse.js';
import BigDecimal from '../../domain/context/shared/BigDecimal.js';
import Account from '../../domain/context/account/Account.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import { MirrorNodeAdapter } from './mirror/MirrorNodeAdapter.js';
import { Environment } from '../../domain/context/network/Environment.js';
import LogService from '../../app/service/LogService.js';
import { SecurityRole } from '../../domain/context/security/SecurityRole.js';
import { Security } from '../../domain/context/security/Security.js';
import EvmAddress from '../../domain/context/contract/EvmAddress.js';
import { BondDetails } from '../../domain/context/bond/BondDetails.js';
import { CouponDetails } from '../../domain/context/bond/CouponDetails.js';
import { EquityDetails } from '../../domain/context/equity/EquityDetails.js';
import HWCSettings from '../../domain/context/walletConnect/HWCSettings';
import { ContractId } from '@hashgraph/sdk';

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

interface ITransactionAdapter {
  createEquity(
    security: Security,
    equityDetails: EquityDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    businessLogicKeys: string[],
    diamondOwnerAccount?: EvmAddress,
  ): Promise<TransactionResponse>;
  createBond(
    security: Security,
    bondDetails: BondDetails,
    couponDetails: CouponDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    businessLogicKeys: string[],
    diamondOwnerAccount?: EvmAddress,
  ): Promise<TransactionResponse>;
  init(): Promise<Environment>;
  register(input?: Account | HWCSettings): Promise<InitializationData>;
  stop(): Promise<boolean>;
  balanceOf(
    security: HederaId,
    targetId: HederaId,
  ): Promise<TransactionResponse<BigDecimal, Error>>;
  controllerTransfer(
    security: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
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
  redeem(
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
  pause(
    security: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  unpause(
    security: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  takeSnapshot(security: EvmAddress, securityId?: ContractId | string,): Promise<TransactionResponse>;
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
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>>;
  setDocument(
    security: EvmAddress,
    name: string,
    uri: string,
    hash: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  removeDocument(
    security: EvmAddress,
    name: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
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
  getAccount(): Account;
  getMirrorNodeAdapter(): MirrorNodeAdapter;
}

interface RoleTransactionAdapter {
  grantRole(
    security: EvmAddress,
    targetId: EvmAddress,
    role: SecurityRole,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  applyRoles(
    security: EvmAddress,
    targetId: EvmAddress,
    roles: SecurityRole[],
    actives: boolean[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  revokeRole(
    security: EvmAddress,
    targetId: EvmAddress,
    role: SecurityRole,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  renounceRole(
    security: EvmAddress,
    role: SecurityRole,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse>;
  hasRole(
    security: EvmAddress,
    targetId: EvmAddress,
    role: SecurityRole,
  ): Promise<TransactionResponse<boolean, Error>>;
  getRolesFor(
    security: EvmAddress,
    targetId: EvmAddress,
    start: number,
    end: number,
  ): Promise<TransactionResponse<string[], Error>>;
  getRoleMembers(
    security: EvmAddress,
    role: SecurityRole,
    start: number,
    end: number,
  ): Promise<TransactionResponse<string[], Error>>;
  getRoleCountFor(
    security: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse<number, Error>>;
  getRoleMemberCount(
    security: EvmAddress,
    role: SecurityRole,
  ): Promise<TransactionResponse<number, Error>>;
}

export default abstract class TransactionAdapter
  implements ITransactionAdapter, RoleTransactionAdapter
{
  triggerPendingScheduledSnapshots(
    security: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  triggerScheduledSnapshots(
    security: EvmAddress,
    max: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  authorizeOperator(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  revokeOperator(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  authorizeOperatorByPartition(
    security: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  revokeOperatorByPartition(
    security: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  operatorTransferByPartition(
    security: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    partitionId: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  getRolesFor(
    security: EvmAddress,
    targetId: EvmAddress,
    start: number,
    end: number,
  ): Promise<TransactionResponse<string[], Error>> {
    throw new Error('Method not implemented.');
  }
  getRoleMembers(
    security: EvmAddress,
    role: SecurityRole,
    start: number,
    end: number,
  ): Promise<TransactionResponse<string[], Error>> {
    throw new Error('Method not implemented.');
  }
  getRoleCountFor(
    security: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse<number, Error>> {
    throw new Error('Method not implemented.');
  }
  getRoleMemberCount(
    security: EvmAddress,
    role: SecurityRole,
  ): Promise<TransactionResponse<number, Error>> {
    throw new Error('Method not implemented.');
  }
  createEquity(
    security: Security,
    equityDetails: EquityDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    businessLogicKeys: string[],
    diamondOwnerAccount?: EvmAddress,
  ): Promise<TransactionResponse> {
    throw new Error('Method not implemented.');
  }
  createBond(
    security: Security,
    bondDetails: BondDetails,
    couponDetails: CouponDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    businessLogicKeys: string[],
    diamondOwnerAccount?: EvmAddress,
  ): Promise<TransactionResponse> {
    throw new Error('Method not implemented.');
  }
  grantRole(
    security: EvmAddress,
    targetId: EvmAddress,
    role: SecurityRole,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  applyRoles(
    security: EvmAddress,
    targetId: EvmAddress,
    roles: SecurityRole[],
    actives: boolean[],
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  revokeRole(
    security: EvmAddress,
    targetId: EvmAddress,
    role: SecurityRole,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  renounceRole(
    security: EvmAddress,
    role: SecurityRole,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  hasRole(
    security: EvmAddress,
    targetId: EvmAddress,
    role: SecurityRole,
  ): Promise<TransactionResponse<boolean, Error>> {
    throw new Error('Method not implemented.');
  }
  init(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  register(
    input?: Account | HWCSettings,
    debug?: boolean,
  ): Promise<InitializationData> {
    throw new Error('Method not implemented.');
  }
  stop(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  balanceOf(
    security: HederaId,
    targetId: HederaId,
  ): Promise<TransactionResponse<BigDecimal, Error>> {
    throw new Error('Method not implemented.');
  }
  controllerTransfer(
    security: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  controllerRedeem(
    security: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  issue(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  transfer(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  transferAndLock(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  redeem(
    security: EvmAddress,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  addToControlList(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  removeFromControlList(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  pause(
    security: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  unpause(
    security: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  takeSnapshot(security: EvmAddress, securityId?: ContractId | string,): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  getAccount(): Account {
    throw new Error('Method not implemented.');
  }
  getMirrorNodeAdapter(): MirrorNodeAdapter {
    throw new Error('Method not implemented.');
  }
  setDividends(
    security: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    amount: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  setCoupon(
    security: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    rate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  setVotingRights(
    security: EvmAddress,
    recordDate: BigDecimal,
    data: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }

  setDocument(
    security: EvmAddress,
    name: string,
    uri: string,
    hash: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse> {
    throw new Error('Method not implemented.');
  }
  removeDocument(
    security: EvmAddress,
    name: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse> {
    throw new Error('Method not implemented.');
  }
  setMaxSupply(
    security: EvmAddress,
    maxSupply: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  lock(
    security: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  release(
    security: EvmAddress,
    sourceId: EvmAddress,
    lockId: BigDecimal,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  logTransaction(id: string, network: string): void {
    const HASHSCAN_URL = `https://hashscan.io/${network}/transactionsById/`;
    const HASHSCAN_TX_URL = `https://hashscan.io/${network}/tx/`;
    const msg = `\nYou can see your transaction at ${
      id.startsWith('0x') ? HASHSCAN_TX_URL : HASHSCAN_URL
    }${id}\n`;
    LogService.logInfo(msg);
    console.log(msg);
  }
}
