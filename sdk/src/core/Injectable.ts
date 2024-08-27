import {
  registry,
  container,
  InjectionToken,
  ValueProvider,
  DependencyContainer,
  delay,
} from 'tsyringe';

import { SetDividendsCommandHandler } from '../app/usecase/command/equity/dividends/set/SetDividendsCommandHandler.js';
import { SetCouponCommandHandler } from '../app/usecase/command/bond/coupon/set/SetCouponCommandHandler.js';
import { SetVotingRightsCommandHandler } from '../app/usecase/command/equity/votingRights/set/SetVotingRightsCommandHandler.js';
import { GetSecurityQueryHandler } from '../app/usecase/query/security/get/GetSecurityQueryHandler.js';
import { GetAccountBalanceQueryHandler } from '../app/usecase/query/account/balance/GetAccountBalanceQueryHandler.js';
import { RPCTransactionAdapter } from '../port/out/rpc/RPCTransactionAdapter.js';
import { Constructor } from './Type.js';
import { CreateEquityCommandHandler } from '../app/usecase/command/equity/create/CreateEquityCommandHandler.js';
import { CreateBondCommandHandler } from '../app/usecase/command/bond/create/CreateBondCommandHandler.js';
import { IssueCommandHandler } from '../app/usecase/command/security/operations/issue/IssueCommandHandler.js';
import { RedeemCommandHandler } from '../app/usecase/command/security/operations/redeem/RedeemCommandHandler.js';
import { TransferCommandHandler } from '../app/usecase/command/security/operations/transfer/TransferCommandHandler.js';
import { TransferAndLockCommandHandler } from '../app/usecase/command/security/operations/transfer/TransferAndLockCommandHandler.js';
import { AddToControlListCommandHandler } from '../app/usecase/command/security/operations/AddToControlList/AddToControlListCommandHandler.js';
import { PauseCommandHandler } from '../app/usecase/command/security/operations/pause/PauseCommandHandler.js';
import { RemoveFromControlListCommandHandler } from '../app/usecase/command/security/operations/removeFromControlList/RemoveFromControlListCommandHandler.js';
import { UnpauseCommandHandler } from '../app/usecase/command/security/operations/unpause/UnpauseCommandHandler.js';
import { ControllerRedeemCommandHandler } from '../app/usecase/command/security/operations/redeem/ControllerRedeemCommandHandler.js';
import { ControllerTransferCommandHandler } from '../app/usecase/command/security/operations/transfer/ControllerTransferCommandHandler.js';
import { GrantRoleCommandHandler } from '../app/usecase/command/security/roles/grantRole/GrantRoleCommandHandler.js';
import { ApplyRolesCommandHandler } from '../app/usecase/command/security/roles/applyRoles/ApplyRolesCommandHandler.js';
import { HasRoleQueryHandler } from '../app/usecase/query/security/roles/hasRole/HasRoleQueryHandler.js';
import { RevokeRoleCommandHandler } from '../app/usecase/command/security/roles/revokeRole/RevokeRoleCommandHandler.js';
import { ConnectCommandHandler } from '../app/usecase/command/network/connect/ConnectCommandHandler.js';
import { DisconnectCommandHandler } from '../app/usecase/command/network/disconnect/DisconnectCommandHandler.js';
import { GetAccountInfoQueryHandler } from '../app/usecase/query/account/info/GetAccountInfoQueryHandler.js';
import { SetNetworkCommandHandler } from '../app/usecase/command/network/setNetwork/SetNetworkCommandHandler.js';
import { SetConfigurationCommandHandler } from '../app/usecase/command/network/setConfiguration/SetConfigurationCommandHandler.js';
import { SetMaxSupplyCommandHandler } from '../app/usecase/command/security/operations/cap/SetMaxSupplyCommandHandler.js';
import { GetRegulationDetailsQueryHandler } from '../app/usecase/query/factory/get/GetRegulationDetailsQueryHandler.js';
import { LockedBalanceOfQueryHandler } from '../app/usecase/query/security/lockedBalanceOf/LockedBalanceOfQueryHandler.js';
import { LockCommandHandler } from '../app/usecase/command/security/operations/lock/LockCommandHandler.js';
import { ReleaseCommandHandler } from '../app/usecase/command/security/operations/release/ReleaseCommandHandler.js';
import { LockCountQueryHandler } from '../app/usecase/query/security/lockCount/LockCountQueryHandler.js';
import { GetLockQueryHandler } from '../app/usecase/query/security/getLock/GetLockQueryHandler.js';
import { LocksIdQueryHandler } from '../app/usecase/query/security/locksId/LocksIdQueryHandler.js';

import { WalletEvents } from '../app/service/event/WalletEvent.js';
import { CommandHandlerType } from './command/CommandBus.js';
import { QueryHandlerType } from './query/QueryBus.js';
import { NetworkProps } from '../app/service/NetworkService.js';
// eslint-disable-next-line jest/no-mocks-import
import { ConcreteQueryHandler } from '../../__tests__/core/command/__mocks__/ConcreteQueryHandler.js';
// eslint-disable-next-line jest/no-mocks-import
import { ConcreteCommandHandler } from '../../__tests__/core/command/__mocks__/ConcreteCommandHandler.js';
import TransactionAdapter from '../port/out/TransactionAdapter.js';
import { RuntimeError } from './error/RuntimeError.js';
import { BalanceOfQueryHandler } from '../app/usecase/query/security/balanceof/BalanceOfQueryHandler.js';
import { GetAccountSecurityRelationshipQueryHandler } from '../app/usecase/query/account/securityRelationship/GetAccountSecurityRelationshipQueryHandler.js';
import { IsPausedQueryHandler } from '../app/usecase/query/security/isPaused/IsPausedQueryHandler';
import { GetDividendsQueryHandler } from '../app/usecase/query/equity/dividends/getDividends/GetDividendsQueryHandler.js';
import { GetDividendsCountQueryHandler } from '../app/usecase/query/equity/dividends/getDividendsCount/GetDividendsCountQueryHandler.js';
import { GetDividendsForQueryHandler } from '../app/usecase/query/equity/dividends/getDividendsFor/GetDividendsForQueryHandler.js';
import { GetVotingQueryHandler } from '../app/usecase/query/equity/votingRights/getVoting/GetVotingQueryHandler.js';
import { GetVotingCountQueryHandler } from '../app/usecase/query/equity/votingRights/getVotingCount/GetVotingCountQueryHandler.js';
import { GetVotingForQueryHandler } from '../app/usecase/query/equity/votingRights/getVotingFor/GetVotingForQueryHandler.js';
import { GetControlListCountQueryHandler } from '../app/usecase/query/security/controlList/getControlListCount/GetControlListCountQueryHandler.js';
import { GetControlListMembersQueryHandler } from '../app/usecase/query/security/controlList/getControlListMembers/GetControlListMembersQueryHandler.js';
import { GetRoleCountForQueryHandler } from '../app/usecase/query/security/roles/getRoleCountFor/GetRoleCountForQueryHandler.js';
import { GetRoleMemberCountQueryHandler } from '../app/usecase/query/security/roles/getRoleMemberCount/GetRoleMemberCountQueryHandler.js';
import { GetRoleMembersQueryHandler } from '../app/usecase/query/security/roles/getRoleMembers/GetRoleMembersQueryHandler.js';
import { GetRolesForQueryHandler } from '../app/usecase/query/security/roles/getRolesFor/GetRolesForQueryHandler.js';
import { IsInControlListQueryHandler } from '../app/usecase/query/account/controlList/IsInControlListQueryHandler.js';
import { GetControlListTypeQueryHandler } from '../app/usecase/query/security/controlList/getControlListType/GetControlListTypeQueryHandler.js';
import { GetBondDetailsQueryHandler } from '../app/usecase/query/bond/get/getBondDetails/GetBondDetailsQueryHandler.js';
import { GetEquityDetailsQueryHandler } from '../app/usecase/query/equity/get/getEquityDetails/GetEquityDetailsQueryHandler.js';
import { GetCouponDetailsQueryHandler } from '../app/usecase/query/bond/get/getCouponDetails/GetCouponDetailsQueryHandler.js';
import { GetCouponQueryHandler } from '../app/usecase/query/bond/coupons/getCoupon/GetCouponQueryHandler.js';
import { GetCouponCountQueryHandler } from '../app/usecase/query/bond/coupons/getCouponCount/GetCouponCountQueryHandler.js';
import { GetCouponForQueryHandler } from '../app/usecase/query/bond/coupons/getCouponFor/GetCouponForQueryHandler.js';
import { GetMaxSupplyQueryHandler } from '../app/usecase/query/security/cap/GetMaxSupplyQueryHandler.js';

import { SDK } from '../port/in/Common.js';
import { HashpackTransactionAdapter } from '../port/out/hs/hashpack/HashpackTransactionAdapter.js';

export const TOKENS = {
  COMMAND_HANDLER: Symbol('CommandHandler'),
  QUERY_HANDLER: Symbol('QueryHandler'),
  TRANSACTION_HANDLER: 'TransactionHandler',
};

const COMMAND_HANDLERS = [
  // Mock
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ConcreteCommandHandler,
  },
  // Security Creation
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CreateEquityCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CreateBondCommandHandler,
  },
  // Security Operations
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: IssueCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RedeemCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: TransferCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: TransferAndLockCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ControllerRedeemCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ControllerTransferCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: PauseCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: UnpauseCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: LockCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ReleaseCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: GrantRoleCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ApplyRolesCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RevokeRoleCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: AddToControlListCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RemoveFromControlListCommandHandler,
  },
  // Bond Operations
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetCouponCommandHandler,
  },
  // Equity Operations
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetDividendsCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetVotingRightsCommandHandler,
  },
  // Network Operations
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ConnectCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: DisconnectCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetNetworkCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetConfigurationCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetMaxSupplyCommandHandler,
  },
];

const QUERY_HANDLERS = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: ConcreteQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetAccountInfoQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetSecurityQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetRegulationDetailsQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: LockedBalanceOfQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetLockQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: LocksIdQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: LockCountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetAccountBalanceQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: BalanceOfQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: HasRoleQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetRoleCountForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetRolesForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetRoleMemberCountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetRoleMembersQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetControlListCountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetControlListMembersQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetDividendsForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetDividendsQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetDividendsCountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetVotingForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetVotingQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetVotingCountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetAccountSecurityRelationshipQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsPausedQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsInControlListQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetControlListTypeQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetBondDetailsQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetEquityDetailsQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetCouponDetailsQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetCouponForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetCouponQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetCouponCountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetMaxSupplyQueryHandler,
  },
];

const TRANSACTION_HANDLER = [
  {
    token: TOKENS.TRANSACTION_HANDLER,
    useClass: RPCTransactionAdapter,
  },
  {
    token: TOKENS.TRANSACTION_HANDLER,
    useClass: HashpackTransactionAdapter,
  },
];

const defaultNetworkProps: NetworkProps = {
  environment: 'testnet',
  mirrorNode: {
    name: 'default',
    baseUrl: 'https://testnet.mirrornode.hedera.com',
  },
  rpcNode: {
    name: 'default',
    baseUrl: 'https://testnet.hashio.io/api',
  },
};

// Network default props
container.register<NetworkProps>('NetworkProps', {
  useValue: defaultNetworkProps,
});

// Wallet events
container.register<typeof WalletEvents>('WalletEvents', {
  useValue: WalletEvents,
});

// SDK Logs
container.register<typeof SDK>('SDK', {
  useValue: SDK,
});

@registry([...COMMAND_HANDLERS, ...QUERY_HANDLERS, ...TRANSACTION_HANDLER])
export default class Injectable {
  static readonly TOKENS = TOKENS;

  private static currentTransactionHandler: TransactionAdapter;

  static resolve<T = unknown>(cls: InjectionToken<T>): T {
    return container.resolve(cls);
  }

  static lazyResolve<T = unknown>(cls: Constructor<T>): T {
    return container.resolve(delay(() => cls));
  }

  static getQueryHandlers(): QueryHandlerType[] {
    return container.resolveAll<QueryHandlerType>(TOKENS.QUERY_HANDLER);
  }

  static getCommandHandlers(): CommandHandlerType[] {
    return container.resolveAll<CommandHandlerType>(TOKENS.COMMAND_HANDLER);
  }

  static register<T = unknown>(
    token: InjectionToken<T>,
    value: ValueProvider<T>,
  ): DependencyContainer {
    return container.register(token, value);
  }

  static registerCommandHandler<T = unknown>(
    cls: ValueProvider<T>,
  ): DependencyContainer {
    return container.register(TOKENS.COMMAND_HANDLER, cls);
  }

  static registerTransactionHandler<T extends TransactionAdapter>(
    cls: T,
  ): boolean {
    if (this.currentTransactionHandler) this.currentTransactionHandler.stop();
    this.currentTransactionHandler = cls;
    return true;
  }

  static resolveTransactionHandler(): TransactionAdapter {
    if (!this.currentTransactionHandler) {
      throw new RuntimeError('No Transaction Handler registered!');
    } else {
      return this.currentTransactionHandler;
    }
  }

  static registerTransactionAdapterInstances(): TransactionAdapter[] {
    const adapters: TransactionAdapter[] = [];
    adapters.push(Injectable.resolve(RPCTransactionAdapter));
    adapters.push(Injectable.resolve(HashpackTransactionAdapter));
    return adapters;
  }

  static isWeb(): boolean {
    return !!global.window;
  }
}
