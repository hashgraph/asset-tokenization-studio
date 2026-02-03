// SPDX-License-Identifier: Apache-2.0

import { CustodialWalletService, DFNSConfig } from "@hashgraph/hedera-custodians-integration";
import { singleton } from "tsyringe";
import { WalletEvents } from "@service/event/WalletEvent";
import { SupportedWallets } from "@domain/context/network/Wallet";
import { CustodialTransactionAdapter } from "./CustodialTransactionAdapter";
import LogService from "@service/log/LogService";
import DfnsSettings from "@core/settings/custodialWalletSettings/DfnsSettings";

@singleton()
export class DFNSTransactionAdapter extends CustodialTransactionAdapter {
  init(): Promise<string> {
    this.eventService.emit(WalletEvents.walletInit, {
      wallet: SupportedWallets.DFNS,
      initData: {},
    });
    LogService.logTrace("DFNS Initialized");
    return Promise.resolve(this.networkService.environment);
  }

  initCustodialWalletService(settings: DfnsSettings): void {
    this.custodialWalletService = new CustodialWalletService(
      new DFNSConfig(
        settings.serviceAccountSecretKey,
        settings.serviceAccountCredentialId,
        settings.serviceAccountAuthToken,
        settings.appOrigin,
        settings.appId,
        settings.baseUrl,
        settings.walletId,
        settings.publicKey,
      ),
    );
  }

  getSupportedWallet(): SupportedWallets {
    return SupportedWallets.DFNS;
  }

  stop(): Promise<boolean> {
    this.client?.close();
    LogService.logTrace("DFNS stopped");
    this.eventService.emit(WalletEvents.walletDisconnect, {
      wallet: SupportedWallets.DFNS,
    });
    return Promise.resolve(true);
  }
}
