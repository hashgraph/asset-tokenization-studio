import { singleton } from 'tsyringe';
import {
  AccountId,
  LedgerId,
  Signer,
  Transaction,
  TransactionResponse as HTransactionResponse,
  TransactionResponseJSON,
} from '@hashgraph/sdk';
import { NetworkName } from '@hashgraph/sdk/lib/client/Client';
import {
  DAppConnector,
  HederaChainId,
  SignAndExecuteTransactionParams,
  SignTransactionParams,
  transactionBodyToBase64String,
  transactionToBase64String,
  transactionToTransactionBody,
  base64StringToSignatureMap,
} from '@hashgraph/hedera-wallet-connect';
import { SignClientTypes } from '@walletconnect/types';
import { HederaTransactionAdapter } from '../HederaTransactionAdapter';
import { HederaTransactionResponseAdapter } from '../HederaTransactionResponseAdapter';
import { SigningError } from '../error/SigningError';
import { InitializationData } from '../../TransactionAdapter';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter';
import {
  WalletEvents,
  WalletPairedEvent,
} from '../../../../app/service/event/WalletEvent';
import LogService from '../../../../app/service/LogService';
import EventService from '../../../../app/service/event/EventService';
import NetworkService from '../../../../app/service/NetworkService';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator';
import Injectable from '../../../../core/Injectable';
import { QueryBus } from '../../../../core/query/QueryBus';
import Hex from '../../../../core/Hex';
import Account from '../../../../domain/context/account/Account';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import {
  Environment,
  mainnet,
  previewnet,
  testnet,
} from '../../../../domain/context/network/Environment';
import { SupportedWallets } from '../../../../domain/context/network/Wallet';
import HWCSettings from '../../../../domain/context/walletConnect/HWCSettings';

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
    public readonly eventService: EventService,
    @lazyInject(NetworkService)
    public readonly networkService: NetworkService,
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(QueryBus)
    public readonly queryBus: QueryBus,
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

  private setupDisconnectEventHandler() : void {
    if (this.dAppConnector?.walletConnectClient) {
      const client = this.dAppConnector.walletConnectClient;
      client.on('session_delete', this.handleDisconnect.bind(this));
    }
  }

  private handleDisconnect(): void {
    this.stop();
    this.eventService.emit(WalletEvents.walletDisconnect, {
      wallet: SupportedWallets.HWALLETCONNECT,
    });
  }

  /**
   * Initializes the Hedera Wallet Connect Transaction Adapter.
   *
   * @param network - Optional parameter specifying the network name.
   * @returns A promise that resolves to the current network name.
   */
  public async init(network?: NetworkName): Promise<string> {
    console.log('Initializing with network:', network);
    const currentNetwork = network ?? this.networkService.environment;
    console.log('Current network set to:', currentNetwork);

    const eventData = {
      initData: {
        account: this.account,
        pairing: '',
        topic: '',
      },
      wallet: SupportedWallets.HWALLETCONNECT,
    };
    console.log('Emitting walletInit event with data:', eventData);
    this.eventService.emit(WalletEvents.walletInit, eventData);
    LogService.logInfo('✅ Hedera Wallet Connect Handler Initialized');
    return currentNetwork;
  }

  public async register(hwcSettings: HWCSettings): Promise<InitializationData> {
    console.log('Registering Hedera WalletConnect...');
    Injectable.registerTransactionHandler(this);
    console.log('Hedera WalletConnect registered as handler');

    this.chainId = this.getChainId(this.networkService.environment);
    console.log('Chain ID set to:', this.chainId);

    if (!hwcSettings) {
      console.error('Error: Hedera WalletConnect settings not set');
      throw new Error('hedera wallet conenct settings not set');
    }
    this.projectId = hwcSettings.projectId ?? '';
    console.log('Project ID set to:', this.projectId);

    console.log('Hedera WalletConnect settings:', hwcSettings);
    this.dappMetadata = {
      name: hwcSettings.dappName ?? '',
      description: hwcSettings.dappDescription ?? '',
      url: hwcSettings.dappURL ?? '',
      icons: [],
    };
    console.log('DApp metadata set to:', this.dappMetadata);

    await this.connectWalletConnect();

    console.log('Register method completed. Returning account information.');
    return { account: this.getAccount() };
  }

  private getChainId(
    network: Environment,
  ): (typeof HederaChainId)[keyof typeof HederaChainId] {
    console.log('Getting Chain ID for network:', network);
    switch (network) {
      case testnet:
        console.log('Network is testnet. Returning Testnet Chain ID.');
        return HederaChainId.Testnet;
      case previewnet:
        console.log('Network is previewnet. Returning Previewnet Chain ID.');
        return HederaChainId.Previewnet;
      case mainnet:
        console.log('Network is mainnet. Returning Mainnet Chain ID.');
        return HederaChainId.Mainnet;
      default:
        console.error('Error: Invalid network name:', network);
        throw new Error(`❌ Invalid network name: ${network}`);
    }
  }

  public async connectWalletConnect(network?: string): Promise<string> {
    console.log('Connecting to WalletConnect with network:', network);
    const currentNetwork = network ?? this.networkService.environment;
    console.log('Current network set to:', currentNetwork);

    if (this.dAppConnector) {
      console.log(
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
      console.log('DAppConnector initialized:', this.dAppConnector);
      await this.dAppConnector.init({ logger: 'debug' });
      LogService.logTrace(
        `✅ HWC Initialized with network: ${currentNetwork} and projectId: ${this.projectId}`,
      );
      this.setupDisconnectEventHandler();
    } catch (error) {
      console.error('Error initializing HWC:', error);
      LogService.logError(
        `❌ Error initializing HWC with network: ${currentNetwork} and projectId: ${this.projectId}`,
        error,
      );
      return currentNetwork;
    }

    LogService.logTrace('🔗 Pairing with Hedera WalletConnect...');
    console.log('Opening Hedera WalletConnect modal...');
    console.log(
      'DAppConnector state before opening modal:',
      this.dAppConnector,
    );

    await this.dAppConnector.openModal();

    console.log('WalletConnect modal opened. Retrieving signers...');
    const walletConnectSigners = this.dAppConnector.signers;
    console.log('Signers retrieved:', walletConnectSigners);

    if (!walletConnectSigners) {
      console.error('Error: No signers retrieved from WalletConnect.');
      throw new Error(
        `❌ No signers retrieved from wallet connect. Signers: ${walletConnectSigners}`,
      );
    }

    const accountId = walletConnectSigners[0].getAccountId().toString();
    console.log('Account ID retrieved from signers:', accountId);

    if (!accountId) {
      console.error('Error: No account ID retrieved from signers.');
      throw new Error(
        `❌ No account ID retrieved from signers. Account ID: ${accountId}`,
      );
    }

    const accountMirror =
      await this.mirrorNodeAdapter.getAccountInfo(accountId);
    console.log('Account info retrieved from Mirror Node:', accountMirror);

    if (!accountMirror) {
      console.error('Error: No account info retrieved from Mirror Node.');
      throw new Error(
        `❌ No account info retrieved from Mirror Node. Account ID: ${accountId}`,
      );
    }

    this.signer = this.dAppConnector.getSigner(AccountId.fromString(accountId));
    console.log('Signer set to:', this.signer);

    this.account = new Account({
      id: accountId,
      publicKey: accountMirror.publicKey,
      evmAddress: accountMirror.evmAddress,
    });
    console.log('Account object created:', this.account);

    this.network = this.networkService.environment;
    console.log('Network set to:', this.network);

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
    console.log('Emitting walletPaired event with data:', eventData);
    this.eventService.emit(WalletEvents.walletPaired, eventData);

    console.log('connectWalletConnect method completed.');
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
      throw new Error('❌ Hedera WalletConnect not initialized');
    }
    if (!this.account) {
      throw new Error('❌ Account not set');
    }
    if (
      !this.signer ||
      !this.dAppConnector.signers ||
      this.dAppConnector.signers.length === 0
    ) {
      throw new Error('❌ No signers found');
    }

    try {
      if (!transaction.isFrozen()) {
        LogService.logTrace(`🔒 Tx not frozen, freezing transaction...`);
        transaction._freezeWithAccountId(
          AccountId.fromString(this.account.id.toString()),
        );
      }
      const params: SignAndExecuteTransactionParams = {
        transactionList: transactionToBase64String(transaction),
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
      throw new Error(
        `Error signing and sending transaction: ${
          error instanceof Object ? JSON.stringify(error, null, 2) : error
        }`,
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
      throw new Error('❌ Hedera WalletConnect not initialized');
    }
    if (!this.account) {
      throw new Error('❌ Account not set');
    }
    if (
      !this.signer ||
      !this.dAppConnector.signers ||
      this.dAppConnector.signers.length === 0
    ) {
      throw new Error('❌ No signers found');
    }
    if (!(message instanceof Transaction))
      throw new SigningError(
        '❌ Hedera WalletConnect must sign a transaction not a string',
      );
    if (
      !this.networkService.consensusNodes ||
      this.networkService.consensusNodes.length == 0
    ) {
      throw new Error(
        '❌ In order to create sign multisignature transactions you must set consensus nodes for the environment',
      );
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
            message,
            AccountId.fromString(this.networkService.consensusNodes[0]),
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
        throw new Error(`❌ No signatures found in response`);
      }
      const firstSignature =
        decodedSignatureMap.sigPair[0].ed25519 ||
        decodedSignatureMap.sigPair[0].ECDSASecp256k1 ||
        decodedSignatureMap.sigPair[0].ECDSA_384;
      if (!firstSignature) {
        throw new Error(
          `❌ No signatures found in response: ${JSON.stringify(
            firstSignature,
            null,
            2,
          )}`,
        );
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
