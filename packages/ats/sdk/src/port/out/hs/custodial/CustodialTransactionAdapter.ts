// SPDX-License-Identifier: Apache-2.0

import { Client, Transaction, TransactionResponse as HTransactionResponse } from "@hiero-ledger/sdk";
import { CustodialWalletService, SignatureRequest } from "@hashgraph/hedera-custodians-integration";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import Account from "@domain/context/account/Account";
import { InitializationData } from "@port/out/TransactionAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EventService from "@service/event/EventService";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import NetworkService from "@service/network/NetworkService";
import { Environment } from "@domain/context/network/Environment";
import LogService from "@service/log/LogService";
import { SigningError } from "@port/out/error/SigningError";
import { SupportedWallets } from "@domain/context/network/Wallet";
import { WalletEvents, WalletPairedEvent } from "@service/event/WalletEvent";
import Injectable from "@core/injectable/Injectable";
import { TransactionType } from "@port/out/TransactionResponseEnums";
import Hex from "@core/Hex";
import { BaseHederaTransactionAdapter } from "@port/out/hs/BaseHederaTransactionAdapter";
import { HTSTransactionResponseAdapter } from "@port/out/response/HTSTransactionResponseAdapter";
import DfnsSettings from "@core/settings/custodialWalletSettings/DfnsSettings";
import { HederaId } from "@domain/context/shared/HederaId";
import FireblocksSettings from "@core/settings/custodialWalletSettings/FireblocksSettings";
import AWSKMSSettings from "@core/settings/custodialWalletSettings/AWSKMSSettings";
import { PublickKeyNotFound } from "./error/PublickKeyNotFound";
import { UnsupportedNetwork } from "@domain/context/network/error/UnsupportedNetwork";

export abstract class CustodialTransactionAdapter extends BaseHederaTransactionAdapter {
  protected client: Client;
  protected custodialWalletService: CustodialWalletService;
  public account: Account;
  protected network: Environment;

  constructor(
    @lazyInject(EventService) protected readonly eventService: EventService,
    @lazyInject(MirrorNodeAdapter)
    protected readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(NetworkService)
    protected readonly networkService: NetworkService,
  ) {
    super(mirrorNodeAdapter, networkService);
  }

  protected initClient(accountId: string, publicKey: string): void {
    const currentNetwork = this.networkService.environment;
    switch (currentNetwork) {
      case "testnet":
        this.client = Client.forTestnet();
        break;
      case "mainnet":
        this.client = Client.forMainnet();
        break;
      case "previewnet":
        this.client = Client.forPreviewnet();
        break;
      default:
        throw new UnsupportedNetwork();
    }
    this.client.setOperatorWith(accountId, publicKey, this.signingService);
  }

  protected signingService = async (message: Uint8Array): Promise<Uint8Array> => {
    const signatureRequest = new SignatureRequest(message);
    return await this.custodialWalletService.signTransaction(signatureRequest);
  };

  public async processTransaction(
    transaction: Transaction,
    transactionType: TransactionType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _startDate?: string,
  ): Promise<TransactionResponse> {
    try {
      const txResponse: HTransactionResponse = await transaction.execute(this.client);

      this.logTransaction(txResponse.transactionId.toString(), this.networkService.environment);

      return HTSTransactionResponseAdapter.manageResponse(
        this.networkService.environment,
        txResponse,
        transactionType,
        this.client,
      );
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(error);
    }
  }

  public supportsEvmOperations(): boolean {
    return false;
  }

  protected createWalletPairedEvent(wallet: SupportedWallets): WalletPairedEvent {
    return {
      wallet: wallet,
      data: {
        account: this.account,
        pairing: "",
        topic: "",
      },
      network: {
        name: this.networkService.environment,
        recognized: true,
        factoryId: this.networkService.configuration?.factoryAddress ?? "",
      },
    };
  }

  protected abstract initCustodialWalletService(settings: DfnsSettings | FireblocksSettings | AWSKMSSettings): void;

  protected abstract getSupportedWallet(): SupportedWallets;

  async register(settings: DfnsSettings | FireblocksSettings): Promise<InitializationData> {
    Injectable.registerTransactionHandler(this);
    const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(new HederaId(settings.hederaAccountId));
    if (!accountMirror.publicKey) {
      throw new PublickKeyNotFound();
    }

    this.account = new Account({
      id: settings.hederaAccountId,
      evmAddress: accountMirror.evmAddress,
      publicKey: accountMirror.publicKey,
    });

    this.initCustodialWalletService(settings);
    this.initClient(settings.hederaAccountId, accountMirror.publicKey.key);

    const wallet = this.getSupportedWallet();
    const eventData = this.createWalletPairedEvent(wallet);
    this.eventService.emit(WalletEvents.walletPaired, eventData);
    LogService.logTrace(`${wallet} registered as handler: `, eventData);

    return { account: this.getAccount() };
  }

  public getAccount(): Account {
    return this.account;
  }

  async sign(message: string): Promise<string> {
    if (!this.custodialWalletService) throw new SigningError("Custodial Wallet is empty");

    try {
      const encoded_message: Uint8Array = Hex.toUint8Array(message);
      const encoded_signed_message = await this.signingService(encoded_message);

      const hexArray = Array.from(encoded_signed_message, (byte) => ("0" + byte.toString(16)).slice(-2));

      return hexArray.join("");
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(error);
    }
  }
}
