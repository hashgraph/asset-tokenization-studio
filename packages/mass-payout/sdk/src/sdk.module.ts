// SPDX-License-Identifier: Apache-2.0

import { Module } from "@nestjs/common";
import { DFNSTransactionAdapter } from "@port/out/hs/hts/custodial/DFNSTransactionAdapter";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EventService from "@app/services/event/EventService";
import NetworkService from "@app/services/network/NetworkService";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import { Event } from "@port/in/event/Event";
import { Network } from "@port/in/network/Network";
import { LifeCycleCashFlow } from "@port/in/lifeCycleCashFlow/LifeCycleCashFlow";
import { ICommandHandler } from "@core/command/CommandHandler";
import { IQueryHandler } from "@core/query/QueryHandler";
import { TOKENS } from "@core/Constants";
import { CommandBus } from "@core/command/CommandBus";
import { QueryBus } from "@core/query/QueryBus";
import { IsPausedQueryHandler } from "@app/usecase/query/lifeCycleCashFlow/isPaused/IsPausedQueryHandler";
import { GetPaymentTokenQueryHandler } from "@app/usecase/query/lifeCycleCashFlow/getPaymentToken/GetPaymentTokenQueryHandler";
import { GetPaymentTokenDecimalsQueryHandler } from "@app/usecase/query/lifeCycleCashFlow/getPaymentTokenDecimals/GetPaymentTokenDecimalsQueryHandler";
import { DeployCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/deploy/DeployCommandHandler";
import { PauseCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/pause/PauseCommandHandler";
import { UnpauseCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/unpause/UnpauseCommandHandler";
import { ExecuteDistributionCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/executeDistribution/ExecuteDistributionCommandHandler";
import { ExecuteDistributionByAddressesCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/executeDistributionByAddresses/ExecuteDistributionByAddressesCommandHandler";
import { ExecuteBondCashOutCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/executeBondCashOut/ExecuteBondCashOutCommandHandler";
import { ExecuteBondCashOutByAddressesCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/executeBondCashOutByAddresses/ExecuteBondCashOutByAddressesCommandHandler";
import { ExecuteAmountSnapshotCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/executeAmountSnapshot/ExecuteAmountSnapshotCommandHandler";
import { ExecuteAmountSnapshotByAddressesCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/executeAmountSnapshotByAddresses/ExecuteAmountSnapshotByAddressesCommandHandler";
import { ExecutePercentageSnapshotCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/executePercentageSnapshot/ExecutePercentageSnapshotCommandHandler";
import { ExecutePercentageSnapshotByAddressesCommandHandler } from "@app/usecase/command/lifeCycleCashFlow/operations/executePercentageSnapshotByAddresses/ExecutePercentageSnapshotByAddressesCommandHandler";

const commandHandlerProviders = [
  DeployCommandHandler,
  PauseCommandHandler,
  UnpauseCommandHandler,
  ExecuteDistributionCommandHandler,
  ExecuteDistributionByAddressesCommandHandler,
  ExecuteBondCashOutCommandHandler,
  ExecuteBondCashOutByAddressesCommandHandler,
  ExecuteAmountSnapshotCommandHandler,
  ExecuteAmountSnapshotByAddressesCommandHandler,
  ExecutePercentageSnapshotCommandHandler,
  ExecutePercentageSnapshotByAddressesCommandHandler,
];

const queryHandlerProviders = [IsPausedQueryHandler, GetPaymentTokenQueryHandler, GetPaymentTokenDecimalsQueryHandler];

@Module({
  providers: [
    {
      provide: "NetworkProps",
      useValue: {
        environment: "testnet",
        mirrorNode: {
          name: "default",
          baseUrl: "https://testnet.mirrornode.hedera.com",
        },
        rpcNode: {
          name: "default",
          baseUrl: "https://testnet.hashio.io/api",
        },
      },
    },
    ...commandHandlerProviders,
    {
      provide: TOKENS.COMMAND_HANDLER,
      inject: [
        DeployCommandHandler,
        PauseCommandHandler,
        UnpauseCommandHandler,
        ExecuteDistributionCommandHandler,
        ExecuteDistributionByAddressesCommandHandler,
        ExecuteBondCashOutCommandHandler,
        ExecuteBondCashOutByAddressesCommandHandler,
        ExecuteAmountSnapshotCommandHandler,
        ExecuteAmountSnapshotByAddressesCommandHandler,
        ExecutePercentageSnapshotCommandHandler,
        ExecutePercentageSnapshotByAddressesCommandHandler,
      ],
      useFactory: (...handlers: ICommandHandler<any>[]) => handlers,
    },
    ...queryHandlerProviders,
    {
      provide: TOKENS.QUERY_HANDLER,
      inject: [IsPausedQueryHandler, GetPaymentTokenQueryHandler, GetPaymentTokenDecimalsQueryHandler],
      useFactory: (...handlers: IQueryHandler<any>[]) => handlers,
    },
    DFNSTransactionAdapter,
    MirrorNodeAdapter,
    RPCQueryAdapter,
    EventService,
    NetworkService,
    ContractService,
    TransactionService,
    CommandBus,
    QueryBus,
    Network,
    Event,
    LifeCycleCashFlow,
  ],
  exports: [
    DFNSTransactionAdapter,
    MirrorNodeAdapter,
    RPCQueryAdapter,
    EventService,
    NetworkService,
    ContractService,
    TransactionService,
    CommandBus,
    QueryBus,
    Network,
    Event,
    LifeCycleCashFlow,
  ],
})
export class MassPayoutSDK {}
