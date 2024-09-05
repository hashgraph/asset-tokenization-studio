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

export const COMMAND_METADATA = '__command__';
export const COMMAND_HANDLER_METADATA = '__commandHandler__';
export const QUERY_METADATA = '__query__';
export const QUERY_HANDLER_METADATA = '__queryHandler__';
export const TOKEN_CREATION_COST_HBAR = 80;
export const EVM_ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const HBAR_DECIMALS = 8;
export const CREATE_EQUITY_ST_GAS = 15000000;
export const CREATE_BOND_ST_GAS = 15000000;
export const CASHIN_GAS = 1200000;
export const BURN_GAS = 700000;
export const WIPE_GAS = 700000;
export const RESCUE_GAS = 700000;
export const RESCUE_HBAR_GAS = 700000;
export const FREEZE_GAS = 650000;
export const UNFREEZE_GAS = 650000;
export const GRANT_KYC_GAS = 650000;
export const REVOKE_KYC_GAS = 650000;
export const REDEEM_GAS = 650000;
export const PAUSE_GAS = 15000000;
export const UNPAUSE_GAS = 650000;
export const TAKE_SNAPSHOT_GAS = 2000000;
export const DELETE_GAS = 650000;
export const GRANT_ROLES_GAS = 2000000;
export const REVOKE_ROLES_GAS = 2000000;
export const RENOUNCE_ROLES_GAS = 2000000;
export const MAX_ROLES_GAS = 15000000;
export const INCREASE_SUPPLY_GAS = 500000;
export const DECREASE_SUPPLY_GAS = 500000;
export const RESET_SUPPLY_GAS = 450000;
export const UPDATE_RESERVE_ADDRESS_GAS = 450000;
export const UPDATE_TOKEN_GAS = 1400000;
export const UPDATE_RESERVE_AMOUNT_GAS = 400000;
export const CHANGE_PROXY_OWNER_GAS = 500000;
export const ACCEPT_PROXY_OWNER_GAS = 400000;
export const UPDATE_PROXY_IMPLEMENTATION_GAS = 400000;
export const ISSUE_GAS = 7000000;
export const CONTROLLER_TRANSFER_GAS = 7000000;
export const CONTROLLER_REDEEM_GAS = 7000000;
export const SET_DIVIDENDS_GAS = 7000000;
export const SET_VOTING_RIGHTS_GAS = 7000000;
export const SET_COUPON_GAS = 7000000;
export const SET_DOCUMENT_GAS = 7000000;
export const REMOVE_DOCUMENT_GAS = 7000000;
export const AUTHORIZE_OPERATOR_GAS = 7000000;
export const REVOKE_OPERATOR_GAS = 7000000;
export const TRANSFER_OPERATOR_GAS = 7000000;
export const TRIGGER_PENDING_SCHEDULED_SNAPSHOTS_GAS = 7000000;
export const SET_MAX_SUPPLY_GAS = 7000000;

export const BALANCE_OF_GAS = 1200000;
export const GET_RESERVE_ADDRESS_GAS = 1200000;
export const GET_RESERVE_AMOUNT_GAS = 1200000;
export const GET_ROLES_GAS = 1200000;
export const HAS_ROLE_GAS = 1200000;
export const GET_SUPPLY_ALLOWANCE_GAS = 1200000;
export const IS_UNLIMITED_ALLOWANCE_GAS = 1200000;

export const TRANSFER_GAS = 1200000;
export const TRANSFER_AND_LOCK_GAS = 1200000;

export const ADD_TO_CONTROL_LIST_GAS = 1200000;
export const REMOVE_FROM_CONTROL_LIST_GAS = 1200000;

export const LOCK_GAS = 7000000;
export const RELEASE_GAS = 7000000;

export const _PARTITION_ID_1 =
  '0x0000000000000000000000000000000000000000000000000000000000000001';

export const SET_DIVIDEND_EVENT = 'DividendSet';
export const SET_VOTING_RIGHTS_EVENT = 'VotingSet';
export const SET_COUPON_EVENT = 'CouponSet';
