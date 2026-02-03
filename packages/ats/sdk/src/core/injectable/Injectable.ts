// SPDX-License-Identifier: Apache-2.0

import { registry, container, InjectionToken, ValueProvider, DependencyContainer, delay } from "tsyringe";
import { RPCTransactionAdapter } from "@port/out/rpc/RPCTransactionAdapter";
import { Constructor } from "../Type";
import { WalletEvents } from "@service/event/WalletEvent";
import { CommandHandlerType } from "../command/CommandBus";
import { QueryHandlerType } from "../query/QueryBus";
import { NetworkProps } from "@service/network/NetworkService";
import TransactionAdapter from "@port/out/TransactionAdapter";
import { RuntimeError } from "../error/RuntimeError";
import { SDK } from "@port/in/Common";
import { HederaWalletConnectTransactionAdapter } from "@port/out/hs/hederawalletconnect/HederaWalletConnectTransactionAdapter";
import { DFNSTransactionAdapter } from "@port/out/hs/hts/custodial/DFNSTransactionAdapter";
import { FireblocksTransactionAdapter } from "@port/out/hs/hts/custodial/FireblocksTransactionAdapter";
import { AWSKMSTransactionAdapter } from "@port/out/hs/hts/custodial/AWSKMSTransactionAdapter";
import { TOKENS } from "./Tokens";
import { COMMAND_HANDLERS, QUERY_HANDLERS, TRANSACTION_HANDLER } from "./Handlers";

const defaultNetworkProps: NetworkProps = {
  environment: "testnet",
  mirrorNode: {
    name: "default",
    baseUrl: "https://testnet.mirrornode.hedera.com",
  },
  rpcNode: {
    name: "default",
    baseUrl: "https://testnet.hashio.io/api",
  },
};

// Network default props
container.register<NetworkProps>("NetworkProps", {
  useValue: defaultNetworkProps,
});

// Wallet events
container.register<typeof WalletEvents>("WalletEvents", {
  useValue: WalletEvents,
});

// SDK Logs
container.register<typeof SDK>("SDK", {
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

  static register<T = unknown>(token: InjectionToken<T>, value: ValueProvider<T>): DependencyContainer {
    return container.register(token, value);
  }

  static registerCommandHandler<T = unknown>(cls: ValueProvider<T>): DependencyContainer {
    return container.register(TOKENS.COMMAND_HANDLER, cls);
  }

  static registerTransactionHandler<T extends TransactionAdapter>(cls: T): boolean {
    if (this.currentTransactionHandler) this.currentTransactionHandler.stop();
    this.currentTransactionHandler = cls;
    return true;
  }

  static resolveTransactionHandler(): TransactionAdapter {
    if (!this.currentTransactionHandler) {
      throw new RuntimeError("No Transaction Handler registered!");
    } else {
      return this.currentTransactionHandler;
    }
  }

  static registerTransactionAdapterInstances(): TransactionAdapter[] {
    const adapters: TransactionAdapter[] = [];
    if (this.isWeb()) {
      adapters.push(
        Injectable.resolve(RPCTransactionAdapter),
        Injectable.resolve(HederaWalletConnectTransactionAdapter),
      );
    }
    adapters.push(
      Injectable.resolve(DFNSTransactionAdapter),
      Injectable.resolve(FireblocksTransactionAdapter),
      Injectable.resolve(AWSKMSTransactionAdapter),
    );
    return adapters;
  }

  static isWeb(): boolean {
    return !!global.window;
  }
}
