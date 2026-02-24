// SPDX-License-Identifier: Apache-2.0

import { CustodialWalletService, FireblocksConfig } from "@hashgraph/hedera-custodians-integration";
import { singleton } from "tsyringe";
import { WalletEvents } from "@service/event/WalletEvent";
import LogService from "@service/log/LogService";
import { SupportedWallets } from "@domain/context/network/Wallet";
import FireblocksSettings from "@core/settings/custodialWalletSettings/FireblocksSettings";

import { CustodialTransactionAdapter } from "./CustodialTransactionAdapter";

@singleton()
export class FireblocksTransactionAdapter extends CustodialTransactionAdapter {
  init(): Promise<string> {
    this.eventService.emit(WalletEvents.walletInit, {
      wallet: this.getSupportedWallet(),
      initData: {},
    });
    LogService.logTrace("Fireblocks Initialized");
    return Promise.resolve(this.networkService.environment);
  }

  initCustodialWalletService(settings: FireblocksSettings): void {
    const { apiKey, apiSecretKey, baseUrl, vaultAccountId, assetId } = settings;
    this.custodialWalletService = new CustodialWalletService(
      new FireblocksConfig(apiKey, apiSecretKey, baseUrl, vaultAccountId, assetId),
    );
  }

  getSupportedWallet(): SupportedWallets {
    return SupportedWallets.FIREBLOCKS;
  }

  stop(): Promise<boolean> {
    this.client?.close();
    LogService.logTrace("Fireblocks stopped");
    this.eventService.emit(WalletEvents.walletDisconnect, {
      wallet: SupportedWallets.FIREBLOCKS,
    });
    return Promise.resolve(true);
  }
}
