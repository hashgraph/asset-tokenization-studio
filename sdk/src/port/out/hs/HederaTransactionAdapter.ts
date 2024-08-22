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
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import TransactionAdapter, { InitializationData } from '../TransactionAdapter';
import { ethers } from 'ethers';
import { singleton } from 'tsyringe';
import Injectable from '../../../core/Injectable.js';
import type { Provider } from '@ethersproject/providers';
import detectEthereumProvider from '@metamask/detect-provider';
import { RuntimeError } from '../../../core/error/RuntimeError.js';
import Account from '../../../domain/context/account/Account.js';
import { lazyInject } from '../../../core/decorator/LazyInjectDecorator.js';
import { MirrorNodeAdapter } from '../mirror/MirrorNodeAdapter.js';
import NetworkService from '../../../app/service/NetworkService.js';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { WalletConnectError } from '../../../domain/context/network/error/WalletConnectError.js';
import EventService from '../../../app/service/event/EventService.js';
import {
  ConnectionState,
  WalletEvents,
} from '../../../app/service/event/WalletEvent.js';
import { SupportedWallets } from '../../../domain/context/network/Wallet.js';
import LogService from '../../../app/service/LogService.js';
import { WalletConnectRejectedError } from '../../../domain/context/network/error/WalletConnectRejectedError.js';
import {
  HederaNetworks,
  unrecognized,
} from '../../../domain/context/network/Environment.js';
import { CommandBus } from '../../../core/command/CommandBus.js';
import { SetNetworkCommand } from '../../../app/usecase/command/network/setNetwork/SetNetworkCommand.js';
import { SetConfigurationCommand } from '../../../app/usecase/command/network/setConfiguration/SetConfigurationCommand.js';
import {
  EnvironmentMirrorNode,
  MirrorNode,
  MirrorNodes,
} from '../../../domain/context/network/MirrorNode.js';
import {
  EnvironmentJsonRpcRelay,
  JsonRpcRelay,
  JsonRpcRelays,
} from '../../../domain/context/network/JsonRpcRelay.js';
import {
  EnvironmentFactory,
  Factories,
} from '../../../domain/context/factory/Factories.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import {
  TRANSFER_GAS,
  PAUSE_GAS,
  UNPAUSE_GAS,
  REDEEM_GAS,
  CREATE_EQUITY_ST_GAS,
  CREATE_BOND_ST_GAS,
  GRANT_ROLES_GAS,
  MAX_ROLES_GAS,
  ISSUE_GAS,
  ADD_TO_CONTROL_LIST_GAS,
  REMOVE_FROM_CONTROL_LIST_GAS,
  CONTROLLER_TRANSFER_GAS,
  CONTROLLER_REDEEM_GAS,
  SET_DIVIDENDS_GAS,
  SET_VOTING_RIGHTS_GAS,
  RENOUNCE_ROLES_GAS,
  TAKE_SNAPSHOT_GAS,
  _PARTITION_ID_1,
  SET_DIVIDEND_EVENT,
  SET_VOTING_RIGHTS_EVENT,
  SET_DOCUMENT_GAS,
  REMOVE_DOCUMENT_GAS,
  AUTHORIZE_OPERATOR_GAS,
  REVOKE_OPERATOR_GAS,
  TRANSFER_OPERATOR_GAS,
  TRIGGER_PENDING_SCHEDULED_SNAPSHOTS_GAS,
  SET_MAX_SUPPLY_GAS,
  SET_COUPON_EVENT,
  SET_COUPON_GAS,
  LOCK_GAS,
  RELEASE_GAS,
  TRANSFER_AND_LOCK_GAS,
} from '../../../core/Constants.js';
import { Security } from '../../../domain/context/security/Security.js';
import { Rbac } from '../../../domain/context/factory/Rbac.js';
import { SecurityRole } from '../../../domain/context/security/SecurityRole.js';
import {
  FactoryEquityToken,
  FactoryBondToken,
  FactoryRegulationData,
} from '../../../domain/context/factory/FactorySecurityToken.js';
import { ERC20MetadataInfo } from '../../../domain/context/factory/ERC20Metadata.js';
import { SigningError } from '../error/SigningError.js';
import {
  Factory__factory,
  Pause__factory,
  AccessControl__factory,
  ERC1410ScheduledSnapshot__factory,
  ControlList__factory,
  Cap__factory,
  IBond,
  Bond__factory,
  TransferAndLock__factory,
} from '@hashgraph/asset-tokenization-contracts';
import {
  EnvironmentResolver,
  Resolvers,
} from '../../../domain/context/factory/Resolvers.js';
import {
  BusinessLogicKeys,
  EnvironmentBusinessLogicKeys,
} from '../../../domain/context/factory/BusinessLogicKeys.js';
import EvmAddress from '../../../domain/context/contract/EvmAddress.js';
import {
  Equity__factory,
  ERC1643__factory,
  IEquity,
  Snapshots__factory,
  ScheduledSnapshots__factory,
  Lock__factory,
} from '@hashgraph/asset-tokenization-contracts';
import { BondDetails } from '../../../domain/context/bond/BondDetails.js';
import { CouponDetails } from '../../../domain/context/bond/CouponDetails.js';
import { BondDetailsData } from '../../../domain/context/factory/BondDetailsData.js';
import { CouponDetailsData } from '../../../domain/context/factory/CouponDetailsData.js';
import { EquityDetails } from '../../../domain/context/equity/EquityDetails.js';
import { EquityDetailsData } from '../../../domain/context/factory/EquityDetailsData.js';
import { SecurityData } from '../../../domain/context/factory/SecurityData.js';
import { CastDividendType } from '../../../domain/context/equity/DividendType.js';
import { AdditionalSecurityData } from '../../../domain/context/factory/AdditionalSecurityData.js';
import {
  CastRegulationSubType,
  CastRegulationType,
} from '../../../domain/context/factory/RegulationType.js';
import { TransactionType } from '../TransactionResponseEnums.js';
import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  EthereumTransaction,
  Signer,
  Transaction,
  Long,
} from '@hashgraph/sdk';
import { toUtf8Bytes } from 'ethers/lib/utils.js';
import { eth } from 'web3';

export abstract class HederaTransactionAdapter extends TransactionAdapter {
  mirrorNodes: MirrorNodes;
  jsonRpcRelays: JsonRpcRelays;
  factories: Factories;
  resolvers: Resolvers;
  businessLogicKeysCommon: BusinessLogicKeys;
  businessLogicKeysEquity: BusinessLogicKeys;
  businessLogicKeysBond: BusinessLogicKeys;
  // common
  protected signer: Signer;

  constructor(
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    public readonly networkService: NetworkService,
  ) {
    super();
  }

  // ! Not used for now...
  // private async performSmartContractOperation(
  //   contractAddress: string,
  //   operationName: string,
  //   gas: number,
  //   params?: Params,
  //   transactionType: TransactionType = TransactionType.RECEIPT,
  //   contractAbi?: any,
  //   startDate?: string,
  // ): Promise<TransactionResponse> {
  //   const filteredContractParams =
  //     params === undefined || params === null
  //       ? []
  //       : Object.values(params).filter((element) => {
  //           return element !== undefined;
  //         });
  //   if (filteredContractParams.length < 1) {
  //     throw new Error('No parameters provided for the contract call');
  //   }
  //   for (let i = 0; i < filteredContractParams.length; i++) {
  //     if (Array.isArray(filteredContractParams[i])) {
  //       for (let j = 0; j < filteredContractParams[i].length; j++) {
  //         filteredContractParams[i][j] = await this.getEVMAddress(
  //           filteredContractParams[i][j],
  //         );
  //       }
  //     }
  //     filteredContractParams[i] = await this.getEVMAddress(
  //       filteredContractParams[i],
  //     );
  //   }

  //   return await this.contractCall(
  //     contractAddress,
  //     operationName,
  //     filteredContractParams,
  //     gas,
  //     transactionType,
  //     contractAbi,
  //     undefined,
  //     startDate,
  //   );
  // }

  // public async contractCall(
  //   contractAddress: string,
  //   functionName: string,
  //   parameters: any[],
  //   gas: number,
  //   trxType: TransactionType,
  //   abi: any,
  //   value?: number,
  //   startDate?: string,
  // ): Promise<TransactionResponse> {
  //   const functionCallParameters = this.encodeFunctionCall(
  //     functionName,
  //     parameters,
  //     abi,
  //   );
  //   const transaction: Transaction =
  //     HTSTransactionBuilder.buildContractExecuteTransaction(
  //       contractAddress,
  //       functionCallParameters,
  //       gas,
  //       value,
  //     );
  //   return await this.signAndSendTransaction(
  //     transaction,
  //     trxType,
  //     functionName,
  //     abi,
  //     startDate ?? undefined,
  //   );
  // }

  async createEquity(
    securityInfo: Security,
    equityInfo: EquityDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    businessLogicKeys: string[],
    diamondOwnerAccount?: EvmAddress,
  ): Promise<TransactionResponse> {
    const FUNCTION_NAME = 'deployEquity';
    try {
      if (!securityInfo.regulationType) {
        throw new Error(
          'regulation Type cannot be empty when creating a security',
        );
      }
      if (!securityInfo.regulationsubType) {
        throw new Error(
          'regulation subType cannot be empty when creating a security',
        );
      }

      const rbacAdmin: Rbac = {
        role: SecurityRole._DEFAULT_ADMIN_ROLE,
        members: [diamondOwnerAccount!.toString()],
      };
      const rbacs: Rbac[] = [rbacAdmin];

      const erc20MetadataInfo: ERC20MetadataInfo = {
        name: securityInfo.name,
        symbol: securityInfo.symbol,
        isin: securityInfo.isin,
        decimals: securityInfo.decimals,
      };

      const security: SecurityData = {
        isMultiPartition: securityInfo.isMultiPartition,
        resolver: resolver.toString(),
        businessLogicKeys: businessLogicKeys,
        rbacs: rbacs,
        isControllable: securityInfo.isControllable,
        isWhiteList: securityInfo.isWhiteList,
        maxSupply: securityInfo.maxSupply
          ? securityInfo.maxSupply.toString()
          : '0',
        erc20MetadataInfo: erc20MetadataInfo,
      };

      const equityDetails: EquityDetailsData = {
        votingRight: equityInfo.votingRight,
        informationRight: equityInfo.informationRight,
        liquidationRight: equityInfo.liquidationRight,
        subscriptionRight: equityInfo.subscriptionRight,
        convertionRight: equityInfo.convertionRight,
        redemptionRight: equityInfo.redemptionRight,
        putRight: equityInfo.putRight,
        dividendRight: CastDividendType.toNumber(equityInfo.dividendRight),
        currency: equityInfo.currency,
        nominalValue: equityInfo.nominalValue.toString(),
      };

      const securityTokenToCreate = new FactoryEquityToken(
        security,
        equityDetails,
      );

      const additionalSecurityData: AdditionalSecurityData = {
        countriesControlListType: securityInfo.isCountryControlListWhiteList,
        listOfCountries: securityInfo.countries ?? '',
        info: securityInfo.info ?? '',
      };

      const factoryRegulationData = new FactoryRegulationData(
        CastRegulationType.toNumber(securityInfo.regulationType),
        CastRegulationSubType.toNumber(securityInfo.regulationsubType),
        additionalSecurityData,
      );

      // Create and encode the function data
      const factoryInstance = new Factory__factory().attach(factory.toString());
      const functionDataEncodedHex =
        factoryInstance.interface.encodeFunctionData(FUNCTION_NAME, [
          securityTokenToCreate,
          factoryRegulationData,
        ]);
      const functionDataEncoded = new Uint8Array(
        Buffer.from(functionDataEncodedHex.slice(2), 'hex'),
      );

      const transaction = new ContractExecuteTransaction()
        .setContractId(factory.toString())
        .setGas(CREATE_EQUITY_ST_GAS)
        .setFunctionParameters(functionDataEncoded);

      return this.signAndSendTransaction(transaction);
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(
        `Unexpected error in RPCTransactionAdapter create operation : ${error}`,
      );
    }
  }

  async transfer(
    address: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    const FUNCTION_NAME = 'transferByPartition';
    LogService.logTrace(
      `Transfering ${amount} securities to account ${targetId.toString()}`,
    );

    // Create ContractFunctionParameters and add the parameters
    const functionParameters = new ContractFunctionParameters()
      .addBytes32(new Uint8Array(Buffer.from(_PARTITION_ID_1)))
      .addAddress(targetId.toString())
      .addUint256(Long.fromString(amount.toHexString()))
      .addBytes(Buffer.from('0x', 'hex'));
    const transaction = new ContractExecuteTransaction()
      .setContractId(address.toContractId().toString())
      .setGas(TRANSFER_GAS)
      .setFunction(FUNCTION_NAME, functionParameters);

    return this.signAndSendTransaction(transaction);
  }

  abstract signAndSendTransaction(
    transaction: Transaction,
  ): Promise<TransactionResponse>;
}
