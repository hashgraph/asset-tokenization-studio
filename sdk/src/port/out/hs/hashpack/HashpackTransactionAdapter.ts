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
import {
  Transaction,
  Signer,
  PublicKey as HPublicKey,
  LedgerId,
} from '@hashgraph/sdk';
import {
  HashConnect,
  HashConnectConnectionState,
  SessionData,
  DappMetadata,
} from 'hashconnect';
import { HashConnectSigner } from 'hashconnect/dist/signer.js';
import AccountId from 'hashconnect/node_modules/@hashgraph/sdk/lib/account/AccountId'; // TODO: Fix this
import { singleton } from 'tsyringe';
import { HederaTransactionAdapter } from '../HederaTransactionAdapter.js';
import Account from '../../../../domain/context/account/Account.js';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import Injectable from '../../../../core/Injectable.js';
import { SigningError } from '../error/SigningError.js';
import { HashpackTransactionResponseAdapter } from './HashpackTransactionResponseAdapter.js';
import LogService from '../../../../app/service/LogService.js';
import EventService from '../../../../app/service/event/EventService.js';
import { InitializationData } from '../../TransactionAdapter.js';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator.js';
import NetworkService from '../../../../app/service/NetworkService.js';
import { RuntimeError } from '../../../../core/error/RuntimeError.js';
import {
  ConnectionState,
  WalletEvents,
  WalletInitEvent,
} from '../../../../app/service/event/WalletEvent.js';
import { SupportedWallets } from '../../../in/request/ConnectRequest.js';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter.js';
import { HederaId } from '../../../../domain/context/shared/HederaId.js';
import { QueryBus } from '../../../../core/query/QueryBus.js';
import { AccountIdNotValid } from '../../../../domain/context/account/error/AccountIdNotValid.js';
import { GetAccountInfoQuery } from '../../../../app/usecase/query/account/info/GetAccountInfoQuery.js';
import { PairingError } from './error/PairingError.js';
import { TransactionType } from 'port/out/TransactionResponseEnums.js';

@singleton()
export class HashpackTransactionAdapter extends HederaTransactionAdapter {
  private appMetadata = {
    name: '<Your dapp name>',
    description: '<Your dapp description>',
    icons: ['<Image url>'],
    url: '<Dapp url>',
  } as DappMetadata;

  private hashConnect: HashConnect;
  private state: HashConnectConnectionState;
  private pairingData: SessionData | null;
  public account: Account;
  public signer: HashConnectSigner;

  constructor(
    @lazyInject(EventService)
    public readonly eventService: EventService,
    @lazyInject(NetworkService)
    public readonly networkService: NetworkService,
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(QueryBus)
    public readonly queryBus: QueryBus,
  ) {
    super(mirrorNodeAdapter, networkService);
    this.init();
  }

  async init(network?: string): Promise<string> {
    const currentNetwork = network ?? this.networkService.environment;
    //* Create the hashconnect instance
    this.hashConnect = new HashConnect(
      LedgerId.fromString(currentNetwork),
      '<Your Project ID>',
      this.appMetadata,
      true, //! Check this for production
    );
    //* Register events
    this.setUpHashConnectEvents();
    //* Initialize
    await this.hashConnect.init();
    //* Emit App level WalletInit event
    const eventData: WalletInitEvent = {
      wallet: SupportedWallets.HASHPACK,
      initData: {
        account: this.account,
      },
    };
    this.eventService.emit(WalletEvents.walletInit, eventData);
    //* Check if there are any connection
    if (
      this.state === HashConnectConnectionState.Paired &&
      this.pairingData &&
      this.pairingData.accountIds.length > 0
    ) {
      this.account = await this.getAccountInfo(this.pairingData.accountIds[0]);
      eventData.initData.account = this.account;
      this.eventService.emit(WalletEvents.walletPaired, {
        data: eventData.initData,
        network: {
          name: currentNetwork,
          recognized: true,
          factoryId: this.networkService.configuration
            ? this.networkService.configuration.factoryAddress
            : '',
        },
        wallet: SupportedWallets.HASHPACK,
      });
      this.setSigner(currentNetwork);
      LogService.logTrace(
        `Previous pairing found for ${currentNetwork} with account ${this.account.id.toString()} and event: ${JSON.stringify(
          eventData,
        )}`,
      );
    }
    LogService.logTrace(
      `HashPack initialized for ${currentNetwork} with: ${JSON.stringify(
        eventData,
      )}`,
    );
    return currentNetwork;
  }

  async register(): Promise<InitializationData> {
    Injectable.registerTransactionHandler(this);
    LogService.logTrace('HashPack Registered as handler');
    if (
      this.state !== HashConnectConnectionState.Paired ||
      !this.pairingData ||
      this.pairingData.accountIds.length < 0
    ) {
      LogService.logTrace(
        `Not previously paired, asking for new pairing. ${JSON.stringify(
          this.pairingData,
        )}`,
      );
      await this.hashConnect.openPairingModal();
    } else if (
      this.state === HashConnectConnectionState.Paired &&
      this.pairingData &&
      this.pairingData.accountIds.length > 0
    ) {
      this.eventService.emit(WalletEvents.walletPaired, {
        wallet: SupportedWallets.HASHPACK,
        data: {
          account: this.account,
        },
        network: {
          name: this.networkService.environment,
          recognized: true,
          factoryId: this.networkService.configuration
            ? this.networkService.configuration.factoryAddress
            : '',
        },
      });
    }
    return Promise.resolve({
      name: SupportedWallets.HASHPACK,
      account: this.account,
    });
  }

  async stop(): Promise<boolean> {
    await this.hashConnect.disconnect();
    LogService.logInfo('HashPack stopped');
    this.eventService.emit(WalletEvents.walletDisconnect, {
      wallet: SupportedWallets.HASHPACK,
    });
    return Promise.resolve(true);
  }

  async signAndSendTransaction(
    t: Transaction,
    transactionType: TransactionType,
    nameFunction?: string,
    abi?: any[],
  ): Promise<TransactionResponse> {
    if (!this.signer) throw new SigningError('Signer is empty');
    try {
      LogService.logTrace(
        'HashPack is singing and sending transaction:',
        nameFunction,
        t,
      );
      // Ensure we have the public key
      if (!this.getAccountKey()) throw new SigningError('Public key is empty');
      const signer = await this.getSigner();
      // Freeze the transaction
      if (!t.isFrozen()) {
        t = await t.freezeWithSigner(signer);
      }
      const hashPackTransactionResponse = await t.executeWithSigner(signer);
      this.logTransaction(
        hashPackTransactionResponse.transactionId.toString(),
        this.networkService.environment,
      );
      return HashpackTransactionResponseAdapter.manageResponse(
        this.networkService.environment,
        signer,
        hashPackTransactionResponse,
        transactionType,
        nameFunction,
        abi,
      );
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(error);
    }
  }

  async getAccountKey(): Promise<HPublicKey> {
    return this.signer.getAccountKey() as HPublicKey;
  }

  getAccount(): Account {
    if (this.account) return this.account;
    throw new RuntimeError(
      'There are no accounts currently paired with HashPack!',
    );
  }

  public async restart(network: string): Promise<void> {
    await this.stop();
    await this.init(network);
  }

  /**
   * Sets up the event listeners for HashConnect pairing, disconnection, and connection status change events.
   */
  public setUpHashConnectEvents(): void {
    this.hashConnect.pairingEvent.on(async (newPairing) => {
      try {
        LogService.logInfo(
          `HashPack pairing event, old data: ${JSON.stringify(
            this.pairingData,
          )}, new data: ${JSON.stringify(newPairing)}`,
        );
        this.pairingData = newPairing;
        const id = newPairing.accountIds[0];
        this.account = await this.getAccountInfo(id);
        this.setSigner(this.networkService.environment);
        this.eventService.emit(WalletEvents.walletPaired, {
          wallet: SupportedWallets.HASHPACK,
          data: {
            account: this.account,
          },
          network: {
            name: this.pairingData.network,
            recognized: true,
            factoryId: this.networkService.configuration
              ? this.networkService.configuration.factoryAddress
              : '',
          },
        });
      } catch (error) {
        LogService.logError(error);
        throw new PairingError(error);
      }
    });

    this.hashConnect.disconnectionEvent.on(() => {
      this.pairingData = null;
      this.eventService.emit(WalletEvents.walletDisconnect, {
        wallet: SupportedWallets.HASHPACK,
      });
    });

    this.hashConnect.connectionStatusChangeEvent.on((connectionState) => {
      LogService.logTrace(
        `HashPack Connection Status Change Event, old: ${this.state}, new: ${connectionState}`,
      );
      this.state = connectionState;
      this.eventService.emit(WalletEvents.walletConnectionStatusChanged, {
        wallet: SupportedWallets.HASHPACK,
        status: this.state as unknown as ConnectionState,
      });
    });
  }

  public getConectionState(): HashConnectConnectionState {
    return this.state;
  }

  public async getAccountInfo(id: string): Promise<Account> {
    const account = (
      await this.queryBus.execute(new GetAccountInfoQuery(HederaId.from(id)))
    ).account;
    if (!account.id) throw new AccountIdNotValid(id.toString());
    return new Account({
      id: account.id,
      publicKey: account.publicKey,
      evmAddress: account.accountEvmAddress,
    });
  }

  public async getHashConnectSigner(): Promise<HashConnectSigner> {
    return this.signer;
  }

  public async getSigner(): Promise<Signer> {
    return this.signer as unknown as Signer;
  }

  public async sign(message: string | Transaction): Promise<string> {
    if (!this.signer) throw new SigningError('Signer is empty');
    if (!(message instanceof Transaction))
      throw new SigningError('Hashpack must sign a transaction not a string');

    try {
      if (
        !this.networkService.consensusNodes ||
        this.networkService.consensusNodes.length == 0
      ) {
        throw new Error(
          'In order to create sign multisignature transactions you must set consensus nodes for the environment',
        );
      }

      const hashPackTrx = {
        topic: this.initData.topic,
        byteArray: message.toBytes(),
        metadata: {
          accountToSign: this.account.id.toString(),
          returnTransaction: true,
          getRecord: false,
        },
      };

      const PublicKey_Der_Encoded =
        this.account.publicKey?.toHederaKey().toStringDer() ?? '';

      const t = await this.hc.sendTransaction(this.initData.topic, hashPackTrx);

      if (t.signedTransaction instanceof Uint8Array) {
        const signedTrans = Transaction.fromBytes(t.signedTransaction);
        const signatures_list = signedTrans.getSignatures();
        const nodes_signature = signatures_list.get(
          this.networkService.consensusNodes[0].nodeId,
        );
        if (nodes_signature) {
          const signature = nodes_signature.get(PublicKey_Der_Encoded);
          if (signature) {
            return Hex.fromUint8Array(signature);
          }
          throw new Error(
            'Hashapck no signatures found for public key : ' +
              PublicKey_Der_Encoded,
          );
        }
        throw new Error(
          'Hashapck no signatures found for node id : ' +
            this.networkService.consensusNodes[0].nodeId,
        );
      }
      throw new Error('Hashapck wrong signed transaction');
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(error);
    }
  }

  private async setSigner(network: string): Promise<HashConnectSigner> {
    this.signer = this.hashConnect.getSigner(
      this.account.id.toHederaAddress() as unknown as AccountId, // TODO: Fix this
    );
    return this.signer;
  }
}
