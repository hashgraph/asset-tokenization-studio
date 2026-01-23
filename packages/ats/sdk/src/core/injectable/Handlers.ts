// SPDX-License-Identifier: Apache-2.0

import { RPCTransactionAdapter } from "@port/out/rpc/RPCTransactionAdapter";
import { HederaWalletConnectTransactionAdapter } from "@port/out/hs/hederawalletconnect/HederaWalletConnectTransactionAdapter";
import { DFNSTransactionAdapter } from "@port/out/hs/hts/custodial/DFNSTransactionAdapter";
import { FireblocksTransactionAdapter } from "@port/out/hs/hts/custodial/FireblocksTransactionAdapter";
import { AWSKMSTransactionAdapter } from "@port/out/hs/hts/custodial/AWSKMSTransactionAdapter";
import { COMMAND_HANDLERS_AGENT } from "./agent/InjectableAgent";
import { COMMAND_HANDLERS_BOND, QUERY_HANDLERS_BOND } from "./bond/InjectableBond";
import { COMMAND_HANDLERS_CLEARING, QUERY_HANDLERS_CLEARING } from "./clearing/InjectableClearing";
import { COMMAND_HANDLERS_COMPLIANCE, QUERY_HANDLERS_COMPLIANCE } from "./compliance/InjectableCompliance";
import { COMMAND_HANDLERS_CONTROL_LIST, QUERY_HANDLERS_CONTROL_LIST } from "./controlList/InjectableControlList";
import { COMMAND_HANDLERS_EQUITY, QUERY_HANDLERS_EQUITY } from "./equity/InjectableEquity";
import { COMMAND_HANDLERS_FREEZE, QUERY_HANDLERS_FREEZE } from "./freeze/InjectableFreeze";
import { COMMAND_HANDLERS_HOLD, QUERY_HANDLERS_HOLD } from "./hold/InjectableHold";
import { COMMAND_HANDLERS_IDENTITY, QUERY_HANDLERS_IDENTITY } from "./identity/InjectableIdentity";
import { COMMAND_HANDLERS_ISSUE } from "./issue/InjectableIssue";
import { COMMAND_HANDLERS_KYC, QUERY_HANDLERS_KYC } from "./kyc/InjectableKyc";
import { COMMAND_HANDLERS_LOCK, QUERY_HANDLERS_LOCK } from "./lock/InjectableLock";
import { COMMAND_HANDLERS_MOCK, QUERY_HANDLERS_MOCK } from "./mock/InjectableMock";
import { COMMAND_HANDLERS_NETWORK } from "./network/InjectableNetwork";
import { COMMAND_HANDLERS_PAUSE, QUERY_HANDLERS_PAUSE } from "./pause/InjectablePause";
import { COMMAND_HANDLERS_PROTECTED, QUERY_HANDLERS_PROTECTED } from "./protectedPartitions/InjectableProtected";
import { COMMAND_HANDLERS_RBAC, QUERY_HANDLERS_RBAC } from "./rbac/InjectableRbac";
import { COMMAND_HANDLERS_RECOVERY, QUERY_HANDLERS_RECOVERY } from "./recovery/InjectableRecovery";
import { COMMAND_HANDLERS_REDEEM, QUERY_HANDLERS_REDEEM } from "./redeem/InjectableRedeem";
import { COMMAND_HANDLERS_RESOLVER, QUERY_HANDLERS_RESOLVER } from "./resolver/InjectableResolver";
import { COMMAND_HANDLERS_METADATA } from "./security/InjectableMetadata";
import { COMMAND_HANDLERS_SNAPSHOT, QUERY_HANDLERS_SNAPSHOT } from "./snapshot/InjectableSnapshot";
import { COMMAND_HANDLERS_SUPPLY, QUERY_HANDLERS_SUPPLY } from "./supply/InjectableSupply";
import { COMMAND_HANDLERS_TRANSFER, QUERY_HANDLERS_TRANSFER } from "./transfer/InjectableTransfer";
import { TOKENS } from "./Tokens";
import { QUERY_HANDLERS_SECURITY_DETAILS } from "./security/InjectableSecurityDetails";
import { COMMAND_HANDLERS_BALANCE, QUERY_HANDLERS_BALANCE } from "./balance/InjectableBalance";
import { QUERY_HANDLERS_ACCOUNT } from "./account/InjectableAccount";
import { QUERY_HANDLERS_OPERATOR } from "./operator/InjectableOperator";
import { COMMAND_HANDLERS_TREX_FACTORY, QUERY_HANDLERS_TREX_FACTORY } from "./trexFactory/InjectableTrexFactory";
import {
  QUERY_HANDLERS_PROCEED_RECIPIENT,
  COMMAND_HANDLERS_PROCEED_RECIPIENT,
} from "./proceedRecipient/ProceedRecipientInjectable";

export const COMMAND_HANDLERS = [
  ...COMMAND_HANDLERS_AGENT,
  ...COMMAND_HANDLERS_BOND,
  ...COMMAND_HANDLERS_CLEARING,
  ...COMMAND_HANDLERS_COMPLIANCE,
  ...COMMAND_HANDLERS_CONTROL_LIST,
  ...COMMAND_HANDLERS_EQUITY,
  ...COMMAND_HANDLERS_FREEZE,
  ...COMMAND_HANDLERS_HOLD,
  ...COMMAND_HANDLERS_IDENTITY,
  ...COMMAND_HANDLERS_ISSUE,
  ...COMMAND_HANDLERS_KYC,
  ...COMMAND_HANDLERS_LOCK,
  ...COMMAND_HANDLERS_MOCK,
  ...COMMAND_HANDLERS_NETWORK,
  ...COMMAND_HANDLERS_PAUSE,
  ...COMMAND_HANDLERS_PROTECTED,
  ...COMMAND_HANDLERS_RBAC,
  ...COMMAND_HANDLERS_RECOVERY,
  ...COMMAND_HANDLERS_REDEEM,
  ...COMMAND_HANDLERS_RESOLVER,
  ...COMMAND_HANDLERS_METADATA,
  ...COMMAND_HANDLERS_SNAPSHOT,
  ...COMMAND_HANDLERS_SUPPLY,
  ...COMMAND_HANDLERS_TRANSFER,
  ...COMMAND_HANDLERS_BALANCE,
  ...COMMAND_HANDLERS_TREX_FACTORY,
  ...COMMAND_HANDLERS_PROCEED_RECIPIENT,
];

export const QUERY_HANDLERS = [
  ...QUERY_HANDLERS_BOND,
  ...QUERY_HANDLERS_CLEARING,
  ...QUERY_HANDLERS_COMPLIANCE,
  ...QUERY_HANDLERS_CONTROL_LIST,
  ...QUERY_HANDLERS_EQUITY,
  ...QUERY_HANDLERS_FREEZE,
  ...QUERY_HANDLERS_HOLD,
  ...QUERY_HANDLERS_IDENTITY,
  ...QUERY_HANDLERS_KYC,
  ...QUERY_HANDLERS_LOCK,
  ...QUERY_HANDLERS_MOCK,
  ...QUERY_HANDLERS_PAUSE,
  ...QUERY_HANDLERS_RBAC,
  ...QUERY_HANDLERS_RECOVERY,
  ...QUERY_HANDLERS_REDEEM,
  ...QUERY_HANDLERS_RESOLVER,
  ...QUERY_HANDLERS_SUPPLY,
  ...QUERY_HANDLERS_PROTECTED,
  ...QUERY_HANDLERS_SECURITY_DETAILS,
  ...QUERY_HANDLERS_BALANCE,
  ...QUERY_HANDLERS_TRANSFER,
  ...QUERY_HANDLERS_ACCOUNT,
  ...QUERY_HANDLERS_OPERATOR,
  ...QUERY_HANDLERS_SNAPSHOT,
  ...QUERY_HANDLERS_TREX_FACTORY,
  ...QUERY_HANDLERS_PROCEED_RECIPIENT,
];

export const TRANSACTION_HANDLER = [
  {
    token: TOKENS.TRANSACTION_HANDLER,
    useClass: RPCTransactionAdapter,
  },
  {
    token: TOKENS.TRANSACTION_HANDLER,
    useClass: HederaWalletConnectTransactionAdapter,
  },
  {
    token: TOKENS.TRANSACTION_HANDLER,
    useClass: DFNSTransactionAdapter,
  },
  {
    token: TOKENS.TRANSACTION_HANDLER,
    useClass: FireblocksTransactionAdapter,
  },
  {
    token: TOKENS.TRANSACTION_HANDLER,
    useClass: AWSKMSTransactionAdapter,
  },
];
