/*
 *
 * Hedera Stablecoin SDK
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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
import {
  Transaction,
  ContractId as HContractId,
  CustomFee as HCustomFee,
  Client,
} from '@hashgraph/sdk';
import TransactionAdapter from '../TransactionAdapter';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import Web3 from 'web3';
import { CapabilityError } from './error/CapabilityError.js';
import PublicKey from '../../../domain/context/account/PublicKey.js';
import ContractId from '../../../domain/context/contract/ContractId.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import Account from '../../../domain/context/account/Account.js';
import { MirrorNodeAdapter } from '../mirror/MirrorNodeAdapter.js';
import { HederaId } from '../../../domain/context/shared/HederaId.js';
import {
  BALANCE_OF_GAS,
  BURN_GAS,
  CASHIN_GAS,
  DECREASE_SUPPLY_GAS,
  DELETE_GAS,
  FREEZE_GAS,
  GET_RESERVE_ADDRESS_GAS,
  GET_RESERVE_AMOUNT_GAS,
  GET_ROLES_GAS,
  GET_SUPPLY_ALLOWANCE_GAS,
  GRANT_KYC_GAS,
  GRANT_ROLES_GAS,
  HAS_ROLE_GAS,
  INCREASE_SUPPLY_GAS,
  IS_UNLIMITED_ALLOWANCE_GAS,
  PAUSE_GAS,
  RESCUE_GAS,
  RESCUE_HBAR_GAS,
  RESET_SUPPLY_GAS,
  REVOKE_KYC_GAS,
  REVOKE_ROLES_GAS,
  TOKEN_CREATION_COST_HBAR,
  UNFREEZE_GAS,
  UNPAUSE_GAS,
  UPDATE_RESERVE_ADDRESS_GAS,
  UPDATE_RESERVE_AMOUNT_GAS,
  UPDATE_TOKEN_GAS,
  WIPE_GAS,
  MAX_ROLES_GAS,
  CHANGE_PROXY_OWNER_GAS,
  ACCEPT_PROXY_OWNER_GAS,
  UPDATE_PROXY_IMPLEMENTATION_GAS,
} from '../../../core/Constants.js';
import LogService from '../../../app/service/LogService.js';
import { TransactionResponseError } from '../error/TransactionResponseError.js';
import NetworkService from '../../../app/service/NetworkService.js';

export abstract class HederaTransactionAdapter extends TransactionAdapter {
  private web3 = new Web3();

  constructor(
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    public readonly networkService: NetworkService,
  ) {
    super();
  }
}

class Params {
  proxy?: HederaId;
  role?: string;
  targetId?: HederaId;
  amount?: BigDecimal;
  reserveAddress?: ContractId;
  customFees?: HCustomFee[];
  roles?: string[];
  targetsId?: HederaId[];
  amounts?: BigDecimal[];
  name?: string;
  symbol?: string;
  autoRenewPeriod?: number;
  expirationTime?: number;
  kycKey?: PublicKey;
  freezeKey?: PublicKey;
  feeScheduleKey?: PublicKey;
  pauseKey?: PublicKey;
  wipeKey?: PublicKey;
  supplyKey?: PublicKey;
  metadata?: string;

  constructor({
    proxy,
    role,
    targetId,
    amount,
    reserveAddress,
    customFees,
    roles,
    targetsId,
    amounts,
    name,
    symbol,
    autoRenewPeriod,
    expirationTime,
    kycKey,
    freezeKey,
    feeScheduleKey,
    pauseKey,
    wipeKey,
    supplyKey,
    metadata,
  }: {
    proxy?: HederaId;
    role?: string;
    targetId?: HederaId;
    amount?: BigDecimal;
    reserveAddress?: ContractId;
    customFees?: HCustomFee[];
    roles?: string[];
    targetsId?: HederaId[];
    amounts?: BigDecimal[];
    name?: string;
    symbol?: string;
    autoRenewPeriod?: number;
    expirationTime?: number;
    kycKey?: PublicKey;
    freezeKey?: PublicKey;
    feeScheduleKey?: PublicKey;
    pauseKey?: PublicKey;
    wipeKey?: PublicKey;
    supplyKey?: PublicKey;
    metadata?: string;
  }) {
    this.proxy = proxy;
    this.role = role;
    this.targetId = targetId;
    this.amount = amount;
    this.reserveAddress = reserveAddress;
    this.customFees = customFees;
    this.roles = roles;
    this.targetsId = targetsId;
    this.amounts = amounts;
    this.name = name;
    this.symbol = symbol;
    this.autoRenewPeriod = autoRenewPeriod;
    this.expirationTime = expirationTime;
    this.kycKey = kycKey;
    this.freezeKey = freezeKey;
    this.feeScheduleKey = feeScheduleKey;
    this.pauseKey = pauseKey;
    this.wipeKey = wipeKey;
    this.supplyKey = supplyKey;
    this.metadata = metadata;
  }
}
