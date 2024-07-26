import axios, { AxiosRequestConfig } from 'axios';
import { AxiosInstance } from 'axios';
import { singleton } from 'tsyringe';
import TransactionResultViewModel from '../../in/response/TransactionResultViewModel.js';
import LogService from '../../../app/service/LogService.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import { PublicKey as HPublicKey } from '@hashgraph/sdk';
import PublicKey from '../../../domain/context/account/PublicKey.js';
import { InvalidResponse } from './error/InvalidResponse.js';
import { HederaId } from '../../../domain/context/shared/HederaId.js';
import { KeyType } from '../../../domain/context/account/KeyProps.js';
import EvmAddress from '../../../domain/context/contract/EvmAddress.js';
import { REGEX_TRANSACTION } from '../error/TransactionResponseError.js';
import { MirrorNode } from '../../../domain/context/network/MirrorNode.js';
import ContractViewModel from '../../in/response/ContractViewModel.js';
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
