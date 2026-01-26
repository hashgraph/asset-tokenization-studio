// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { Logger } from "@nestjs/common"
import axios, { AxiosRequestConfig } from "axios"
import { AxiosInstance } from "axios"
import { PublicKey as HPublicKey } from "@hiero-ledger/sdk"
import { InvalidResponse } from "@core/error/InvalidResponse"
import { REGEX_TRANSACTION } from "../error/TransactionResponseError"
import TransactionResultViewModel from "@port/in/response/TransactionResultViewModel"
import ContractViewModel from "@port/in/response/ContractViewModel"
import { BYTES_32_LENGTH } from "@core/Constants"
import PublicKey from "@domain/account/PublicKey"
import { HederaId } from "@domain/shared/HederaId"
import { KeyType } from "@domain/account/KeyProps"
import EvmAddress from "@domain/contract/EvmAddress"
import { MirrorNode } from "@domain/network/MirrorNode"
import Account from "@domain/account/Account"
import { Time } from "@core/Time"
import { TransactionNotFound } from "./error/TransactionNotFound"
import { TransactionResultNotFound } from "./error/TransactionResultNotFound"
import { ErrorRetrievingEvmAddress } from "./error/ErrorRetrievingEvmAddress"

@Injectable()
export class MirrorNodeAdapter {
  private readonly logger = new Logger(MirrorNodeAdapter.name)

  private instance: AxiosInstance
  private config: AxiosRequestConfig
  private mirrorNodeConfig: MirrorNode

  public set(mnConfig: MirrorNode): void {
    this.mirrorNodeConfig = mnConfig
    this.instance = axios.create({
      validateStatus: function (status: number) {
        return (status >= 200 && status < 300) || status == 404
      },
    })

    this.mirrorNodeConfig.baseUrl = mnConfig.baseUrl.endsWith("/")
      ? mnConfig.baseUrl
      : `${mnConfig.baseUrl}/`

    if (this.mirrorNodeConfig.headerName && this.mirrorNodeConfig.apiKey)
      this.instance.defaults.headers.common[this.mirrorNodeConfig.headerName] =
        this.mirrorNodeConfig.apiKey
  }

  public async getHederaIdfromContractAddress(
    contractAddress: string
  ): Promise<string> {
    if (!contractAddress) return ""
    if (contractAddress.length >= 40)
      return (await this.getContractInfo(contractAddress)).id
    return contractAddress
  }

  public async getAccountInfo(accountId: HederaId | string): Promise<Account> {
    try {
      this.logger.log(
        "Getting account info -> ",
        this.mirrorNodeConfig.baseUrl + "accounts/" + accountId
      )
      const res = await this.instance.get<IAccount>(
        this.mirrorNodeConfig.baseUrl + "accounts/" + accountId.toString()
      )

      const account: Account = {
        id: HederaId.from(res.data.account),
        evmAddress: res.data.evm_address,
        alias: res.data.alias,
      }

      if (res.data.key)
        account.publicKey = new PublicKey({
          key: res.data.key
            ? this.trimLeadingZeros(res.data.key.key)
            : undefined,
          type: res.data.key
            ? this.getPublicKeyType(res.data.key._type)
            : undefined,
        })

      return account
    } catch (error) {
      this.logger.error(error)
      return Promise.reject<Account>(new InvalidResponse(error))
    }
  }

  public async getContractResults(
    transactionId: string,
    numberOfResultItems: number,
    evmAddress = false,
    timeout = 15,
    requestInterval = 2
  ): Promise<string[] | null> {
    if (transactionId.match(REGEX_TRANSACTION)) {
      transactionId = transactionId
        .replace("@", "-")
        .replace(/.([^.]*)$/, "-$1")
    }
    const url = `${this.mirrorNodeConfig.baseUrl}contracts/results/${transactionId}`
    let callOK = false
    const results: string[] = []

    do {
      await Time.delay(requestInterval, "seconds")
      timeout = timeout - requestInterval
      this.instance
        .get(url)
        .then(response => {
          if (
            response &&
            response.status === 200 &&
            response.data.call_result &&
            response.data.call_result.length > 2
          ) {
            try {
              callOK = true

              const data = response.data.call_result

              if (evmAddress) {
                results.push(response.data.address)
                return results
              }

              if (numberOfResultItems == 0) {
                numberOfResultItems = (data.length - 2) / BYTES_32_LENGTH
              }

              if (
                data &&
                data.startsWith("0x") &&
                data.length >= 2 + numberOfResultItems * BYTES_32_LENGTH
              ) {
                for (let i = 0; i < numberOfResultItems; i++) {
                  const start = 2 + i * BYTES_32_LENGTH
                  const end = start + BYTES_32_LENGTH
                  const result = `0x${data.slice(start, end)}`
                  results.push(result)
                }
                return results
              }

              return null
            } catch (error) {
              this.logger.error(error)
              return Promise.reject<string[]>(new InvalidResponse(error))
            }
          }
        })
        .catch(error => {
          this.logger.error(
            `Error getting contracts result for transaction ${transactionId}: ${error}`
          )
        })
    } while (timeout > 0 && !callOK)

    return results
  }

  private trimLeadingZeros(publicKey: string): string {
    return publicKey.replace(/^0+/, "")
  }

  private getPublicKeyType(publicKey: string): KeyType {
    switch (publicKey) {
      case "ECDSA_SECP256K1":
        return KeyType.ECDSA

      default:
        return publicKey as KeyType
    }
  }

  public async getContractInfo(
    contractEvmAddress: string
  ): Promise<ContractViewModel> {
    try {
      const url = `${this.mirrorNodeConfig.baseUrl}contracts/${contractEvmAddress}`
      this.logger.log("Getting contract info -> ", url)

      const retry = 10
      let i = 0

      let response
      do {
        if (i > 0) await new Promise(resolve => setTimeout(resolve, 2000))

        response = await this.instance.get<IContract>(url)
        i++
      } while (response.status !== 200 && i < retry)

      const contract: ContractViewModel = {
        id: response.data.contract_id,
        evmAddress: response.data.evm_address,
      }

      return contract
    } catch (error) {
      this.logger.error(error)
      return Promise.reject<ContractViewModel>(new InvalidResponse(error))
    }
  }

  public async getTransactionResult(
    transactionId: string
  ): Promise<TransactionResultViewModel> {
    try {
      const url =
        this.mirrorNodeConfig.baseUrl + "contracts/results/" + transactionId
      this.logger.log(url)
      const res = await this.instance.get<ITransactionResult>(url)
      if (!res.data.call_result) throw new TransactionResultNotFound()

      const result: TransactionResultViewModel = {
        result: res.data.call_result.toString(),
      }

      return result
    } catch (error) {
      this.logger.error(error)
      return Promise.reject<TransactionResultViewModel>(
        new InvalidResponse(error)
      )
    }
  }

  public async getTransactionFinalError(
    transactionId: string
  ): Promise<TransactionResultViewModel> {
    try {
      if (transactionId.match(REGEX_TRANSACTION))
        transactionId = transactionId
          .replace("@", "-")
          .replace(/.([^.]*)$/, "-$1")

      const url =
        this.mirrorNodeConfig.baseUrl + "transactions/" + transactionId
      this.logger.log(url)

      await new Promise(resolve => setTimeout(resolve, 5000))
      const res = await this.instance.get<ITransactionList>(url)

      let lastChildTransaction: ITransaction
      if (res.data.transactions) {
        lastChildTransaction =
          res.data.transactions[res.data.transactions.length - 1]
        this.logger.error(JSON.stringify(lastChildTransaction))
      } else {
        throw new TransactionNotFound()
      }

      const result: TransactionResultViewModel = {
        result: lastChildTransaction.result,
      }

      return result
    } catch (error) {
      this.logger.error(error)
      return Promise.reject<TransactionResultViewModel>(
        new InvalidResponse(error)
      )
    }
  }

  async accountToEvmAddress(accountId: string): Promise<EvmAddress> {
    try {
      const accountInfo: Account = await this.getAccountInfo(accountId)
      if (accountInfo.evmAddress) {
        return new EvmAddress(accountInfo.evmAddress)
      } else if (accountInfo.publicKey) {
        return this.getAccountEvmAddressFromPrivateKeyType(
          accountInfo.publicKey.type,
          accountInfo.publicKey.key,
          accountId
        )
      } else {
        return Promise.reject<EvmAddress>("")
      }
    } catch (e) {
      throw new ErrorRetrievingEvmAddress(accountId, e)
    }
  }

  private async getAccountEvmAddressFromPrivateKeyType(
    privateKeyType: string,
    publicKey: string,
    accountId: string
  ): Promise<EvmAddress> {
    switch (privateKeyType) {
      case KeyType.ECDSA:
        return new EvmAddress(
          HPublicKey.fromString(publicKey).toEthereumAddress()
        )

      default:
        return new EvmAddress(
          "0x" + (await this.getContractInfo(accountId)).evmAddress
        )
    }
  }
}

interface IContract {
  memo: string;
}

interface IAccount {
  evm_address: string;
  key: IKey;
  alias: string;
  account: string;
}

interface IContract {
  admin_key: IKey;
  nullable: boolean;
  auto_renew_account: string;
  auto_renew_period: string;
  contract_id: string;
  created_timestamp: string;
  deleted: string;
  evm_address: string;
  expiration_timestamp: string;
  file_id: string;
  max_automatic_token_associations: string;
  memo: string;
  obtainer_id: string;
  permanent_removal: string;
  proxy_account_id: string;
  timestamp: string;
}

interface ITransactionResult {
  call_result?: string;
}

interface ITransactionList {
  transactions: ITransaction[];
}

interface ITransaction {
  result: string;
}

interface IKey {
  _type: string;
  key: string;
}
