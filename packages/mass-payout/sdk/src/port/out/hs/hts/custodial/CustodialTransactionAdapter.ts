// SPDX-License-Identifier: Apache-2.0

import { Logger } from "@nestjs/common"
import {
  Client,
  Transaction,
  TransactionReceipt,
  TransactionResponse as HTransactionResponse,
} from "@hiero-ledger/sdk"
import {
  CustodialWalletService,
  SignatureRequest,
} from "@hashgraph/hedera-custodians-integration"
import TransactionResponse from "@domain/transaction/TransactionResponse"
import Account from "@domain/account/Account"
import { InitializationData } from "../../../TransactionAdapter"
import EventService from "@app/services/event/EventService"
import { MirrorNodeAdapter } from "../../../mirror/MirrorNodeAdapter"
import NetworkService from "@app/services/network/NetworkService"
import { Environment } from "@domain/network/Environment"
import { SigningError } from "../../../error/SigningError"
import { SupportedWallets } from "@domain/network/Wallet"
import {
  WalletEvents,
  WalletPairedEvent,
} from "@app/services/event/WalletEvent"
import { TransactionType } from "../../../TransactionResponseEnums"
import Hex from "@core/Hex"
import TransactionHandlerRegistration from "@core/TransactionHandlerRegistration"
import { HederaTransactionAdapter } from "../../HederaTransactionAdapter"
import { HTSTransactionResponseAdapter } from "../HTSTransactionResponseAdapter"
import { HederaId } from "@domain/shared/HederaId"
import DfnsSettings from "@core/settings/custodialWalletSettings/DfnsSettings"
import { PublickKeyNotFound } from "./error/PublickKeyNotFound"
import { EvmAddressNotFound } from "./error/EvmAddressNotFound"
import { UnsupportedNetwork } from "@domain/network/error/UnsupportedNetwork"

export abstract class CustodialTransactionAdapter extends HederaTransactionAdapter {
  protected readonly logger = new Logger(CustodialTransactionAdapter.name)

  protected client: Client
  protected custodialWalletService: CustodialWalletService
  public account: Account
  protected network: Environment

  constructor(
    protected readonly eventService: EventService,
    protected readonly mirrorNodeAdapter: MirrorNodeAdapter,
    protected readonly networkService: NetworkService
  ) {
    super(mirrorNodeAdapter, networkService)
  }

  protected initClient(accountId: string, publicKey: string): void {
    const currentNetwork = this.networkService.environment
    switch (currentNetwork) {
      case "testnet":
        this.client = Client.forTestnet()
        break
      case "mainnet":
        this.client = Client.forMainnet()
        break
      case "previewnet":
        this.client = Client.forPreviewnet()
        break
      default:
        throw new UnsupportedNetwork()
    }

    this.client.setOperatorWith(accountId, publicKey, this.signingService)
  }

  protected signingService = async (
    message: Uint8Array
  ): Promise<Uint8Array> => {
    const signatureRequest = new SignatureRequest(message)
    return await this.custodialWalletService.signTransaction(signatureRequest)
  }

  public signAndSendTransaction = async (
    transaction: Transaction,
    transactionType: TransactionType,
    nameFunction?: string,
    abi?: object[]
  ): Promise<TransactionResponse> => {
    try {
      this.logger.log(
        "Custodial wallet signing and sending transaction:",
        nameFunction
      )

      const txResponse: HTransactionResponse = await transaction.execute(
        this.client
      )

      this.logger.log(
        txResponse.transactionId.toString(),
        this.networkService.environment
      )

      return HTSTransactionResponseAdapter.manageResponse(
        this.networkService.environment,
        txResponse,
        transactionType,
        this.client,
        nameFunction,
        abi
      )
    } catch (error) {
      this.logger.log(error)
      throw new SigningError(error)
    }
  }

  public signAndSendTransactionForDeployment = async (
    transaction: Transaction
  ): Promise<TransactionReceipt> => {
    try {
      this.logger.log("Custodial wallet signing and sending transaction")

      const transactionResponse: HTransactionResponse =
        await transaction.execute(this.client)

      return await HTSTransactionResponseAdapter.getReceipt(
        this.client,
        transactionResponse
      )
    } catch (error) {
      this.logger.log(error)
      throw new SigningError(error)
    }
  }

  protected createWalletPairedEvent(
    wallet: SupportedWallets
  ): WalletPairedEvent {
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
      },
    }
  }

  protected abstract initCustodialWalletService(settings: DfnsSettings): void

  protected abstract getSupportedWallet(): SupportedWallets

  async register(settings: DfnsSettings): Promise<InitializationData> {
    TransactionHandlerRegistration.registerTransactionHandler(this)
    const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
      new HederaId(settings.hederaAccountId)
    )
    if (!accountMirror.publicKey) {
      throw new PublickKeyNotFound()
    }
    if (!accountMirror.evmAddress) {
      throw new EvmAddressNotFound()
    }

    this.account = new Account({
      id: settings.hederaAccountId,
      publicKey: accountMirror.publicKey,
      evmAddress: accountMirror.evmAddress,
    })

    this.initCustodialWalletService(settings)
    this.initClient(settings.hederaAccountId, accountMirror.publicKey.key)

    const wallet = this.getSupportedWallet()
    const eventData = this.createWalletPairedEvent(wallet)
    this.eventService.emit(WalletEvents.walletPaired, eventData)
    this.logger.log(`${wallet} registered as handler: `, eventData)

    return { account: this.getAccount() }
  }

  public getAccount(): Account {
    return this.account
  }

  async sign(message: string): Promise<string> {
    if (!this.custodialWalletService)
      throw new SigningError("Custodial Wallet is empty")

    try {
      const encodedMessage: Uint8Array = Hex.toUint8Array(message)
      const encodedSignedMessage = await this.signingService(encodedMessage)

      const hexArray = Array.from(encodedSignedMessage, byte =>
        ("0" + byte.toString(16)).slice(-2)
      )

      return hexArray.join("")
    } catch (error) {
      this.logger.log(error)
      throw new SigningError(error)
    }
  }
}
