// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common";
import { CustodialWalletService, DFNSConfig } from "@hashgraph/hedera-custodians-integration";
import { WalletEvents } from "@app/services/event/WalletEvent";
import { SupportedWallets } from "@domain/network/Wallet";
import EventService from "@app/services/event/EventService";
import { MirrorNodeAdapter } from "../../../mirror/MirrorNodeAdapter";
import NetworkService from "@app/services/network/NetworkService";
import { CustodialTransactionAdapter } from "./CustodialTransactionAdapter";
import DfnsSettings from "@core/settings/custodialWalletSettings/DfnsSettings";

@Injectable()
export class DFNSTransactionAdapter extends CustodialTransactionAdapter {
  constructor(
    protected readonly eventService: EventService,
    protected readonly mirrorNodeAdapter: MirrorNodeAdapter,
    protected readonly networkService: NetworkService,
  ) {
    super(eventService, mirrorNodeAdapter, networkService);
  }

  init(): Promise<string> {
    this.eventService.emit(WalletEvents.walletInit, {
      wallet: SupportedWallets.DFNS,
      initData: {},
    });
    this.logger.log("DFNS Initialized");
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
    this.logger.log("DFNS stopped");
    this.eventService.emit(WalletEvents.walletDisconnect, {
      wallet: SupportedWallets.DFNS,
    });
    return Promise.resolve(true);
  }
}
