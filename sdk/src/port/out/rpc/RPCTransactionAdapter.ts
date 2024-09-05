/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import TransactionAdapter, { InitializationData } from '../TransactionAdapter';
import { ethers, Signer } from 'ethers';
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
import { RPCTransactionResponseAdapter } from './RPCTransactionResponseAdapter.js';
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
import { DiamondArgs } from '../../../domain/context/factory/DiamondArgs.js';
import { DiamondInitialization } from '../../../domain/context/factory/DiamondInitialization.js';
import { Rbac } from '../../../domain/context/factory/Rbac.js';
import { SecurityRole } from '../../../domain/context/security/SecurityRole.js';
import {
  FactoryEquityToken,
  FactoryBondToken,
  FactoryRegulationData,
} from '../../../domain/context/factory/FactorySecurityToken.js';
import {
  ERC20Metadata,
  ERC20MetadataInfo,
} from '../../../domain/context/factory/ERC20Metadata.js';
import { SigningError } from '../error/SigningError.js';
import {
  ERC1594__factory,
  ERC20__factory,
  Factory__factory,
  Pause__factory,
  AccessControl__factory,
  IERC1594__factory,
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

declare const ethereum: MetaMaskInpageProvider;

type StaticConnect = { connect: (...args: any[]) => any };

type FactoryContract<T extends StaticConnect> = T['connect'] extends (
  ...args: any[]
) => infer K
  ? K
  : never;

@singleton()
export class RPCTransactionAdapter extends TransactionAdapter {
  account: Account;
  signerOrProvider: Signer | Provider;
  mirrorNodes: MirrorNodes;
  jsonRpcRelays: JsonRpcRelays;
  factories: Factories;
  resolvers: Resolvers;
  businessLogicKeysCommon: BusinessLogicKeys;
  businessLogicKeysEquity: BusinessLogicKeys;
  businessLogicKeysBond: BusinessLogicKeys;

  constructor(
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(NetworkService)
    private readonly networkService: NetworkService,
    @lazyInject(EventService)
    private readonly eventService: EventService,
    @lazyInject(CommandBus)
    private readonly commandBus: CommandBus,
  ) {
    super();
    this.registerMetamaskEvents();
  }

  async init(debug = false): Promise<string> {
    !debug && (await this.connectMetamask(false));
    const eventData = {
      initData: {
        account: this.account,
        pairing: '',
        topic: '',
      },
      wallet: SupportedWallets.METAMASK,
    };
    this.eventService.emit(WalletEvents.walletInit, eventData);
    LogService.logTrace('Metamask Initialized ', eventData);

    return this.networkService.environment;
  }

  async createEquity(
    securityInfo: Security,
    equityInfo: EquityDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    businessLogicKeys: string[],
    diamondOwnerAccount?: EvmAddress,
  ): Promise<TransactionResponse> {
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

      const factoryInstance = Factory__factory.connect(
        factory.toString(),
        this.signerOrProvider,
      );
      LogService.logTrace('Deploying factory: ', {
        security: securityTokenToCreate,
      });
      const res = await factoryInstance.deployEquity(
        securityTokenToCreate,
        factoryRegulationData,
        {
          gasLimit: CREATE_EQUITY_ST_GAS,
        },
      );

      // Put it into an array since structs change the response from the event and its not a simple array
      return await RPCTransactionResponseAdapter.manageResponse(
        res,
        this.networkService.environment,
        'EquityDeployed',
      );
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(
        `Unexpected error in RPCTransactionAdapter create operation : ${error}`,
      );
    }
  }

  async createBond(
    securityInfo: Security,
    bondInfo: BondDetails,
    couponInfo: CouponDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    businessLogicKeys: string[],
    diamondOwnerAccount?: EvmAddress,
  ): Promise<TransactionResponse> {
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

      const bondDetails: BondDetailsData = {
        currency: bondInfo.currency,
        nominalValue: bondInfo.nominalValue.toString(),
        startingDate: bondInfo.startingDate.toString(),
        maturityDate: bondInfo.maturityDate.toString(),
      };

      const couponDetails: CouponDetailsData = {
        couponFrequency: couponInfo.couponFrequency.toString(),
        couponRate: couponInfo.couponRate.toString(),
        firstCouponDate: couponInfo.firstCouponDate.toString(),
      };

      const securityTokenToCreate = new FactoryBondToken(
        security,
        bondDetails,
        couponDetails,
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

      const factoryInstance = Factory__factory.connect(
        factory.toString(),
        this.signerOrProvider,
      );
      LogService.logTrace('Deploying factory: ', {
        security: securityTokenToCreate,
      });
      const res = await factoryInstance.deployBond(
        securityTokenToCreate,
        factoryRegulationData,
        {
          gasLimit: CREATE_BOND_ST_GAS,
        },
      );

      // Put it into an array since structs change the response from the event and its not a simple array
      return await RPCTransactionResponseAdapter.manageResponse(
        res,
        this.networkService.environment,
        'BondDeployed',
      );
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(
        `Unexpected error in RPCTransactionAdapter create operation : ${error}`,
      );
    }
  }

  public setMirrorNodes(mirrorNodes?: MirrorNodes): void {
    if (mirrorNodes) this.mirrorNodes = mirrorNodes;
  }

  public setJsonRpcRelays(jsonRpcRelays?: JsonRpcRelays): void {
    if (jsonRpcRelays) this.jsonRpcRelays = jsonRpcRelays;
  }

  public setFactories(factories?: Factories): void {
    if (factories) this.factories = factories;
  }

  public setResolvers(resolvers?: Resolvers): void {
    if (resolvers) this.resolvers = resolvers;
  }

  public setBusinessLogicKeysCommon(
    businessLogicKeys?: BusinessLogicKeys,
  ): void {
    if (businessLogicKeys) this.businessLogicKeysCommon = businessLogicKeys;
  }

  public setBusinessLogicKeysEquity(
    businessLogicKeys?: BusinessLogicKeys,
  ): void {
    if (businessLogicKeys) this.businessLogicKeysEquity = businessLogicKeys;
  }

  public setBusinessLogicKeysBond(businessLogicKeys?: BusinessLogicKeys): void {
    if (businessLogicKeys) this.businessLogicKeysBond = businessLogicKeys;
  }

  async register(
    account?: Account,
    debug = false,
  ): Promise<InitializationData> {
    if (account) {
      const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
        account.id,
      );
      this.account = account;
      this.account.publicKey = accountMirror.publicKey;
    }
    Injectable.registerTransactionHandler(this);
    !debug && (await this.connectMetamask());

    LogService.logTrace('Metamask registered as handler');
    return Promise.resolve({ account });
  }

  stop(): Promise<boolean> {
    this.eventService.emit(WalletEvents.walletConnectionStatusChanged, {
      status: ConnectionState.Disconnected,
      wallet: SupportedWallets.METAMASK,
    });
    LogService.logTrace('Metamask stopped');
    this.eventService.emit(WalletEvents.walletDisconnect, {
      wallet: SupportedWallets.METAMASK,
    });
    return Promise.resolve(true);
  }

  getMirrorNodeAdapter(): MirrorNodeAdapter {
    return this.mirrorNodeAdapter;
  }

  async signAndSendTransaction(
    t: RPCTransactionAdapter,
  ): Promise<TransactionResponse> {
    throw new RuntimeError('Method not implemented.');
  }

  getAccount(): Account {
    return this.account;
  }

  /**
   * TODO consider leaving this as a service and putting two implementations on top for rpc and web wallet.
   */
  async connectMetamask(pair = true): Promise<void> {
    try {
      const ethProvider = await detectEthereumProvider({ silent: true });
      if (ethProvider) {
        this.eventService.emit(WalletEvents.walletFound, {
          wallet: SupportedWallets.METAMASK,
          name: SupportedWallets.METAMASK,
        });
        if (ethProvider.isMetaMask) {
          if (!ethereum.isConnected())
            throw new WalletConnectError('Metamask is not connected!');

          pair && (await this.pairWallet());
          this.signerOrProvider = new ethers.providers.Web3Provider(
            // @ts-expect-error No TS compatibility
            ethereum,
          ).getSigner();
        } else {
          throw new WalletConnectError('Metamask was not found!');
        }
      }
    } catch (error: any) {
      if ('code' in error && error.code === 4001) {
        throw new WalletConnectRejectedError(SupportedWallets.METAMASK);
      }
      if (error instanceof WalletConnectError) {
        throw error;
      }
      throw new RuntimeError((error as Error).message);
    }
  }

  private async setMetasmaskAccount(evmAddress: string): Promise<void> {
    let mirrorAccount = undefined;
    try {
      mirrorAccount = await this.mirrorNodeAdapter.getAccountInfo(evmAddress);
    } catch (e) {
      LogService.logError(
        'account could not be retrieved from mirror error : ' + e,
      );
    }
    if (mirrorAccount) {
      this.account = new Account({
        id: mirrorAccount.id!.toString(),
        evmAddress: mirrorAccount.evmAddress,
        publicKey: mirrorAccount.publicKey,
      });
      this.signerOrProvider = new ethers.providers.Web3Provider(
        // @ts-expect-error No TS compatibility
        ethereum,
      ).getSigner();
    } else {
      this.account = Account.NULL;
    }
    LogService.logTrace('Paired Metamask Wallet Event:', this.account);
  }

  private async setMetamaskNetwork(chainId: any): Promise<void> {
    let network = unrecognized;
    let factoryId = '';
    let resolverId = '';
    let businessLogicKeysCommon: string[] = [];
    let businessLogicKeysEquity: string[] = [];
    let businessLogicKeysBond: string[] = [];
    let mirrorNode: MirrorNode = {
      baseUrl: '',
      apiKey: '',
      headerName: '',
    };
    let rpcNode: JsonRpcRelay = {
      baseUrl: '',
      apiKey: '',
      headerName: '',
    };

    const metamaskNetwork = HederaNetworks.find(
      (i: any) => '0x' + i.chainId.toString(16) === chainId.toString(),
    );

    if (metamaskNetwork) {
      network = metamaskNetwork.network;

      if (this.factories) {
        try {
          const result = this.factories.factories.find(
            (i: EnvironmentFactory) =>
              i.environment === metamaskNetwork.network,
          );
          if (result) {
            factoryId = result.factory.toString();
          }
        } catch (e) {
          console.error(
            `Factories could not be found for environment ${metamaskNetwork.network} in  the initially provided list`,
          );
        }
      }
      if (this.resolvers) {
        try {
          const result = this.resolvers.resolvers.find(
            (i: EnvironmentResolver) =>
              i.environment === metamaskNetwork.network,
          );
          if (result) {
            resolverId = result.resolver.toString();
          }
        } catch (e) {
          console.error(
            `Resolvers could not be found for environment ${metamaskNetwork.network} in  the initially provided list`,
          );
        }
      }
      if (this.businessLogicKeysCommon) {
        try {
          const result = this.businessLogicKeysCommon.businesslogicKeys.find(
            (i: EnvironmentBusinessLogicKeys) =>
              i.environment === metamaskNetwork.network,
          );
          if (result) {
            businessLogicKeysCommon = result.businesslogicKeys;
          }
        } catch (e) {
          console.error(
            `Business Logic Keys Common could not be found for environment ${metamaskNetwork.network} in  the initially provided list`,
          );
        }
      }
      if (this.businessLogicKeysEquity) {
        try {
          const result = this.businessLogicKeysEquity.businesslogicKeys.find(
            (i: EnvironmentBusinessLogicKeys) =>
              i.environment === metamaskNetwork.network,
          );
          if (result) {
            businessLogicKeysEquity = result.businesslogicKeys;
          }
        } catch (e) {
          console.error(
            `Business Logic Keys Equity could not be found for environment ${metamaskNetwork.network} in  the initially provided list`,
          );
        }
      }
      if (this.businessLogicKeysBond) {
        try {
          const result = this.businessLogicKeysBond.businesslogicKeys.find(
            (i: EnvironmentBusinessLogicKeys) =>
              i.environment === metamaskNetwork.network,
          );
          if (result) {
            businessLogicKeysBond = result.businesslogicKeys;
          }
        } catch (e) {
          console.error(
            `Business Logic Keys Common could not be found for environment ${metamaskNetwork.network} in  the initially provided list`,
          );
        }
      }
      if (this.mirrorNodes) {
        try {
          const result = this.mirrorNodes.nodes.find(
            (i: EnvironmentMirrorNode) =>
              i.environment === metamaskNetwork.network,
          );
          if (result) {
            mirrorNode = result.mirrorNode;
          }
        } catch (e) {
          console.error(
            `Mirror Nodes could not be found for environment ${metamaskNetwork.network} in  the initially provided list`,
          );
        }
      }
      if ((this, this.jsonRpcRelays)) {
        try {
          const result = this.jsonRpcRelays.nodes.find(
            (i: EnvironmentJsonRpcRelay) =>
              i.environment === metamaskNetwork.network,
          );
          if (result) {
            rpcNode = result.jsonRpcRelay;
          }
        } catch (e) {
          console.error(
            `RPC Nodes could not be found for environment ${metamaskNetwork.network} in  the initially provided list`,
          );
        }
      }
      LogService.logTrace('Metamask Network:', chainId);
    } else {
      console.error(chainId + ' not an hedera network');
    }

    await this.commandBus.execute(
      new SetNetworkCommand(network, mirrorNode, rpcNode),
    );
    await this.commandBus.execute(
      new SetConfigurationCommand(
        factoryId,
        resolverId,
        businessLogicKeysCommon,
        businessLogicKeysEquity,
        businessLogicKeysBond,
      ),
    );

    this.signerOrProvider = new ethers.providers.Web3Provider(
      // @ts-expect-error No TS compatibility
      ethereum,
    ).getSigner();

    // await new Promise(f => setTimeout(f, 3000));
  }

  private async pairWallet(): Promise<void> {
    const accts = await ethereum.request({
      method: 'eth_requestAccounts',
    });
    if (accts && 'length' in accts) {
      const evmAddress = (accts as string[])[0];

      const chainId = await ethereum.request({ method: 'eth_chainId' });
      await this.setMetamaskNetwork(chainId);
      await this.setMetasmaskAccount(evmAddress);
      this.eventService.emit(WalletEvents.walletPaired, {
        data: {
          account: this.account,
          pairing: '',
          topic: '',
        },
        network: {
          name: this.networkService.environment,
          recognized: this.networkService.environment != unrecognized,
          factoryId: this.networkService.configuration
            ? this.networkService.configuration.factoryAddress
            : '',
          resolverId: this.networkService.configuration
            ? this.networkService.configuration.resolverAddress
            : '',
          businessLogicKeysCommon: this.networkService.configuration
            ? this.networkService.configuration.businessLogicKeysCommon
            : [],
          businessLogicKeysEquity: this.networkService.configuration
            ? this.networkService.configuration.businessLogicKeysEquity
            : [],
          businessLogicKeysBond: this.networkService.configuration
            ? this.networkService.configuration.businessLogicKeysBond
            : [],
        },
        wallet: SupportedWallets.METAMASK,
      });
    } else {
      LogService.logTrace('Paired Metamask failed with no accounts');
      this.eventService.emit(WalletEvents.walletDisconnect, {
        wallet: SupportedWallets.METAMASK,
      });
    }
  }

  private registerMetamaskEvents(): void {
    try {
      if (typeof window === 'undefined' || !(window as any)?.ethereum) return;
      ethereum.on('accountsChanged', async (acct) => {
        const accounts = acct as string[];
        if (accounts.length == 0) {
          LogService.logTrace('Metamask disconnected from the wallet');
          this.eventService.emit(WalletEvents.walletDisconnect, {
            wallet: SupportedWallets.METAMASK,
          });
        } else if (
          (this.account && accounts[0] !== this.account.evmAddress) ||
          !this.account
        ) {
          await this.setMetasmaskAccount(accounts[0]);
          this.eventService.emit(WalletEvents.walletPaired, {
            data: {
              account: this.account,
              pairing: '',
              topic: '',
            },
            network: {
              name: this.networkService.environment,
              recognized: this.networkService.environment != unrecognized,
              factoryId: this.networkService.configuration.factoryAddress,
              resolverId: this.networkService.configuration.resolverAddress,
              businessLogicKeysCommon:
                this.networkService.configuration.businessLogicKeysCommon,
              businessLogicKeysEquity:
                this.networkService.configuration.businessLogicKeysEquity,
              businessLogicKeysBond:
                this.networkService.configuration.businessLogicKeysBond,
            },
            wallet: SupportedWallets.METAMASK,
          });
        }
      });
      ethereum.on('chainChanged', async (chainId) => {
        await this.setMetamaskNetwork(chainId);
        let evmAddress = this.account.evmAddress;
        if (!evmAddress) {
          const accts = await ethereum.request({
            method: 'eth_requestAccounts',
          });
          evmAddress = accts && 'length' in accts ? (accts as string[])[0] : '';
        }
        await this.setMetasmaskAccount(evmAddress);
        this.eventService.emit(WalletEvents.walletPaired, {
          data: {
            account: this.account,
          },
          network: {
            name: this.networkService.environment,
            recognized: this.networkService.environment != unrecognized,
            factoryId: this.networkService.configuration
              ? this.networkService.configuration.factoryAddress
              : '',
            resolverId: this.networkService.configuration
              ? this.networkService.configuration.resolverAddress
              : '',
            businessLogicKeysCommon: this.networkService.configuration
              ? this.networkService.configuration.businessLogicKeysCommon
              : [],
            businessLogicKeysEquity: this.networkService.configuration
              ? this.networkService.configuration.businessLogicKeysEquity
              : [],
            businessLogicKeysBond: this.networkService.configuration
              ? this.networkService.configuration.businessLogicKeysBond
              : [],
          },
          wallet: SupportedWallets.METAMASK,
        });
      });
    } catch (error) {
      LogService.logError(error);
      throw new WalletConnectError('Ethereum is not defined');
    }
  }

  async transfer(
    address: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Transfering ${amount} securities to account ${targetId.toString()}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await ERC1410ScheduledSnapshot__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).transferByPartition(
        _PARTITION_ID_1,
        targetId.toString(),
        amount.toBigNumber(),
        '0x',
        {
          gasLimit: TRANSFER_GAS,
        },
      ),
      this.networkService.environment,
    );
  }

  async transferAndLock(
    address: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Transfering ${amount} securities to account ${targetId.toString()} and locking them until ${expirationDate.toString()}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await TransferAndLock__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).transferAndLockByPartition(
        _PARTITION_ID_1,
        targetId.toString(),
        amount.toBigNumber(),
        '0x',
        expirationDate.toBigNumber(),
        {
          gasLimit: TRANSFER_AND_LOCK_GAS,
        },
      ),
      this.networkService.environment,
    );
  }

  async redeem(
    address: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Redeeming ${amount} securities`);

    return RPCTransactionResponseAdapter.manageResponse(
      await ERC1410ScheduledSnapshot__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).redeemByPartition(_PARTITION_ID_1, amount.toBigNumber(), '0x', {
        gasLimit: REDEEM_GAS,
      }),
      this.networkService.environment,
    );
  }

  async pause(address: EvmAddress): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Pausing security: ${address.toString()}`);

    return RPCTransactionResponseAdapter.manageResponse(
      await Pause__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).pause({ gasLimit: PAUSE_GAS }),
      this.networkService.environment,
    );
  }

  async unpause(address: EvmAddress): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Unpausing security: ${address.toString()}`);

    return RPCTransactionResponseAdapter.manageResponse(
      await Pause__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).unpause({ gasLimit: UNPAUSE_GAS }),
      this.networkService.environment,
    );
  }

  async grantRole(
    address: EvmAddress,
    targetId: EvmAddress,
    role: SecurityRole,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Granting role ${role.toString()} to account: ${targetId.toString()}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await AccessControl__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).grantRole(role, targetId.toString(), { gasLimit: GRANT_ROLES_GAS }),
      this.networkService.environment,
    );
  }

  async applyRoles(
    address: EvmAddress,
    targetId: EvmAddress,
    roles: SecurityRole[],
    actives: boolean[],
  ): Promise<TransactionResponse<any, Error>> {
    let gas = roles.length * GRANT_ROLES_GAS;
    gas = gas > MAX_ROLES_GAS ? MAX_ROLES_GAS : gas;

    return RPCTransactionResponseAdapter.manageResponse(
      await AccessControl__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).applyRoles(roles, actives, targetId.toString(), { gasLimit: gas }),
      this.networkService.environment,
    );
  }

  async revokeRole(
    address: EvmAddress,
    targetId: EvmAddress,
    role: SecurityRole,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Revoking role ${role.toString()} to account: ${targetId.toString()}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await AccessControl__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).revokeRole(role, targetId.toString(), { gasLimit: GRANT_ROLES_GAS }),
      this.networkService.environment,
    );
  }

  async renounceRole(
    address: EvmAddress,
    role: SecurityRole,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Renounce role ${role.toString()}`);

    return RPCTransactionResponseAdapter.manageResponse(
      await AccessControl__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).renounceRole(role, { gasLimit: RENOUNCE_ROLES_GAS }),
      this.networkService.environment,
    );
  }

  async issue(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Issue ${amount} ${security} to account: ${targetId.toString()}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await ERC1410ScheduledSnapshot__factory.connect(
        security.toString(),
        this.signerOrProvider,
      ).issueByPartition(
        _PARTITION_ID_1,
        targetId.toString(),
        amount.toBigNumber(),
        '0x',
        { gasLimit: ISSUE_GAS },
      ),
      this.networkService.environment,
    );
  }

  async addToControlList(
    address: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Adding account ${targetId.toString()} to a control list`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await ControlList__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).addToControlList(targetId.toString(), {
        gasLimit: ADD_TO_CONTROL_LIST_GAS,
      }),
      this.networkService.environment,
    );
  }

  async removeFromControlList(
    address: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Adding account ${targetId.toString()} to a control list`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await ControlList__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).removeFromControlList(targetId.toString(), {
        gasLimit: REMOVE_FROM_CONTROL_LIST_GAS,
      }),
      this.networkService.environment,
    );
  }

  async controllerTransfer(
    address: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Force transfer ${amount} tokens from account ${sourceId.toString()} to account ${targetId.toString()}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await ERC1410ScheduledSnapshot__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).controllerTransferByPartition(
        _PARTITION_ID_1,
        sourceId.toString(),
        targetId.toString(),
        amount.toBigNumber(),
        '0x',
        '0x',
        {
          gasLimit: CONTROLLER_TRANSFER_GAS,
        },
      ),
      this.networkService.environment,
    );
  }

  async controllerRedeem(
    address: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Force redeem ${amount} tokens from account ${sourceId.toString()}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await ERC1410ScheduledSnapshot__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).controllerRedeemByPartition(
        _PARTITION_ID_1,
        sourceId.toString(),
        amount.toBigNumber(),
        '0x',
        '0x',
        {
          gasLimit: CONTROLLER_REDEEM_GAS,
        },
      ),
      this.networkService.environment,
    );
  }

  async setDividends(
    address: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    amount: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `equity: ${address} ,
      recordDate :${recordDate} , 
      executionDate: ${executionDate},
      amount : ${amount}  `,
    );
    const dividendStruct: IEquity.DividendStruct = {
      recordDate: recordDate.toBigNumber(),
      executionDate: executionDate.toBigNumber(),
      amount: amount.toBigNumber(),
    };
    return RPCTransactionResponseAdapter.manageResponse(
      await Equity__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).setDividends(dividendStruct, { gasLimit: SET_DIVIDENDS_GAS }),
      this.networkService.environment,
      SET_DIVIDEND_EVENT,
    );
  }

  async setVotingRights(
    address: EvmAddress,
    recordDate: BigDecimal,
    data: string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `equity: ${address} ,
      recordDate :${recordDate} , `,
    );
    const votingStruct: IEquity.VotingStruct = {
      recordDate: recordDate.toBigNumber(),
      data: data,
    };
    return RPCTransactionResponseAdapter.manageResponse(
      await Equity__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).setVoting(votingStruct, { gasLimit: SET_VOTING_RIGHTS_GAS }),
      this.networkService.environment,
      SET_VOTING_RIGHTS_EVENT,
    );
  }

  async setCoupon(
    address: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    rate: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `bond: ${address} ,
      recordDate :${recordDate} , 
      executionDate: ${executionDate},
      rate : ${rate}  `,
    );
    const couponStruct: IBond.CouponStruct = {
      recordDate: recordDate.toBigNumber(),
      executionDate: executionDate.toBigNumber(),
      rate: rate.toBigNumber(),
    };
    return RPCTransactionResponseAdapter.manageResponse(
      await Bond__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).setCoupon(couponStruct, { gasLimit: SET_COUPON_GAS }),
      this.networkService.environment,
      SET_COUPON_EVENT,
    );
  }

  async takeSnapshot(
    address: EvmAddress,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Take snapshot of: ${address.toString()}`);

    return RPCTransactionResponseAdapter.manageResponse(
      await Snapshots__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).takeSnapshot({ gasLimit: TAKE_SNAPSHOT_GAS }),
      this.networkService.environment,
    );
  }

  async setDocument(
    address: EvmAddress,
    name: string,
    uri: string,
    hash: string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Setting document: ${name}, with ${uri}, and hash ${hash} for security ${address.toString()}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await ERC1643__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).setDocument(name, uri, hash, { gasLimit: SET_DOCUMENT_GAS }),
      this.networkService.environment,
    );
  }

  async removeDocument(
    address: EvmAddress,
    name: string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Removing document: ${name} for security ${address.toString()}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await ERC1643__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).removeDocument(name, { gasLimit: REMOVE_DOCUMENT_GAS }),
      this.networkService.environment,
    );
  }

  async authorizeOperator(
    address: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `authorizing operator: ${targetId.toString()} for security ${address.toString()}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await ERC1410ScheduledSnapshot__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).authorizeOperator(targetId.toString(), {
        gasLimit: AUTHORIZE_OPERATOR_GAS,
      }),
      this.networkService.environment,
    );
  }
  async revokeOperator(
    address: EvmAddress,
    targetId: EvmAddress,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `revoking operator: ${targetId.toString()} for security ${address.toString()}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await ERC1410ScheduledSnapshot__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).revokeOperator(targetId.toString(), { gasLimit: REVOKE_OPERATOR_GAS }),
      this.networkService.environment,
    );
  }
  async authorizeOperatorByPartition(
    address: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `authorizing operator: ${targetId.toString()} for security ${address.toString()} and partition ${partitionId}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await ERC1410ScheduledSnapshot__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).authorizeOperatorByPartition(partitionId, targetId.toString(), {
        gasLimit: AUTHORIZE_OPERATOR_GAS,
      }),
      this.networkService.environment,
    );
  }
  async revokeOperatorByPartition(
    address: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `revoking operator: ${targetId.toString()} for security ${address.toString()} and partition ${partitionId}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await ERC1410ScheduledSnapshot__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).revokeOperatorByPartition(partitionId, targetId.toString(), {
        gasLimit: REVOKE_OPERATOR_GAS,
      }),
      this.networkService.environment,
    );
  }
  async operatorTransferByPartition(
    address: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    partitionId: string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Transfering ${amount} securities to account ${targetId.toString()} for partition ${partitionId}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await ERC1410ScheduledSnapshot__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).operatorTransferByPartition(
        partitionId,
        sourceId.toString(),
        targetId.toString(),
        amount.toBigNumber(),
        '0x',
        '0x',
        { gasLimit: TRANSFER_OPERATOR_GAS },
      ),
      this.networkService.environment,
    );
  }

  async setMaxSupply(
    security: EvmAddress,
    maxSupply: BigDecimal,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Setting max supply ${maxSupply} for security ${security.toString()}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await Cap__factory.connect(
        security.toString(),
        this.signerOrProvider,
      ).setMaxSupply(maxSupply.toBigNumber(), { gasLimit: SET_MAX_SUPPLY_GAS }),
      this.networkService.environment,
    );
  }

  async triggerPendingScheduledSnapshots(
    address: EvmAddress,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Triggerring pending scheduled snapshots for ${address.toString()}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await ScheduledSnapshots__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).triggerPendingScheduledSnapshots({
        gasLimit: TRIGGER_PENDING_SCHEDULED_SNAPSHOTS_GAS,
      }),
      this.networkService.environment,
    );
  }
  async triggerScheduledSnapshots(
    address: EvmAddress,
    max: number,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Triggerring up to ${max.toString()} pending scheduled snapshots for ${address.toString()}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await ScheduledSnapshots__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).triggerScheduledSnapshots(max, {
        gasLimit: TRIGGER_PENDING_SCHEDULED_SNAPSHOTS_GAS,
      }),
      this.networkService.environment,
    );
  }

  async lock(
    address: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Locking ${amount} tokens from account ${sourceId.toString()} until ${expirationDate}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await Lock__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).lockByPartition(
        _PARTITION_ID_1,
        amount.toBigNumber(),
        sourceId.toString(),
        expirationDate.toBigNumber(),
        {
          gasLimit: LOCK_GAS,
        },
      ),
      this.networkService.environment,
    );
  }

  async release(
    address: EvmAddress,
    sourceId: EvmAddress,
    lockId: number,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Releasing lock ${lockId} from account ${sourceId.toString()}`,
    );

    return RPCTransactionResponseAdapter.manageResponse(
      await Lock__factory.connect(
        address.toString(),
        this.signerOrProvider,
      ).releaseByPartition(_PARTITION_ID_1, lockId, sourceId.toString(), {
        gasLimit: RELEASE_GAS,
      }),
      this.networkService.environment,
    );
  }
}
