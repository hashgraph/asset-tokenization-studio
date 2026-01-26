// SPDX-License-Identifier: Apache-2.0

import { singleton } from 'tsyringe';
import {
  AccountId,
  LedgerId,
  Signer,
  Transaction,
  TransactionResponse as HTransactionResponse,
  TransactionResponseJSON,
} from '@hiero-ledger/sdk';
import { NetworkName } from '@hiero-ledger/sdk/lib/client/Client';
import {
  base64StringToSignatureMap,
  DAppConnector,
  HederaChainId,
  SignAndExecuteTransactionParams,
  SignTransactionParams,
  transactionBodyToBase64String,
  transactionToBase64String,
  transactionToTransactionBody,
} from '@hashgraph/hedera-wallet-connect';
import { SignClientTypes } from '@walletconnect/types';
import { HederaTransactionAdapter } from '../HederaTransactionAdapter';
import { HederaTransactionResponseAdapter } from '../HederaTransactionResponseAdapter';
import { SigningError } from '@port/out/error/SigningError';
import { InitializationData } from '@port/out/TransactionAdapter';
import { MirrorNodeAdapter } from '@port/out/mirror/MirrorNodeAdapter';
import { WalletEvents, WalletPairedEvent } from '@service/event/WalletEvent';
import LogService from '@service/log/LogService';
import EventService from '@service/event/EventService';
import NetworkService from '@service/network/NetworkService';
import { lazyInject } from '@core/decorator/LazyInjectDecorator';
import Injectable from '@core/injectable/Injectable';
import Hex from '@core/Hex';
import Account from '@domain/context/account/Account';
import TransactionResponse from '@domain/context/transaction/TransactionResponse';
import {
  Environment,
  mainnet,
  previewnet,
  testnet,
} from '@domain/context/network/Environment';
import { SupportedWallets } from '@domain/context/network/Wallet';
import HWCSettings from '@core/settings/walletConnect/HWCSettings';
import { NotInitialized } from './error/NotInitialized';
import { AccountNotSet } from './error/AccountNotSet';
import { NoSettings } from './error/NoSettings';
import { UnsupportedNetwork } from '@domain/context/network/error/UnsupportedNetwork';
import { NoSigners } from './error/NoSigners';
import { AccountNotRetrievedFromSigners } from './error/AccountNotRetrievedFromSigners';
import { AccountNotFound } from '../error/AccountNotFound';
import { ConsensusNodesNotSet } from './error/ConsensusNodesNotSet';
import { SignatureNotFound } from './error/SignatureNotFound';

@singleton()
/**
 * Represents a transaction adapter for Hedera Wallet Connect.
 */
export class HederaWalletConnectTransactionAdapter extends HederaTransactionAdapter {
  public account: Account;
  public signer: Signer;
  protected network: Environment;
  protected dAppConnector: DAppConnector | undefined;
  protected projectId: string;
  protected dappMetadata: SignClientTypes.Metadata;
  private chainId: HederaChainId;

  constructor(
    @lazyInject(EventService)
    private readonly eventService: EventService,
    @lazyInject(NetworkService)
    protected readonly networkService: NetworkService,
    @lazyInject(MirrorNodeAdapter)
    protected readonly mirrorNodeAdapter: MirrorNodeAdapter,
  ) {
    super(mirrorNodeAdapter, networkService);
    this.projectId = '';
    this.dappMetadata = {
      name: '',
      description: '',
      url: '',
      icons: [],
    };
    this.setupDisconnectEventHandler();
  }

  private setupDisconnectEventHandler(): boolean {
    if (this.dAppConnector?.walletConnectClient) {
      const client = this.dAppConnector.walletConnectClient;
      client.on('session_delete', this.handleDisconnect.bind(this));
    }
    return true;
  }

  private handleDisconnect(): boolean {
    this.stop();
    this.eventService.emit(WalletEvents.walletDisconnect, {
      wallet: SupportedWallets.HWALLETCONNECT,
    });
    return true;
  }

  /**
   * Initializes the Hedera Wallet Connect Transaction Adapter.
   *
   * @param network - Optional parameter specifying the network name.
   * @returns A promise that resolves to the current network name.
   */
  public async init(network?: NetworkName): Promise<string> {
    LogService.logInfo('Initializing with network:', network);
    const currentNetwork = network ?? this.networkService.environment;
    LogService.logTrace('Current network set to:', currentNetwork);

    const eventData = {
      initData: {
        account: this.account,
        pairing: '',
        topic: '',
      },
      wallet: SupportedWallets.HWALLETCONNECT,
    };
    LogService.logTrace('Emitting walletInit event with data:', eventData);
    this.eventService.emit(WalletEvents.walletInit, eventData);
    LogService.logInfo('✅ Hedera Wallet Connect Handler Initialized');
    return currentNetwork;
  }

  public async register(hwcSettings: HWCSettings): Promise<InitializationData> {
    LogService.logInfo('Registering Hedera WalletConnect...');
    Injectable.registerTransactionHandler(this);
    LogService.logTrace('Hedera WalletConnect registered as handler');

    this.chainId = this.getChainId(this.networkService.environment);
    LogService.logTrace('Chain ID set to:', this.chainId);

    if (!hwcSettings) {
      LogService.logError('Error: Hedera WalletConnect settings not set');
      throw new NoSettings();
    }
    this.projectId = hwcSettings.projectId ?? '';
    LogService.logTrace('Project ID set to:', this.projectId);

    LogService.logTrace('Hedera WalletConnect settings:', hwcSettings);
    this.dappMetadata = {
      name: hwcSettings.dappName ?? '',
      description: hwcSettings.dappDescription ?? '',
      url: hwcSettings.dappURL ?? '',
      icons: [],
    };
    LogService.logTrace('DApp metadata set to:', this.dappMetadata);

    await this.connectWalletConnect();

    LogService.logInfo(
      'Register method completed. Returning account information.',
    );
    return { account: this.getAccount() };
  }

  private getChainId(
    network: Environment,
  ): (typeof HederaChainId)[keyof typeof HederaChainId] {
    LogService.logInfo('Getting Chain ID for network:', network);
    switch (network) {
      case testnet:
        LogService.logTrace('Network is testnet. Returning Testnet Chain ID.');
        return HederaChainId.Testnet;
      case previewnet:
        LogService.logTrace(
          'Network is previewnet. Returning Previewnet Chain ID.',
        );
        return HederaChainId.Previewnet;
      case mainnet:
        LogService.logTrace('Network is mainnet. Returning Mainnet Chain ID.');
        return HederaChainId.Mainnet;
      default:
        LogService.logError('Error: Invalid network name:', network);
        throw new UnsupportedNetwork();
    }
  }

  public async connectWalletConnect(network?: string): Promise<string> {
    LogService.logInfo('Connecting to WalletConnect with network:', network);
    const currentNetwork = network ?? this.networkService.environment;
    LogService.logTrace('Current network set to:', currentNetwork);

    if (this.dAppConnector) {
      LogService.logTrace(
        'Existing dAppConnector detected. Calling stop() to clean up.',
      );
      await this.stop();
    }

    try {
      this.dAppConnector = new DAppConnector(
        this.dappMetadata,
        LedgerId.fromString(currentNetwork),
        this.projectId,
      );
      LogService.logTrace('DAppConnector initialized:', this.dAppConnector);
      await this.dAppConnector.init({ logger: 'debug' });
      LogService.logTrace(
        `✅ HWC Initialized with network: ${currentNetwork} and projectId: ${this.projectId}`,
      );
      this.setupDisconnectEventHandler();
    } catch (error) {
      LogService.logError('Error initializing HWC:', error);
      LogService.logError(
        `❌ Error initializing HWC with network: ${currentNetwork} and projectId: ${this.projectId}`,
        error,
      );
      return currentNetwork;
    }

    LogService.logTrace('🔗 Pairing with Hedera WalletConnect...');
    LogService.logTrace('Opening Hedera WalletConnect modal...');
    LogService.logTrace(
      'DAppConnector state before opening modal:',
      this.dAppConnector,
    );

    await this.dAppConnector.openModal();

    LogService.logTrace('WalletConnect modal opened. Retrieving signers...');
    const walletConnectSigners = this.dAppConnector.signers;
    LogService.logInfo('Signers retrieved:', walletConnectSigners);

    if (!walletConnectSigners) {
      LogService.logError('Error: No signers retrieved from WalletConnect.');
      throw new NoSigners();
    }

    const accountId = walletConnectSigners[0].getAccountId().toString();
    LogService.logInfo('Account ID retrieved from signers:', accountId);

    if (!accountId) {
      LogService.logError('Error: No account ID retrieved from signers.');
      throw new AccountNotRetrievedFromSigners();
    }

    const accountMirror =
      await this.mirrorNodeAdapter.getAccountInfo(accountId);
    LogService.logTrace(
      'Account info retrieved from Mirror Node:',
      accountMirror,
    );

    if (!accountMirror) {
      LogService.logError('Error: No account info retrieved from Mirror Node.');
      throw new AccountNotFound();
    }

    this.signer = this.dAppConnector.getSigner(
      AccountId.fromString(accountId) as any,
    ) as any;
    LogService.logTrace('Signer set to:', this.signer);

    this.account = new Account({
      id: accountId,
      publicKey: accountMirror.publicKey,
      evmAddress: accountMirror.evmAddress,
    });
    LogService.logTrace('Account object created:', this.account);

    this.network = this.networkService.environment;
    LogService.logTrace('Network set to:', this.network);

    LogService.logInfo(
      `✅ Hedera WalletConnect paired with account: ${accountId}`,
    );
    const eventData: WalletPairedEvent = {
      wallet: SupportedWallets.HWALLETCONNECT,
      data: {
        account: this.account,
        pairing: '',
        topic: '',
      },
      network: {
        name: this.networkService.environment,
        recognized: true,
        factoryId: this.networkService.configuration
          ? this.networkService.configuration.factoryAddress
          : '',
      },
    };
    LogService.logTrace('Emitting walletPaired event with data:', eventData);
    this.eventService.emit(WalletEvents.walletPaired, eventData);

    LogService.logInfo('connectWalletConnect method completed.');
    return currentNetwork;
  }

  /**
   * Stops the Hedera WalletConnect connection.
   * @returns A promise that resolves to a boolean indicating whether the stop operation was successful.
   */
  public async stop(): Promise<boolean> {
    try {
      if (this.dAppConnector) {
        await this.dAppConnector.disconnectAll();
      }
      this.dAppConnector = undefined;
      LogService.logInfo(`🛑 🏁 Hedera WalletConnect stopped successfully`);
      this.eventService.emit(WalletEvents.walletDisconnect, {
        wallet: SupportedWallets.HWALLETCONNECT,
      });
      return Promise.resolve(true);
    } catch (error) {
      if (
        (error as Error).message.includes('No active session') ||
        (error as Error).message.includes('No matching key')
      ) {
        LogService.logInfo(
          `🔍 No active session found for Hedera WalletConnect`,
        );
      } else {
        LogService.logError(
          `❌ Error stopping Hedera WalletConnect: ${(error as Error).message}`,
        );
      }
      return Promise.resolve(false);
    }
  }

  /**
   * Restarts the transaction adapter with the specified network.
   * @param network The network name to initialize the adapter with.
   * @returns A promise that resolves when the adapter has been restarted.
   */
  public async restart(network: NetworkName): Promise<void> {
    await this.stop();
    await this.init(network);
  }

  public async signAndSendTransaction(
    transaction: Transaction,
  ): Promise<TransactionResponse> {
    LogService.logInfo(`🔏 Signing and sending transaction from HWC...`);
    if (!this.dAppConnector) {
      throw new NotInitialized();
    }
    if (!this.account) {
      throw new AccountNotSet();
    }
    if (
      !this.signer ||
      !this.dAppConnector.signers ||
      this.dAppConnector.signers.length === 0
    ) {
      throw new NoSigners();
    }

    try {
      if (!transaction.isFrozen()) {
        LogService.logTrace(`🔒 Tx not frozen, freezing transaction...`);
        transaction._freezeWithAccountId(
          AccountId.fromString(this.account.id.toString()),
        );
      }
      const params: SignAndExecuteTransactionParams = {
        transactionList: transactionToBase64String(transaction as any),
        signerAccountId: `${this.chainId}:${this.account.id.toString()}`,
      };
      LogService.logTrace(
        `🖋️ [HWC] Signing tx with params: ${JSON.stringify(params, null, 2)}`,
      );

      const transactionResponseRaw =
        await this.dAppConnector?.signAndExecuteTransaction(params);

      LogService.logInfo(`✅ Transaction signed and sent successfully!`);
      LogService.logTrace(
        `Transaction response RAW: ${JSON.stringify(
          transactionResponseRaw,
          null,
          2,
        )}`,
      );
      const transactionResponse = HTransactionResponse.fromJSON(
        transactionResponseRaw as unknown as TransactionResponseJSON,
      );

      LogService.logTrace(
        `Transaction response: ${JSON.stringify(transactionResponse, null, 2)}`,
      );

      return await HederaTransactionResponseAdapter.manageResponse(
        this.networkService.environment,
        this.signer,
        transactionResponse,
      );
    } catch (error) {
      if (error instanceof Error) {
        LogService.logError(error.stack);
      }
      throw new SigningError(
        error instanceof Object ? JSON.stringify(error, null, 2) : error,
      );
    }
  }

  getAccount(): Account {
    return this.account;
  }

  /**
   * Signs a transaction using Hedera WalletConnect.
   * @param message - The transaction to sign.
   * @returns A promise that resolves to the hexadecimal signature of the signed transaction.
   * @throws Error if Hedera WalletConnect is not initialized, account is not set, no signers found,
   * the message is not an instance of Transaction, or consensus nodes are not set for the environment.
   * @throws SigningError if an error occurs during the signing process.
   */
  async sign(message: string | Transaction): Promise<string> {
    LogService.logInfo('🔏 Signing transaction from HWC...');
    if (!this.dAppConnector) {
      throw new NotInitialized();
    }
    if (!this.account) {
      throw new AccountNotSet();
    }
    if (
      !this.signer ||
      !this.dAppConnector.signers ||
      this.dAppConnector.signers.length === 0
    ) {
      throw new NoSigners();
    }
    if (!(message instanceof Transaction))
      throw new SigningError(
        '❌ Hedera WalletConnect must sign a transaction not a string',
      );
    if (
      !this.networkService.consensusNodes ||
      this.networkService.consensusNodes.length == 0
    ) {
      throw new ConsensusNodesNotSet();
    }

    try {
      if (!message.isFrozen()) {
        LogService.logTrace(`🔒 Tx not frozen, freezing transaction...`);
        message._freezeWithAccountId(
          AccountId.fromString(this.account.id.toString()),
        );
      }

      const params: SignTransactionParams = {
        transactionBody: transactionBodyToBase64String(
          transactionToTransactionBody(
            message as any,
            AccountId.fromString(this.networkService.consensusNodes[0]) as any,
          ),
        ),
        signerAccountId: `${this.chainId}:${this.account.id.toString()}`,
      };

      LogService.logTrace(
        `🖋️ [HWC] Signing tx with params: ${JSON.stringify(params, null, 2)}`,
      );
      const signResult = await this.dAppConnector.signTransaction(params);
      LogService.logInfo(`✅ Transaction signed successfully!`);
      LogService.logTrace(
        `Signature result: ${JSON.stringify(signResult, null, 2)}`,
      );
      const decodedSignatureMap = base64StringToSignatureMap(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (signResult as any).signatureMap,
      );
      LogService.logTrace(
        `Decoded signature map: ${JSON.stringify(
          decodedSignatureMap,
          null,
          2,
        )}`,
      );

      const signaturesLength = decodedSignatureMap.sigPair.length;
      if (signaturesLength === 0) {
        throw new SignatureNotFound();
      }
      const firstSignature =
        decodedSignatureMap.sigPair[0].ed25519 ||
        decodedSignatureMap.sigPair[0].ECDSASecp256k1 ||
        decodedSignatureMap.sigPair[0].ECDSA_384;
      if (!firstSignature) {
        throw new SignatureNotFound(JSON.stringify(firstSignature, null, 2));
      }

      const hexSignature = Hex.fromUint8Array(firstSignature);
      LogService.logTrace(
        `Final hexadecimal signature: ${JSON.stringify(hexSignature, null, 2)}`,
      );
      return hexSignature;
    } catch (error) {
      throw new SigningError(JSON.stringify(error, null, 2));
    }
  }
}
