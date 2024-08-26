/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EthereumTransaction,
  LedgerId,
  PublicKey as HPublicKey,
  Signer,
} from '@hashgraph/sdk';
import {
  DappMetadata,
  HashConnect,
  HashConnectConnectionState,
  SessionData,
} from 'hashconnect';
import { HashConnectSigner } from 'hashconnect/dist/signer.js';
import AccountId from 'hashconnect/node_modules/@hashgraph/sdk/lib/account/AccountId'; // TODO: Fix this
import { singleton } from 'tsyringe';
import { HashpackTransactionResponseAdapter } from './HashpackTransactionResponseAdapter.js';
import { PairingError } from './error/PairingError.js';
import { HederaTransactionAdapter } from '../HederaTransactionAdapter.js';
import { SigningError } from '../error/SigningError.js';
import { InitializationData } from '../../TransactionAdapter.js';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter.js';
import { SupportedWallets } from '../../../in/request/ConnectRequest.js';
import Injectable from '../../../../core/Injectable.js';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator.js';
import { RuntimeError } from '../../../../core/error/RuntimeError.js';
import { QueryBus } from '../../../../core/query/QueryBus.js';
import {
  ConnectionState,
  WalletEvents,
  WalletInitEvent,
} from '../../../../app/service/event/WalletEvent.js';
import LogService from '../../../../app/service/LogService.js';
import EventService from '../../../../app/service/event/EventService.js';
import NetworkService from '../../../../app/service/NetworkService.js';
import { GetAccountInfoQuery } from '../../../../app/usecase/query/account/info/GetAccountInfoQuery.js';
import Account from '../../../../domain/context/account/Account.js';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import { HederaId } from '../../../../domain/context/shared/HederaId.js';
import { AccountIdNotValid } from '../../../../domain/context/account/error/AccountIdNotValid.js';
import WalletConnectSettings from '../../../../domain/context/walletConnect/WalletConnectSettings.js';

@singleton()
export class HashpackTransactionAdapter extends HederaTransactionAdapter {
  private appMetadata: DappMetadata;

  private hashConnect: HashConnect;
  private state: HashConnectConnectionState;
  private pairingData: SessionData | null;
  private account: Account;
  protected signer: Signer;
  private hashConnectSigner: HashConnectSigner;

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
    // this.init();
  }
  public async init(
    wcSettings?: WalletConnectSettings,
    network?: string,
  ): Promise<string> {
    // TODO: Improve this
    if (!wcSettings) {
      throw new Error('Hashpack settings are required');
    }
    this.appMetadata = {
      name: wcSettings.dappName,
      description: wcSettings.dappDescription,
      url: wcSettings.dappURL,
      icons: wcSettings.dappIcons,
    };
    const currentNetwork = network ?? this.networkService.environment;
    //* Create the hashconnect instance
    this.hashConnect = new HashConnect(
      LedgerId.fromString(currentNetwork),
      wcSettings.projectId,
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
      this.setSigner();
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

  public async register(): Promise<InitializationData> {
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

  public async stop(): Promise<boolean> {
    await this.hashConnect.disconnect();
    LogService.logInfo('HashPack stopped');
    this.eventService.emit(WalletEvents.walletDisconnect, {
      wallet: SupportedWallets.HASHPACK,
    });
    return Promise.resolve(true);
  }

  public async restart(
    wcSettings: WalletConnectSettings,
    network: string,
  ): Promise<void> {
    await this.stop();
    await this.init(wcSettings, network);
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
        this.setSigner();
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

  public async signAndSendTransaction(
    transaction: EthereumTransaction,
  ): Promise<TransactionResponse> {
    if (!this.signer) throw new SigningError('Signer is empty');
    try {
      LogService.logTrace(
        `Hashpack signing and sending transaction: ${JSON.stringify(transaction)}`,
      );
      // Ensure we have the public key
      if (!this.getAccountKey()) throw new SigningError('Public key is empty');
      const signer = this.getSigner();
      // Freeze the transaction
      if (!transaction.isFrozen()) {
        transaction = await transaction.freezeWithSigner(signer);
      }
      const hashPackTransactionResponse =
        await transaction.executeWithSigner(signer);
      this.logTransaction(
        hashPackTransactionResponse.transactionId.toString(),
        this.networkService.environment,
      );
      return HashpackTransactionResponseAdapter.manageResponse(
        hashPackTransactionResponse,
        signer,
        this.networkService.environment,
      );
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(error);
    }
  }

  // public async sign(message: string | Transaction): Promise<string> {
  //   if (!this.signer) throw new SigningError('Signer is empty');
  //   // TODO: Check if this is correct in v3
  //   if (!(message instanceof Transaction))
  //     throw new SigningError('Hashpack must sign a transaction not a string');

  //   try {
  //     if (
  //       !this.networkService.consensusNodes ||
  //       this.networkService.consensusNodes.length == 0
  //     ) {
  //       throw new Error(
  //         'In order to create sign multisignature transactions you must set consensus nodes for the environment',
  //       );
  //     }

  //     const hashPackTrx = {
  //       topic: this.initData.topic,
  //       byteArray: message.toBytes(),
  //       metadata: {
  //         accountToSign: this.account.id.toString(),
  //         returnTransaction: true,
  //         getRecord: false,
  //       },
  //     };

  //     const PublicKeyDer =
  //       this.account.publicKey?.toHederaKey().toStringDer() ?? '';

  //     const signedTx = await message.signWithSigner(this.getSigner());

  //     const signatureList = signedTx.getSignatures();
  //     const nodeSignature = signatureList.get(
  //       this.networkService.consensusNodes[0].nodeId,
  //     );
  //     if (nodeSignature) {
  //       const signature = nodeSignature.get(PublicKeyDer);
  //       if (signature) {
  //         return Hex.fromUint8Array(signature);
  //       }
  //       throw new Error(
  //         'Hashapck no signatures found for public key : ' + PublicKeyDer,
  //       );
  //     }
  //     throw new Error(
  //       'Hashapck no signatures found for node id : ' +
  //         this.networkService.consensusNodes[0].nodeId,
  //     );
  //   } catch (error) {
  //     LogService.logError(error);
  //     throw new SigningError(error);
  //   }
  // }

  private async setSigner(): Promise<HashConnectSigner> {
    this.hashConnectSigner = this.hashConnect.getSigner(
      this.account.id.toHederaAddress() as unknown as AccountId, // TODO: Fix this
    );
    this.signer = this.hashConnectSigner as unknown as Signer;
    return this.hashConnectSigner;
  }

  public async getAccountKey(): Promise<HPublicKey> {
    if (!this.signer) throw new SigningError('Signer is empty');
    return this.getHashConnectSigner().getAccountKey() as HPublicKey;
  }

  public getAccount(): Account {
    if (this.account) return this.account;
    throw new RuntimeError(
      'There are no accounts currently paired with HashPack!',
    );
  }

  public getConectionState(): HashConnectConnectionState {
    return this.state;
  }

  /**
   * Retrieves the account information for the specified ID.
   *
   * @param id - The ID of the account.
   * @returns A promise that resolves to an instance of the Account class.
   * @throws {AccountIdNotValid} If the account ID is not valid.
   */
  public async getAccountInfo(id: string): Promise<Account> {
    const account = (
      await this.queryBus.execute(new GetAccountInfoQuery(HederaId.from(id)))
    ).account;
    if (!account.id) throw new AccountIdNotValid(id.toString());
    return new Account({
      id: account.id.toString(),
      publicKey: account.publicKey,
      evmAddress: account.evmAddress,
    });
  }

  /**
   * Retrieves the HashConnectSigner associated with this HashpackTransactionAdapter.
   *
   * @returns A Promise that resolves to the HashConnectSigner.
   */
  public getHashConnectSigner(): HashConnectSigner {
    return this.hashConnectSigner;
  }

  /**
   * Retrieves the Hashpack Signer associated with this HashpackTransactionAdapter.
   *
   * @returns A promise that resolves to the signer of the transaction.
   */
  public getSigner(): Signer {
    return this.signer;
  }
}
