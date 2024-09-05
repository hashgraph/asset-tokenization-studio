/*
 *
 * Hedera Asset Tokenization Studio SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import 'reflect-metadata';
import BigDecimal from '../src/domain/context/shared/BigDecimal.js';
import { BigNumber } from 'ethers';
import { SecurityRole } from '../src/domain/context/security/SecurityRole.js';
import { EquityDetails } from '../src/domain/context/equity/EquityDetails.js';
import { BondDetails } from '../src/domain/context/bond/BondDetails.js';
import { CouponDetails } from '../src/domain/context/bond/CouponDetails.js';
import { Dividend } from '../src/domain/context/equity/Dividend.js';
import { VotingRights } from '../src/domain/context/equity/VotingRights.js';
import { Coupon } from '../src/domain/context/bond/Coupon.js';
import { ScheduledSnapshot } from '../src/domain/context/security/ScheduledSnapshot.js';
import { Security } from '../src/domain/context/security/Security.js';
import { HederaId } from '../src/domain/context/shared/HederaId.js';
import { SecurityType } from '../src/domain/context/factory/SecurityType.js';
import EvmAddress from '../src/domain/context/contract/EvmAddress.js';
import TransactionResponse from '../src/domain/context/transaction/TransactionResponse.js';
import { Environment } from '../src/domain/context/network/Environment.js';
import { InitializationData } from '../src/port/out/TransactionAdapter.js';
import Account from '../src/domain/context/account/Account.js';
import { MirrorNodeAdapter } from '../src/port/out/mirror/MirrorNodeAdapter.js';
import ContractViewModel from '../src/port/in/response/ContractViewModel.js';
import TransactionResultViewModel from '../src/port/in/response/TransactionResultViewModel.js';
import { HBAR_DECIMALS } from '../src/core/Constants.js';
import Injectable from '../src/core/Injectable.js';
import { CLIENT_PUBLIC_KEY_ECDSA } from './config.js';
import {
  CastRegulationSubType,
  CastRegulationType,
} from '../src/domain/context/factory/RegulationType.js';

function hexToDecimal(hexString: string): number {
  if (!/^0x[a-fA-F0-9]+$|^[a-fA-F0-9]+$/.test(hexString)) {
    throw new Error('Invalid hexadecimal input.');
  }
  return parseInt(hexString, 16);
}

function identifiers(accountId: HederaId | string): string[] {
  let id;
  let accountEvmAddress;

  if (accountId instanceof HederaId) {
    id = accountId.toString();
    accountEvmAddress = '0x' + accountId.toHederaAddress().toSolidityAddress();
  } else {
    id = '0.0.' + hexToDecimal('0x' + accountId.toUpperCase().substring(2));
    accountEvmAddress = accountId.toString();
  }

  return [id, '0x' + accountEvmAddress.toUpperCase().substring(2)];
}

type balance = Map<string, string>;
type lock = Map<number, string[]>;
const securityEvmAddress = '0x0000000000000000000000000000000000000001';
const transactionId =
  '0x0102030405060708010203040506070801020304050607080x0102030405060708';
const HBAR_balances: balance = new Map();
const balances: balance = new Map();
const lockedBalances: balance = new Map();
const coupons: Coupon[] = [];
const couponsFor = new Map<number, balance>();
const dividends: Dividend[] = [];
const dividendsFor = new Map<number, balance>();
const votingRights: VotingRights[] = [];
const votingRightsFor = new Map<number, balance>();
const roles = new Map<string, SecurityRole[]>();
const accounts_with_roles = new Map<string, string[]>();
const locksIds = new Map<string, number[]>();
const locks = new Map<string, lock>();
const lastLockIds = new Map<string, number>();

let controlList: string[] = [];

let securityInfo: Security;
let equityInfo: EquityDetails;
let bondInfo: BondDetails;
let couponInfo: CouponDetails;
/*let factory: EvmAddress;
let resolver: EvmAddress;
let businessLogicKeys: string[];
let diamondOwnerAccount: EvmAddress | undefined;*/
const network: Environment = 'testnet';
let user_account: Account;

function grantRole(account: string, newRole: SecurityRole): void {
  let r = roles.get(account);
  if (!r) r = [newRole];
  else if (false == r.includes(newRole)) r.push(newRole);
  roles.set(account, r);

  let accounts = accounts_with_roles.get(newRole);
  if (!accounts) accounts = [account];
  else if (false == accounts.includes(account)) accounts.push(account);
  accounts_with_roles.set(newRole, accounts);
}

function revokeRole(account: string, oldRole: SecurityRole): void {
  let r = roles.get(account);
  if (r) {
    if (r.includes(oldRole)) {
      r = r.filter((role) => role !== oldRole);
      roles.set(account, r);

      let accounts = accounts_with_roles.get(oldRole);
      if (accounts) {
        accounts = accounts.filter((item) => item !== account);
        accounts_with_roles.set(oldRole, accounts);
      }
    }
  }
}

function increaseLockedBalance(targetId: EvmAddress, amount: BigDecimal): void {
  const account = identifiers(targetId.toString())[1];
  let accountLockedBalance = lockedBalances.get(account);
  if (accountLockedBalance) {
    accountLockedBalance = BigDecimal.fromString(accountLockedBalance)
      .toBigNumber()
      .add(amount.toBigNumber())
      .toString();
    lockedBalances.set(account, accountLockedBalance);
  } else lockedBalances.set(account, amount.toString());
}

function decreaseLockedBalance(targetId: EvmAddress, amount: BigDecimal): void {
  const account = identifiers(targetId.toString())[1];
  let accountLockedBalance = lockedBalances.get(account);
  if (accountLockedBalance) {
    accountLockedBalance = BigDecimal.fromString(accountLockedBalance)
      .toBigNumber()
      .sub(amount.toBigNumber())
      .toString();
    lockedBalances.set(account, accountLockedBalance);
  }
}

function increaseBalance(targetId: EvmAddress, amount: BigDecimal): void {
  const account = identifiers(targetId.toString())[1];
  let accountBalance = balances.get(account);
  if (accountBalance) {
    accountBalance = BigDecimal.fromString(accountBalance)
      .toBigNumber()
      .add(amount.toBigNumber())
      .toString();
    balances.set(account, accountBalance);
  } else balances.set(account, amount.toString());
}

function decreaseBalance(targetId: EvmAddress, amount: BigDecimal): void {
  const account = identifiers(targetId.toString())[1];
  let accountBalance = balances.get(account);
  if (accountBalance) {
    accountBalance = BigDecimal.fromString(accountBalance)
      .toBigNumber()
      .sub(amount.toBigNumber())
      .toString();
    balances.set(account, accountBalance);
  }
}

jest.mock('../src/port/out/rpc/RPCQueryAdapter', () => {
  const actual = jest.requireActual('../src/port/out/rpc/RPCQueryAdapter.ts');

  const singletonInstance = new actual.RPCQueryAdapter();

  singletonInstance.init = jest.fn(
    async (urlRpcProvider?: string, apiKey?: string) => {
      return 'mock_environment';
    },
  );

  singletonInstance.connect = jest.fn(() => {
    console.log('Mocked connect method');
    return {}; // Return a mock object as needed
  });

  singletonInstance.balanceOf = jest.fn(
    async (address: EvmAddress, target: EvmAddress): Promise<BigNumber> => {
      const balance = balances.get(
        '0x' + target.toString().toUpperCase().substring(2),
      );
      if (balance)
        return BigNumber.from(
          BigDecimal.fromString(balance, securityInfo.decimals),
        );
      return BigNumber.from(BigDecimal.fromString('0', securityInfo.decimals));
    },
  );

  singletonInstance.balanceOfByPartition = jest.fn(
    async (address: EvmAddress, target: EvmAddress, partitionId: string) => {
      if (partitionId == '0') {
        const balance = balances.get(
          '0x' + target.toString().toUpperCase().substring(2),
        );
        if (balance)
          return BigDecimal.fromString(balance, securityInfo.decimals);
        return BigDecimal.fromString('0', securityInfo.decimals);
      }
      return BigDecimal.fromString('0', securityInfo.decimals);
    },
  );

  singletonInstance.balanceOfAtSnapshot = jest.fn(
    async (address: EvmAddress, target: EvmAddress, snapshotId: number) => {
      return BigNumber.from(0);
    },
  );

  singletonInstance.balanceOfAtSnapshotByPartition = jest.fn(
    async (
      address: EvmAddress,
      target: EvmAddress,
      partitionId: string,
      snapshotId: number,
    ) => {
      return BigNumber.from(0);
    },
  );

  singletonInstance.partitionsOf = jest.fn(
    async (address: EvmAddress, targetId: EvmAddress) => {
      return ['mock_partition'];
    },
  );

  singletonInstance.partitionsOfAtSnapshot = jest.fn(
    async (address: EvmAddress, targetId: EvmAddress, snapshotId: number) => {
      return ['mock_partition'];
    },
  );

  singletonInstance.totalSupply = jest.fn(async (address: EvmAddress) => {
    return BigNumber.from(0);
  });

  singletonInstance.totalSupplyAtSnapshot = jest.fn(
    async (address: EvmAddress, snapshotId: number) => {
      return BigNumber.from(0);
    },
  );

  singletonInstance.getRolesFor = jest.fn(
    async (
      address: EvmAddress,
      target: EvmAddress,
      start: number,
      end: number,
    ): Promise<string[]> => {
      const target_roles = roles.get(identifiers(target.toString())[1]);
      if (!target_roles) return [];
      const rolesToReturn: string[] = [];
      for (let i = start; i < end; i++) {
        rolesToReturn.push(target_roles[i]);
      }
      return rolesToReturn;
    },
  );

  singletonInstance.getRoleMembers = jest.fn(
    async (
      address: EvmAddress,
      role: SecurityRole,
      start: number,
      end: number,
    ): Promise<string[]> => {
      const accounts = accounts_with_roles.get(role);
      if (!accounts) return [];
      const roleMembers: string[] = [];
      for (let i = start; i < end; i++) {
        roleMembers.push(accounts[i]);
      }
      return roleMembers;
    },
  );

  singletonInstance.getRoleCountFor = jest.fn(
    async (address: EvmAddress, target: EvmAddress): Promise<number> => {
      const target_roles = roles.get(identifiers(target.toString())[1]);
      if (!target_roles) return 0;
      return target_roles.length;
    },
  );

  singletonInstance.getRoleMemberCount = jest.fn(
    async (address: EvmAddress, role: SecurityRole): Promise<number> => {
      const accounts = accounts_with_roles.get(role);
      if (!accounts) return 0;
      return accounts.length;
    },
  );

  singletonInstance.hasRole = jest.fn(
    async (
      address: EvmAddress,
      target: EvmAddress,
      role: SecurityRole,
    ): Promise<boolean> => {
      const target_roles = roles.get(identifiers(target.toString())[1]);
      if (!target_roles) return false;
      if (target_roles?.includes(role)) return true;
      return false;
    },
  );

  singletonInstance.getSecurity = jest.fn(async (address: EvmAddress) => {
    return securityInfo;
  });

  singletonInstance.getEquityDetails = jest.fn(async (address: EvmAddress) => {
    return equityInfo;
  });

  singletonInstance.getBondDetails = jest.fn(async (address: EvmAddress) => {
    return bondInfo;
  });

  singletonInstance.getCouponDetails = jest.fn(async (address: EvmAddress) => {
    return couponInfo;
  });

  singletonInstance.getControlListMembers = jest.fn(
    async (address: EvmAddress, start: number, end: number) => {
      const listMembers: string[] = [];

      for (let i = start; i < end; i++) {
        listMembers.push(controlList[i]);
      }

      return listMembers;
    },
  );

  singletonInstance.getControlListCount = jest.fn(
    async (address: EvmAddress) => {
      return controlList.length;
    },
  );

  singletonInstance.getControlListType = jest.fn(
    async (address: EvmAddress) => {
      return securityInfo.isWhiteList;
    },
  );

  singletonInstance.isAccountInControlList = jest.fn(
    async (address: EvmAddress, target: EvmAddress) => {
      const account = identifiers(target.toString())[1];
      return controlList.findIndex((item) => item == account) !== -1;
    },
  );

  singletonInstance.getDividendsFor = jest.fn(
    async (address: EvmAddress, target: EvmAddress, dividend: number) => {
      const dividendsBalances = dividendsFor.get(dividend);

      if (!dividendsBalances)
        return BigDecimal.fromString('0', securityInfo.decimals);

      const balance = dividendsBalances.get(
        '0x' + target.toString().toUpperCase().substring(2),
      );
      if (balance) return BigDecimal.fromString(balance, securityInfo.decimals);
      return BigDecimal.fromString('0', securityInfo.decimals);
    },
  );

  singletonInstance.getDividends = jest.fn(
    async (address: EvmAddress, dividend: number) => {
      if (dividend > dividends.length) return undefined;
      return dividends[dividend - 1];
    },
  );

  singletonInstance.getDividendsCount = jest.fn(async (address: EvmAddress) => {
    return dividends.length;
  });

  singletonInstance.getVotingFor = jest.fn(
    async (address: EvmAddress, target: EvmAddress, voting: number) => {
      const votingBalances = votingRightsFor.get(voting);

      if (!votingBalances)
        return BigDecimal.fromString('0', securityInfo.decimals);

      const balance = votingBalances.get(
        '0x' + target.toString().toUpperCase().substring(2),
      );
      if (balance) return BigDecimal.fromString(balance, securityInfo.decimals);
      return BigDecimal.fromString('0', securityInfo.decimals);
    },
  );

  singletonInstance.getVoting = jest.fn(
    async (address: EvmAddress, voting: number) => {
      if (voting > votingRights.length) return undefined;
      return votingRights[voting - 1];
    },
  );

  singletonInstance.getVotingsCount = jest.fn(async (address: EvmAddress) => {
    return votingRights.length;
  });

  singletonInstance.getCouponFor = jest.fn(
    async (address: EvmAddress, target: EvmAddress, coupon: number) => {
      const couponsBalances = couponsFor.get(coupon);

      if (!couponsBalances)
        return BigDecimal.fromString('0', securityInfo.decimals);

      const balance = couponsBalances.get(
        '0x' + target.toString().toUpperCase().substring(2),
      );
      if (balance) return BigDecimal.fromString(balance, securityInfo.decimals);
      return BigDecimal.fromString('0', securityInfo.decimals);
    },
  );

  singletonInstance.getCoupon = jest.fn(
    async (address: EvmAddress, coupon: number) => {
      if (coupon > coupons.length) return undefined;
      return coupons[coupon - 1];
    },
  );

  singletonInstance.getCouponCount = jest.fn(async (address: EvmAddress) => {
    return coupons.length;
  });

  singletonInstance.getAccountSecurityRelationship = jest.fn(
    async (address: EvmAddress, target: EvmAddress) => {},
  );

  singletonInstance.isPaused = jest.fn(async (address: EvmAddress) => {
    return securityInfo.paused ?? false;
  });

  singletonInstance.canTransferByPartition = jest.fn(
    async (
      address: EvmAddress,
      sourceId: EvmAddress,
      targetId: EvmAddress,
      amount: BigDecimal,
      partitionId: string,
      data: string,
      operatorData: string,
    ) => {
      return [false, '', ''];
    },
  );

  singletonInstance.canRedeemByPartition = jest.fn(
    async (
      address: EvmAddress,
      sourceId: EvmAddress,
      amount: BigDecimal,
      partitionId: string,
      data: string,
      operatorData: string,
    ) => {
      return [false, '', ''];
    },
  );

  singletonInstance.getDocument = jest.fn(
    async (address: EvmAddress, name: string) => {
      return ['', '', BigNumber.from(0)];
    },
  );

  singletonInstance.getAllDocuments = jest.fn(async (address: EvmAddress) => {
    return ['mock_document'];
  });

  singletonInstance.isOperatorForPartition = jest.fn(
    async (
      address: EvmAddress,
      partitionId: string,
      operator: EvmAddress,
      target: EvmAddress,
    ) => {
      return false;
    },
  );

  singletonInstance.isOperator = jest.fn(
    async (address: EvmAddress, operator: EvmAddress, target: EvmAddress) => {
      return false;
    },
  );

  singletonInstance.getScheduledSnapshots = jest.fn(
    async (address: EvmAddress, start: number, end: number) => {
      return [new ScheduledSnapshot(BigNumber.from('43756347647'), 'data')];
    },
  );

  singletonInstance.scheduledSnapshotCount = jest.fn(
    async (address: EvmAddress) => {
      return 0;
    },
  );

  singletonInstance.getMaxSupply = jest.fn(async (address: EvmAddress) => {
    return BigNumber.from(0);
  });

  singletonInstance.getRegulationDetails = jest.fn(
    async (type: number, subType: number, factoryAddress: EvmAddress) => {
      return {
        type: CastRegulationType.fromNumber(type),
        subType: CastRegulationSubType.fromNumber(subType),
        dealSize: '0',
        accreditedInvestors: 'ACCREDITATION REQUIRED',
        maxNonAccreditedInvestors: 0,
        manualInvestorVerification:
          'VERIFICATION INVESTORS FINANCIAL DOCUMENTS REQUIRED',
        internationalInvestors: 'ALLOWED',
        resaleHoldPeriod: 'NOT APPLICABLE',
      };
    },
  );

  singletonInstance.getLockedBalanceOf = jest.fn(
    async (address: EvmAddress, target: EvmAddress) => {
      const lockedBalance = lockedBalances.get(
        '0x' + target.toString().toUpperCase().substring(2),
      );
      if (lockedBalance)
        return BigNumber.from(
          BigDecimal.fromString(lockedBalance, securityInfo.decimals),
        );
      return BigNumber.from(BigDecimal.fromString('0', securityInfo.decimals));
    },
  );

  singletonInstance.getLockCount = jest.fn(
    async (address: EvmAddress, target: EvmAddress) => {
      const lockIds = locksIds.get(
        '0x' + target.toString().toUpperCase().substring(2),
      );
      if (lockIds) return lockIds.length;
      return 0;
    },
  );

  singletonInstance.getLocksId = jest.fn(
    async (
      address: EvmAddress,
      target: EvmAddress,
      start: number,
      end: number,
    ) => {
      const lockIds = locksIds.get(
        '0x' + target.toString().toUpperCase().substring(2),
      );
      if (!lockIds) return [];
      const returnedLocksId: BigNumber[] = [];
      for (let i = start; i < end; i++) {
        returnedLocksId.push(BigNumber.from(lockIds[i]));
      }
      return returnedLocksId;
    },
  );

  singletonInstance.getLock = jest.fn(
    async (address: EvmAddress, target: EvmAddress, lockId: number) => {
      const accountLocks = locks.get(
        '0x' + target.toString().toUpperCase().substring(2),
      );
      if (!accountLocks) return [BigNumber.from(0), BigNumber.from(0)];
      const accountLock = accountLocks.get(lockId);
      if (!accountLock) return [BigNumber.from(0), BigNumber.from(0)];
      return accountLock;
    },
  );

  return {
    RPCQueryAdapter: jest.fn(() => singletonInstance),
  };
});

jest.mock('../src/port/out/rpc/RPCTransactionAdapter', () => {
  const actual = jest.requireActual(
    '../src/port/out/rpc/RPCTransactionAdapter.ts',
  );

  const singletonInstance = new actual.RPCTransactionAdapter();

  singletonInstance.createEquity = jest.fn(
    async (
      _securityInfo: Security,
      _equityInfo: EquityDetails,
      _factory: EvmAddress,
      _resolver: EvmAddress,
      _businessLogicKeys: string[],
      _diamondOwnerAccount?: EvmAddress,
    ) => {
      securityInfo = _securityInfo;

      const ids = identifiers(securityEvmAddress);
      securityInfo.diamondAddress = HederaId.from(ids[0]);
      securityInfo.evmDiamondAddress = new EvmAddress(ids[1]);
      securityInfo.type = SecurityType.EQUITY;
      securityInfo.regulation = {
        type: _securityInfo.regulationType ?? '',
        subType: _securityInfo.regulationsubType ?? '',
        dealSize: '0',
        accreditedInvestors: 'ACCREDITATION REQUIRED',
        maxNonAccreditedInvestors: 0,
        manualInvestorVerification:
          'VERIFICATION INVESTORS FINANCIAL DOCUMENTS REQUIRED',
        internationalInvestors: 'ALLOWED',
        resaleHoldPeriod: 'NOT APPLICABLE',
      };

      equityInfo = _equityInfo;

      return {
        status: 'success',
        id: transactionId,
        response: {
          equityAddress: securityEvmAddress,
        },
      } as TransactionResponse;
    },
  );

  singletonInstance.createBond = jest.fn(
    async (
      _securityInfo: Security,
      _bondInfo: BondDetails,
      _couponInfo: CouponDetails,
      _factory: EvmAddress,
      _resolver: EvmAddress,
      _businessLogicKeys: string[],
      _diamondOwnerAccount?: EvmAddress,
    ) => {
      securityInfo = _securityInfo;

      const ids = identifiers(securityEvmAddress);
      securityInfo.diamondAddress = HederaId.from(ids[0]);
      securityInfo.evmDiamondAddress = new EvmAddress(ids[1]);
      securityInfo.type = SecurityType.BOND;
      securityInfo.regulation = {
        type: _securityInfo.regulationType ?? '',
        subType: _securityInfo.regulationsubType ?? '',
        dealSize: '0',
        accreditedInvestors: 'ACCREDITATION REQUIRED',
        maxNonAccreditedInvestors: 0,
        manualInvestorVerification:
          'VERIFICATION INVESTORS FINANCIAL DOCUMENTS REQUIRED',
        internationalInvestors: 'ALLOWED',
        resaleHoldPeriod: 'NOT APPLICABLE',
      };

      bondInfo = _bondInfo;
      couponInfo = _couponInfo;

      const diff = bondInfo.maturityDate - couponInfo.firstCouponDate;
      const numberOfCoupons = Math.ceil(diff / couponInfo.couponFrequency);

      for (let i = 0; i < numberOfCoupons; i++) {
        const timeStamp =
          couponInfo.firstCouponDate + couponInfo.couponFrequency * i;
        const coupon = new Coupon(
          timeStamp,
          timeStamp,
          couponInfo.couponRate,
          0,
        );
        coupons.push(coupon);
      }

      return {
        status: 'success',
        id: transactionId,
        response: {
          bondAddress: securityEvmAddress,
        },
      } as TransactionResponse;
    },
  );

  singletonInstance.init = jest.fn(async () => {
    return network;
  });

  singletonInstance.register = jest.fn(async (account: Account) => {
    user_account = account;
    Injectable.registerTransactionHandler(singletonInstance);
    return {} as InitializationData;
  });

  singletonInstance.stop = jest.fn(async () => {
    return true;
  });

  singletonInstance.controllerTransfer = jest.fn(
    async (
      address: EvmAddress,
      sourceId: EvmAddress,
      targetId: EvmAddress,
      amount: BigDecimal,
    ) => {
      increaseBalance(targetId, amount);
      decreaseBalance(sourceId, amount);

      return {
        status: 'success',
        id: transactionId,
      } as TransactionResponse;
    },
  );

  singletonInstance.controllerRedeem = jest.fn(
    async (address: EvmAddress, sourceId: EvmAddress, amount: BigDecimal) => {
      decreaseBalance(sourceId, amount);

      return {
        status: 'success',
        id: transactionId,
      } as TransactionResponse;
    },
  );

  singletonInstance.issue = jest.fn(
    async (
      security: EvmAddress,
      targetId: EvmAddress,
      amount: BigDecimal,
    ): Promise<TransactionResponse<any, Error>> => {
      increaseBalance(targetId, amount);
      const totalSupply = securityInfo.totalSupply
        ? securityInfo.totalSupply
        : BigDecimal.fromString('0');
      securityInfo.totalSupply = BigDecimal.fromString(
        totalSupply.toBigNumber().add(amount.toBigNumber()).toString(),
      );

      return {
        status: 'success',
        id: transactionId,
      } as TransactionResponse;
    },
  );

  singletonInstance.transfer = jest.fn(
    async (address: EvmAddress, targetId: EvmAddress, amount: BigDecimal) => {
      increaseBalance(targetId, amount);
      const currentAccount = new EvmAddress(identifiers(user_account.id)[1]);
      decreaseBalance(currentAccount, amount);

      return {
        status: 'success',
        id: transactionId,
      } as TransactionResponse;
    },
  );

  singletonInstance.transferAndLock = jest.fn(
    async (
      address: EvmAddress,
      targetId: EvmAddress,
      amount: BigDecimal,
      expirationDate: BigDecimal,
    ) => {
      const account = '0x' + targetId.toString().toUpperCase().substring(2);

      const accountLocks = locks.get(account);
      const lockIds = locksIds.get(account);
      const lastLockId = lastLockIds.get(account) ?? 0;

      const newLastLockId = lastLockId + 1;

      if (!lockIds) locksIds.set(account, [newLastLockId]);
      else {
        lockIds.push(newLastLockId);
        locksIds.set(account, lockIds);
      }
      if (!accountLocks) {
        const newLock: lock = new Map();
        newLock.set(newLastLockId, [
          expirationDate.toString(),
          amount.toString(),
        ]);
        locks.set(account, newLock);
      } else {
        accountLocks.set(newLastLockId, [
          expirationDate.toString(),
          amount.toString(),
        ]);
        locks.set(account, accountLocks);
      }

      increaseLockedBalance(targetId, amount);
      const currentAccount = new EvmAddress(identifiers(user_account.id)[1]);
      decreaseBalance(currentAccount, amount);

      return {
        status: 'success',
        id: transactionId,
      } as TransactionResponse;
    },
  );

  singletonInstance.redeem = jest.fn(
    async (address: EvmAddress, amount: BigDecimal) => {
      const currentAccount = new EvmAddress(identifiers(user_account.id)[1]);
      decreaseBalance(currentAccount, amount);

      return {
        status: 'success',
        id: transactionId,
      } as TransactionResponse;
    },
  );

  singletonInstance.addToControlList = jest.fn(
    async (address: EvmAddress, targetId: EvmAddress) => {
      const account = identifiers(targetId.toString())[1];

      if (controlList.findIndex((item) => item == account) == -1) {
        controlList.push(account);
      }

      return {
        status: 'success',
        id: transactionId,
      } as TransactionResponse;
    },
  );

  singletonInstance.removeFromControlList = jest.fn(
    async (address: EvmAddress, targetId: EvmAddress) => {
      const account = identifiers(targetId.toString())[1];

      if (controlList.findIndex((item) => item == account) !== -1) {
        controlList = controlList.filter((item) => item !== account);
      }

      return {
        status: 'success',
        id: transactionId,
      } as TransactionResponse;
    },
  );

  singletonInstance.pause = jest.fn(async () => {
    securityInfo.paused = true;
    return {
      status: 'success',
      id: transactionId,
    } as TransactionResponse;
  });

  singletonInstance.unpause = jest.fn(async () => {
    securityInfo.paused = false;
    return {
      status: 'success',
      id: transactionId,
    } as TransactionResponse;
  });

  singletonInstance.takeSnapshot = jest.fn(async () => {
    return {
      status: 'success',
      id: transactionId,
    } as TransactionResponse;
  });

  singletonInstance.setDividends = jest.fn(
    async (
      address: EvmAddress,
      recordDate: BigDecimal,
      executionDate: BigDecimal,
      amount: BigDecimal,
    ) => {
      const dividend = new Dividend(
        amount,
        parseInt(recordDate.toString()),
        parseInt(executionDate.toString()),
        0,
      );
      dividends.push(dividend);
      return {
        status: 'success',
        id: transactionId,
      } as TransactionResponse;
    },
  );

  singletonInstance.setVotingRights = jest.fn(
    async (address: EvmAddress, recordDate: BigDecimal, data: string) => {
      const votingRight = new VotingRights(
        parseInt(recordDate.toString()),
        data,
        0,
      );
      votingRights.push(votingRight);

      return {
        status: 'success',
        id: transactionId,
      } as TransactionResponse;
    },
  );

  singletonInstance.setCoupon = jest.fn(
    async (
      address: EvmAddress,
      recordDate: BigDecimal,
      executionDate: BigDecimal,
      rate: BigDecimal,
    ) => {
      const coupon = new Coupon(
        parseInt(recordDate.toString()),
        parseInt(executionDate.toString()),
        rate,
        0,
      );
      coupons.push(coupon);
      return {
        status: 'success',
        id: transactionId,
      } as TransactionResponse;
    },
  );

  singletonInstance.setDocument = jest.fn(async () => {
    return {
      status: 'success',
      id: transactionId,
    } as TransactionResponse;
  });

  singletonInstance.removeDocument = jest.fn(async () => {
    return {
      status: 'success',
      id: transactionId,
    } as TransactionResponse;
  });

  singletonInstance.authorizeOperator = jest.fn(async () => {
    return {
      status: 'success',
      id: transactionId,
    } as TransactionResponse;
  });

  singletonInstance.revokeOperator = jest.fn(async () => {
    return {
      status: 'success',
      id: transactionId,
    } as TransactionResponse;
  });

  singletonInstance.authorizeOperatorByPartition = jest.fn(async () => {
    return {
      status: 'success',
      id: transactionId,
    } as TransactionResponse;
  });

  singletonInstance.revokeOperatorByPartition = jest.fn(async () => {
    return {
      status: 'success',
      id: transactionId,
    } as TransactionResponse;
  });

  singletonInstance.operatorTransferByPartition = jest.fn(async () => {
    return {
      status: 'success',
      id: transactionId,
    } as TransactionResponse;
  });

  singletonInstance.triggerPendingScheduledSnapshots = jest.fn(async () => {
    return {
      status: 'success',
      id: transactionId,
    } as TransactionResponse;
  });

  singletonInstance.triggerScheduledSnapshots = jest.fn(async () => {
    return {
      status: 'success',
      id: transactionId,
    } as TransactionResponse;
  });

  singletonInstance.setMaxSupply = jest.fn(async () => {
    return {
      status: 'success',
      id: transactionId,
    } as TransactionResponse;
  });

  singletonInstance.lock = jest.fn(async () => {
    return {
      status: 'success',
      id: transactionId,
    } as TransactionResponse;
  });

  singletonInstance.release = jest.fn(
    async (address: EvmAddress, sourceId: EvmAddress, lockId: number) => {
      const account = '0x' + sourceId.toString().toUpperCase().substring(2);

      const accountLocks = locks.get(account);
      let lockIds = locksIds.get(account);

      let amount = BigDecimal.fromString('0');
      if (accountLocks) {
        const values = accountLocks.get(lockId);
        if (values) amount = BigDecimal.fromString(values[1]);
        accountLocks.set(lockId, ['0', '0']);
      }

      if (lockIds) {
        lockIds = lockIds.filter((id) => id !== lockId);
        locksIds.set(account, lockIds);
      }

      decreaseLockedBalance(sourceId, amount);
      increaseBalance(sourceId, amount);

      return {
        status: 'success',
        id: transactionId,
      } as TransactionResponse;
    },
  );

  singletonInstance.grantRole = jest.fn(
    async (
      address: EvmAddress,
      targetId: EvmAddress,
      role: SecurityRole,
    ): Promise<TransactionResponse<any, Error>> => {
      const account = identifiers(targetId.toString())[1];

      grantRole(account, role);

      return {
        status: 'success',
        id: transactionId,
      } as TransactionResponse;
    },
  );

  singletonInstance.applyRoles = jest.fn(
    async (
      address: EvmAddress,
      targetId: EvmAddress,
      roles: SecurityRole[],
      actives: boolean[],
    ): Promise<TransactionResponse<any, Error>> => {
      const account = identifiers(targetId.toString())[1];

      for (let i = 0; i < roles.length; i++) {
        if (actives[i]) grantRole(account, roles[i]);
        else revokeRole(account, roles[i]);
      }
      return {
        status: 'success',
        id: transactionId,
      } as TransactionResponse;
    },
  );

  singletonInstance.revokeRole = jest.fn(
    async (
      address: EvmAddress,
      targetId: EvmAddress,
      role: SecurityRole,
    ): Promise<TransactionResponse<any, Error>> => {
      const account = identifiers(targetId.toString())[1];

      revokeRole(account, role);

      return {
        status: 'success',
        id: transactionId,
      } as TransactionResponse;
    },
  );

  singletonInstance.renounceRole = jest.fn(async () => {
    return {
      status: 'success',
      id: transactionId,
    } as TransactionResponse;
  });

  singletonInstance.hasRole = jest.fn(async () => {
    return { status: 'success', data: true } as TransactionResponse<
      boolean,
      Error
    >;
  });

  singletonInstance.getRolesFor = jest.fn(async () => {
    return { status: 'success', data: [] } as TransactionResponse<
      string[],
      Error
    >;
  });

  singletonInstance.getRoleMembers = jest.fn(async () => {
    return { status: 'success', data: [] } as TransactionResponse<
      string[],
      Error
    >;
  });

  singletonInstance.getRoleCountFor = jest.fn(async () => {
    return { status: 'success', data: 0 } as TransactionResponse<number, Error>;
  });

  singletonInstance.getRoleMemberCount = jest.fn(async () => {
    return { status: 'success', data: 0 } as TransactionResponse<number, Error>;
  });

  singletonInstance.getAccount = jest.fn(() => {
    return user_account;
  });

  singletonInstance.getMirrorNodeAdapter = jest.fn(() => {
    return {} as MirrorNodeAdapter;
  });

  return {
    RPCTransactionAdapter: jest.fn(() => singletonInstance),
  };
});

jest.mock('../src/port/out/mirror/MirrorNodeAdapter', () => {
  const actual = jest.requireActual(
    '../src/port/out/mirror/MirrorNodeAdapter.ts',
  );

  const MirrorNodeAdapterMock = new actual.MirrorNodeAdapter();

  MirrorNodeAdapterMock.set = jest.fn().mockResolvedValue('mocked set');

  MirrorNodeAdapterMock.getAccountInfo = jest.fn(
    (accountId: HederaId | string) => {
      const ids = identifiers(accountId);

      const response: Account = {
        id: HederaId.from(ids[0]),
        evmAddress: ids[1],
        alias: 'anything',
        publicKey: CLIENT_PUBLIC_KEY_ECDSA,
      };
      return response;
    },
  );
  MirrorNodeAdapterMock.getContractInfo = jest.fn(
    (contractEvmAddress: string) => {
      let accountId;

      if (contractEvmAddress.toString().indexOf('.') !== -1) {
        accountId = HederaId.from(contractEvmAddress);
      } else {
        accountId = contractEvmAddress;
      }

      const ids = identifiers(accountId);

      const response: ContractViewModel = {
        id: ids[0],
        evmAddress: ids[1],
      };
      return response;
    },
  );
  MirrorNodeAdapterMock.getTransactionResult = jest.fn(
    (transactionId: string) => {
      const response: TransactionResultViewModel = {
        result: 'resultMessage',
      };
      return response;
    },
  );
  MirrorNodeAdapterMock.getTransactionFinalError = jest.fn(
    (transactionId: string) => {
      const response: TransactionResultViewModel = {
        result: 'resultMessage',
      };
      return response;
    },
  );
  MirrorNodeAdapterMock.accountToEvmAddress = jest.fn((accountId: string) => {
    const ids = identifiers(HederaId.from(accountId));
    return ids[1];
  });
  MirrorNodeAdapterMock.getHBARBalance = jest.fn(
    (accountId: HederaId | string) => {
      const balance = HBAR_balances.get(identifiers(accountId)[1]);
      if (balance) return BigDecimal.fromString(balance, HBAR_DECIMALS);
      return BigDecimal.fromString('0', HBAR_DECIMALS);
    },
  );

  return {
    MirrorNodeAdapter: jest.fn(() => MirrorNodeAdapterMock),
  };
});
