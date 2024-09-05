import axios, { AxiosRequestConfig } from 'axios';
import { AxiosInstance } from 'axios';
import { singleton } from 'tsyringe';
import { PublicKey as HPublicKey } from '@hashgraph/sdk';
import { InvalidResponse } from './error/InvalidResponse.js';
import { REGEX_TRANSACTION } from '../error/TransactionResponseError.js';
import TransactionResultViewModel from '../../in/response/TransactionResultViewModel.js';
import ContractViewModel from '../../in/response/ContractViewModel.js';
import {
  ADDRESS_LENGTH,
  BYTES_32_LENGTH,
  TOPICS_IN_FACTORY_RESULT,
} from '../../../core/Constants.js';
import { Time } from '../../../core/Time.js';
import LogService from '../../../app/service/LogService.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import PublicKey from '../../../domain/context/account/PublicKey.js';
import { HederaId } from '../../../domain/context/shared/HederaId.js';
import { KeyType } from '../../../domain/context/account/KeyProps.js';
import EvmAddress from '../../../domain/context/contract/EvmAddress.js';
import { MirrorNode } from '../../../domain/context/network/MirrorNode.js';
import Account from '../../../domain/context/account/Account.js';

@singleton()
export class MirrorNodeAdapter {
  private instance: AxiosInstance;
  private config: AxiosRequestConfig;
  private mirrorNodeConfig: MirrorNode;

  public set(mnConfig: MirrorNode): void {
    this.mirrorNodeConfig = mnConfig;
    this.instance = axios.create({
      validateStatus: function (status: number) {
        return (status >= 200 && status < 300) || status == 404;
      },
    });

    this.mirrorNodeConfig.baseUrl = mnConfig.baseUrl.endsWith('/')
      ? mnConfig.baseUrl
      : `${mnConfig.baseUrl}/`;

    if (this.mirrorNodeConfig.headerName && this.mirrorNodeConfig.apiKey)
      this.instance.defaults.headers.common[this.mirrorNodeConfig.headerName] =
        this.mirrorNodeConfig.apiKey;
  }

  public async getHederaIdfromContractAddress(
    contractAddress: string,
  ): Promise<string> {
    if (!contractAddress) return '';
    if (contractAddress.length >= 40)
      return (await this.getContractInfo(contractAddress)).id;
    return contractAddress;
  }

  public async getAccountInfo(accountId: HederaId | string): Promise<Account> {
    try {
      LogService.logTrace(
        'Getting account info -> ',
        this.mirrorNodeConfig.baseUrl + 'accounts/' + accountId,
      );
      const res = await this.instance.get<IAccount>(
        this.mirrorNodeConfig.baseUrl + 'accounts/' + accountId.toString(),
      );

      const account: Account = {
        id: HederaId.from(res.data.account),
        evmAddress: res.data.evm_address,
        alias: res.data.alias,
      };

      if (res.data.key)
        account.publicKey = new PublicKey({
          key: res.data.key
            ? this.trimLeadingZeros(res.data.key.key)
            : undefined,
          type: res.data.key
            ? this.getPublicKeyType(res.data.key._type)
            : undefined,
        });

      return account;
    } catch (error) {
      LogService.logError(error);
      return Promise.reject<Account>(new InvalidResponse(error));
    }
  }

  /**
   * Retrieves the consensus timestamp for a given transaction ID.
   *
   * @param transactionId - The ID of the transaction.
   * @param timeout - The maximum time to wait for the consensus timestamp, in seconds. Default is 10 seconds.
   * @param requestInterval - The interval between each request to check for the consensus timestamp, in seconds. Default is 2 seconds.
   * @returns A Promise that resolves to the consensus timestamp as a string, or undefined if the timeout is reached.
   */
  public async getConsensusTimestamp({
    transactionId,
    timeout = 15,
    requestInterval = 2,
  }: {
    transactionId: string;
    timeout?: number;
    requestInterval?: number;
  }): Promise<string | undefined> {
    if (transactionId.match(REGEX_TRANSACTION)) {
      transactionId = transactionId
        .replace('@', '-')
        .replace(/.([^.]*)$/, '-$1');
    }
    const url = `${this.mirrorNodeConfig.baseUrl}transactions/${transactionId}`;
    let consensusTimestamp: string | undefined;
    do {
      await Time.delay(requestInterval, 'seconds');
      timeout = timeout - requestInterval;
      this.instance
        .get(url)
        .then((response) => {
          if (
            response.status === 200 &&
            response.data &&
            response.data.transactions &&
            response.data.transactions.length > 0 &&
            response.data.transactions[0] &&
            response.data.transactions[0].consensus_timestamp
          ) {
            consensusTimestamp =
              response.data.transactions[0].consensus_timestamp;
          }
        })
        .catch((error) => {
          LogService.logError(
            `Error getting consensus timestamp for transaction ${transactionId}: ${error}`,
          );
        });
    } while (timeout > 0 && !consensusTimestamp);
    return consensusTimestamp;
  }

  public async getContractLogData(
    contractId: string,
    consensusTimestamp: string,
  ): Promise<string[] | null> {
    const url = `${this.mirrorNodeConfig.baseUrl}contracts/${contractId}/results/logs?timestamp=${consensusTimestamp}`;
    try {
      const res = await this.instance.get(url);

      if (res.data.logs && res.data.logs.length > 0) {
        const log = res.data.logs[0];
        const data = log.data;

        if (
          data &&
          data.startsWith('0x') &&
          data.length >= 2 + TOPICS_IN_FACTORY_RESULT * BYTES_32_LENGTH
        ) {
          // 2 for "0x" and TOPICS_IN_FACTORY_RESULT * bytes32Length chars (32 bytes each)
          const addresses: string[] = [];

          for (let i = 0; i < TOPICS_IN_FACTORY_RESULT; i++) {
            const start =
              2 + i * BYTES_32_LENGTH + (BYTES_32_LENGTH - ADDRESS_LENGTH);
            const end = start + ADDRESS_LENGTH;
            const address = `0x${data.slice(start, end)}`;
            addresses.push(address);
          }

          return addresses;
        }
      }
      return null;
    } catch (error) {
      LogService.logError(error);
      return Promise.reject<string[]>(new InvalidResponse(error));
    }
  }

  private trimLeadingZeros(publicKey: string): string {
    return publicKey.replace(/^0+/, '');
  }

  private getPublicKeyType(publicKey: string): KeyType {
    switch (publicKey) {
      case 'ECDSA_SECP256K1':
        return KeyType.ECDSA;

      default:
        return publicKey as KeyType;
    }
  }

  public async getContractInfo(
    contractEvmAddress: string,
  ): Promise<ContractViewModel> {
    try {
      const url = `${this.mirrorNodeConfig.baseUrl}contracts/${contractEvmAddress}`;
      LogService.logTrace('Getting contract info -> ', url);

      const retry = 10;
      let i = 0;

      let response;
      do {
        if (i > 0) await new Promise((resolve) => setTimeout(resolve, 2000));

        response = await this.instance.get<IContract>(url);
        i++;
      } while (response.status !== 200 && i < retry);

      const contract: ContractViewModel = {
        id: response.data.contract_id,
        evmAddress: response.data.evm_address,
      };

      return contract;
    } catch (error) {
      LogService.logError(error);
      return Promise.reject<ContractViewModel>(new InvalidResponse(error));
    }
  }

  public async getTransactionResult(
    transactionId: string,
  ): Promise<TransactionResultViewModel> {
    try {
      const url =
        this.mirrorNodeConfig.baseUrl + 'contracts/results/' + transactionId;
      LogService.logTrace(url);
      const res = await this.instance.get<ITransactionResult>(url);
      if (!res.data.call_result)
        throw new Error('Response does not contain a transaction result');

      const result: TransactionResultViewModel = {
        result: res.data.call_result.toString(),
      };

      return result;
    } catch (error) {
      LogService.logError(error);
      return Promise.reject<TransactionResultViewModel>(
        new InvalidResponse(error),
      );
    }
  }

  public async getTransactionFinalError(
    transactionId: string,
  ): Promise<TransactionResultViewModel> {
    try {
      if (transactionId.match(REGEX_TRANSACTION))
        transactionId = transactionId
          .replace('@', '-')
          .replace(/.([^.]*)$/, '-$1');

      const url =
        this.mirrorNodeConfig.baseUrl + 'transactions/' + transactionId;
      LogService.logTrace(url);

      await new Promise((resolve) => setTimeout(resolve, 5000));
      const res = await this.instance.get<ITransactionList>(url);

      let lastChildTransaction: ITransaction;
      if (res.data.transactions) {
        lastChildTransaction =
          res.data.transactions[res.data.transactions.length - 1];
        LogService.logError(JSON.stringify(lastChildTransaction));
      } else {
        throw new Error('Response does not contain any transaction');
      }

      const result: TransactionResultViewModel = {
        result: lastChildTransaction.result,
      };

      return result;
    } catch (error) {
      LogService.logError(error);
      return Promise.reject<TransactionResultViewModel>(
        new InvalidResponse(error),
      );
    }
  }

  async accountToEvmAddress(accountId: string): Promise<EvmAddress> {
    try {
      const accountInfo: Account = await this.getAccountInfo(accountId);
      if (accountInfo.evmAddress) {
        return new EvmAddress(accountInfo.evmAddress);
      } else if (accountInfo.publicKey) {
        return this.getAccountEvmAddressFromPrivateKeyType(
          accountInfo.publicKey.type,
          accountInfo.publicKey.key,
          accountId,
        );
      } else {
        return Promise.reject<EvmAddress>('');
      }
    } catch (e) {
      throw new Error(
        'EVM address could not be retrieved for ' +
          accountId.toString() +
          ' error : ' +
          e,
      );
    }
  }

  private async getAccountEvmAddressFromPrivateKeyType(
    privateKeyType: string,
    publicKey: string,
    accountId: string,
  ): Promise<EvmAddress> {
    switch (privateKeyType) {
      case KeyType.ECDSA:
        return new EvmAddress(
          HPublicKey.fromString(publicKey).toEthereumAddress(),
        );

      default:
        return new EvmAddress(
          '0x' + (await this.getContractInfo(accountId)).evmAddress,
        );
    }
  }

  public async getHBARBalance(
    accountId: HederaId | string,
  ): Promise<BigDecimal> {
    try {
      const url = `${
        this.mirrorNodeConfig.baseUrl
      }balances?account.id=${accountId.toString()}`;
      LogService.logTrace(url);
      const res = await this.instance.get<IBalances>(url);
      if (!res.data.balances)
        throw new Error('Response does not contain a balances result');

      return BigDecimal.fromString(
        res.data.balances[res.data.balances.length - 1].balance.toString(),
      );
    } catch (error) {
      LogService.logError(error);
      return Promise.reject<BigDecimal>(new InvalidResponse(error));
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

interface IBalances {
  balances: IAccountBalance[];
}

interface IAccountBalance {
  account: string;
  balance: number;
  tokens: ITokenBalance[];
}

interface ITokenBalance {
  token_id: string;
  balance: number;
}
