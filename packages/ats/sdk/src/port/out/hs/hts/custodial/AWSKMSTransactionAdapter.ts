// SPDX-License-Identifier: Apache-2.0

import {
  AWSKMSConfig,
  CustodialWalletService,
} from '@hashgraph/hedera-custodians-integration';
import { singleton } from 'tsyringe';
import LogService from '@service/log/LogService';
import { WalletEvents } from '@service/event/WalletEvent';
import { SupportedWallets } from '@domain/context/network/Wallet';
import { CustodialTransactionAdapter } from './CustodialTransactionAdapter';
import AWSKMSSettings from '@core/settings/custodialWalletSettings/AWSKMSSettings';

@singleton()
export class AWSKMSTransactionAdapter extends CustodialTransactionAdapter {
  init(): Promise<string> {
    this.eventService.emit(WalletEvents.walletInit, {
      wallet: SupportedWallets.AWSKMS,
      initData: {},
    });
    LogService.logTrace('AWS KMS Initialized');
    return Promise.resolve(this.networkService.environment);
  }

  initCustodialWalletService(settings: AWSKMSSettings): void {
    this.custodialWalletService = new CustodialWalletService(
      new AWSKMSConfig(
        settings.awsAccessKeyId,
        settings.awsSecretAccessKey,
        settings.awsRegion,
        settings.awsKmsKeyId,
      ),
    );
  }

  getSupportedWallet(): SupportedWallets {
    return SupportedWallets.AWSKMS;
  }

  stop(): Promise<boolean> {
    this.client?.close();
    LogService.logTrace('AWS KMS stopped');
    this.eventService.emit(WalletEvents.walletDisconnect, {
      wallet: SupportedWallets.AWSKMS,
    });
    return Promise.resolve(true);
  }
}
