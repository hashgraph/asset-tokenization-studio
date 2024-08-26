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
import WalletConnectSettings from '../../domain/context/walletConnect/WalletConnectSettings.js';

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
  register(
    wcSettings?: WalletConnectSettings | undefined,
    account?: Account,
  ): Promise<InitializationData>;
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
  ): Promise<TransactionResponse>;
  controllerRedeem(
    security: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse>;
  issue(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse>;
  transfer(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse>;
  transferAndLock(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
  ): Promise<TransactionResponse>;
  redeem(
    security: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse>;
  addToControlList(
    security: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse>;
  removeFromControlList(
    security: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse>;
  pause(security: EvmAddress): Promise<TransactionResponse>;
  unpause(security: EvmAddress): Promise<TransactionResponse>;
  takeSnapshot(security: EvmAddress): Promise<TransactionResponse>;
  setDividends(
    address: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    amount: BigDecimal,
  ): Promise<TransactionResponse<any, Error>>;
  setVotingRights(
    address: EvmAddress,
    recordDate: BigDecimal,
    data: string,
  ): Promise<TransactionResponse<any, Error>>;
  setCoupon(
    address: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    rate: BigDecimal,
  ): Promise<TransactionResponse<any, Error>>;
  setDocument(
    security: EvmAddress,
    name: string,
    uri: string,
    hash: string,
  ): Promise<TransactionResponse>;
  removeDocument(
    security: EvmAddress,
    name: string,
  ): Promise<TransactionResponse>;
  authorizeOperator(
    security: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse>;
  revokeOperator(
    security: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse>;
  authorizeOperatorByPartition(
    security: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
  ): Promise<TransactionResponse>;
  revokeOperatorByPartition(
    security: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
  ): Promise<TransactionResponse>;
  operatorTransferByPartition(
    security: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    partitionId: string,
  ): Promise<TransactionResponse>;
  triggerPendingScheduledSnapshots(
    security: EvmAddress,
  ): Promise<TransactionResponse>;
  triggerScheduledSnapshots(
    security: EvmAddress,
    max: number,
  ): Promise<TransactionResponse>;
  setMaxSupply(
    security: EvmAddress,
    maxSupply: BigDecimal,
  ): Promise<TransactionResponse>;
  lock(
    security: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
  ): Promise<TransactionResponse>;
  release(
    security: EvmAddress,
    sourceId: EvmAddress,
    lockId: number,
  ): Promise<TransactionResponse>;
  getAccount(): Account;
  getMirrorNodeAdapter(): MirrorNodeAdapter;
}

interface RoleTransactionAdapter {
  grantRole(
    security: EvmAddress,
    targetId: EvmAddress,
    role: SecurityRole,
  ): Promise<TransactionResponse>;
  applyRoles(
    security: EvmAddress,
    targetId: EvmAddress,
    roles: SecurityRole[],
    actives: boolean[],
  ): Promise<TransactionResponse>;
  revokeRole(
    security: EvmAddress,
    targetId: EvmAddress,
    role: SecurityRole,
  ): Promise<TransactionResponse>;
  renounceRole(
    security: EvmAddress,
    role: SecurityRole,
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
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  triggerScheduledSnapshots(
    security: EvmAddress,
    max: number,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  authorizeOperator(
    security: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  revokeOperator(
    security: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  authorizeOperatorByPartition(
    security: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  revokeOperatorByPartition(
    security: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  operatorTransferByPartition(
    security: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    partitionId: string,
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
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  applyRoles(
    security: EvmAddress,
    targetId: EvmAddress,
    roles: SecurityRole[],
    actives: boolean[],
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  revokeRole(
    security: EvmAddress,
    targetId: EvmAddress,
    role: SecurityRole,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  renounceRole(
    security: EvmAddress,
    role: SecurityRole,
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
    wcSettings?: WalletConnectSettings | undefined,
    account?: Account | undefined,
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
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  controllerRedeem(
    security: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  issue(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  transfer(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  transferAndLock(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  redeem(
    security: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  addToControlList(
    security: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  removeFromControlList(
    security: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  pause(security: EvmAddress): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  unpause(security: EvmAddress): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  takeSnapshot(security: EvmAddress): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  getAccount(): Account {
    throw new Error('Method not implemented.');
  }
  getMirrorNodeAdapter(): MirrorNodeAdapter {
    throw new Error('Method not implemented.');
  }
  setDividends(
    address: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    amount: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  setCoupon(
    address: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    rate: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  setVotingRights(
    address: EvmAddress,
    recordDate: BigDecimal,
    data: string,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }

  setDocument(
    security: EvmAddress,
    name: string,
    uri: string,
    hash: string,
  ): Promise<TransactionResponse> {
    throw new Error('Method not implemented.');
  }
  removeDocument(
    security: EvmAddress,
    name: string,
  ): Promise<TransactionResponse> {
    throw new Error('Method not implemented.');
  }
  setMaxSupply(
    security: EvmAddress,
    maxSupply: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  lock(
    security: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    throw new Error('Method not implemented.');
  }
  release(
    security: EvmAddress,
    sourceId: EvmAddress,
    lockId: number,
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

  async getEVMAddress(parameter: HederaId | string): Promise<any> {
    if (parameter instanceof HederaId) {
      parameter = parameter.toString();
    }
    return (
      await this.getMirrorNodeAdapter().accountToEvmAddress(parameter)
    ).toString();
  }
}
