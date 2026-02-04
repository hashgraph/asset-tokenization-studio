// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
import {
  ContractCreateTransaction,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  Signer,
  Transaction,
} from "@hiero-ledger/sdk";
import {
  AccessControlFacet__factory,
  Bond__factory,
  BondUSAFacet__factory,
  CapFacet__factory,
  ControlListFacet__factory,
  DiamondFacet__factory,
  EquityUSAFacet__factory,
  ERC1643Facet__factory,
  Factory__factory,
  LockFacet__factory,
  ScheduledCrossOrderedTasksFacet__factory,
  SnapshotsFacet__factory,
  TransferAndLockFacet__factory,
  SsiManagementFacet__factory,
  KycFacet__factory,
  ClearingTransferFacet__factory,
  ClearingRedeemFacet__factory,
  ClearingHoldCreationFacet__factory,
  ClearingActionsFacet__factory,
  ExternalPauseManagementFacet__factory,
  MockedExternalPause__factory,
  ExternalControlListManagementFacet__factory,
  MockedBlacklist__factory,
  MockedWhitelist__factory,
  ExternalKycListManagementFacet__factory,
  MockedExternalKycList__factory,
  FreezeFacet__factory,
  ERC1410TokenHolderFacet__factory,
  ERC1410ManagementFacet__factory,
  HoldTokenHolderFacet__factory,
  HoldManagementFacet__factory,
  ERC3643ManagementFacet__factory,
  ERC3643OperationsFacet__factory,
  ERC3643BatchFacet__factory,
  TREXFactoryAts__factory,
  ProceedRecipientsFacet__factory,
  ERC1410IssuerFacet__factory,
  FixedRate__factory,
} from "@hashgraph/asset-tokenization-contracts";
import { _PARTITION_ID_1, EVM_ZERO_ADDRESS, GAS } from "@core/Constants";
import TransactionAdapter from "../TransactionAdapter";
import { MirrorNodeAdapter } from "../mirror/MirrorNodeAdapter";
import { SigningError } from "../error/SigningError";
import NetworkService from "@service/network/NetworkService";
import LogService from "@service/log/LogService";
import {
  FactoryBondFixedRateToken,
  FactoryBondToken,
  FactoryEquityToken,
  FactoryRegulationData,
} from "@domain/context/factory/FactorySecurityToken";
import { CastRegulationSubType, CastRegulationType } from "@domain/context/factory/RegulationType";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import { MirrorNodes } from "@domain/context/network/MirrorNode";
import { JsonRpcRelays } from "@domain/context/network/JsonRpcRelay";
import { Factories } from "@domain/context/factory/Factories";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { Security } from "@domain/context/security/Security";
import { Rbac } from "@domain/context/factory/Rbac";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { ERC20MetadataInfo } from "@domain/context/factory/ERC20Metadata";
import { Resolvers } from "@domain/context/factory/Resolvers";
import { BusinessLogicKeys } from "@domain/context/factory/BusinessLogicKeys";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { BondDetails } from "@domain/context/bond/BondDetails";
import { BondDetailsData } from "@domain/context/factory/BondDetailsData";
import { EquityDetails } from "@domain/context/equity/EquityDetails";
import { EquityDetailsData } from "@domain/context/factory/EquityDetailsData";
import { SecurityData } from "@domain/context/factory/SecurityData";
import { CastDividendType } from "@domain/context/equity/DividendType";
import { AdditionalSecurityData } from "@domain/context/factory/AdditionalSecurityData";
import { ResolverProxyConfiguration } from "@domain/context/factory/ResolverProxyConfiguration";
import { TransactionType } from "../TransactionResponseEnums";
import { TransferAndLock } from "@domain/context/security/TransferAndLock";
import { Hold, HoldIdentifier, ProtectedHold } from "@domain/context/security/Hold";
import { BasicTransferInfo, IssueData, OperatorTransferData } from "@domain/context/factory/ERC1410Metadata";
import {
  CastClearingOperationType,
  ClearingOperation,
  ClearingOperationFrom,
  ClearingOperationIdentifier,
  ClearingOperationType,
  ProtectedClearingOperation,
} from '@domain/context/security/Clearing';
import { MissingRegulationSubType } from '@domain/context/factory/error/MissingRegulationSubType';
import { MissingRegulationType } from '@domain/context/factory/error/MissingRegulationType';
import { BaseContract, Contract, ContractTransaction } from 'ethers';
import { CastRateStatus, RateStatus } from '@domain/context/bond/RateStatus';
import { ProtectionData } from '@domain/context/factory/ProtectionData';
import { BondFixedRateDetails } from '@domain/context/bond/BondFixedRateDetails';
import { BondFixedRateDetailsData } from '@domain/context/factory/BondFixedRateDetailsData';


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
    protected readonly mirrorNodeAdapter: MirrorNodeAdapter,
    protected readonly networkService: NetworkService,
  ) {
    super();
  }

  private async executeWithArgs<
    C extends BaseContract,
    F extends {
      [K in keyof C]: C[K] extends (...args: any[]) => Promise<ContractTransaction> ? K : never;
    }[keyof C] &
      string,
  >(
    contractInstance: C,
    functionName: F,
    contractId: ContractId | string,
    gas: number,
    args: Parameters<C[F] extends (...args: infer P) => any ? (...args: P) => any : never>,
  ): Promise<TransactionResponse<any, Error>> {
    const encodedHex = contractInstance.interface.encodeFunctionData(functionName, args as any);
    const encoded = new Uint8Array(Buffer.from(encodedHex.slice(2), "hex"));

    return this.buildAndSendTransaction(contractId, gas, (tx) => {
      tx.setFunctionParameters(encoded);
    });
  }

  private async executeWithParams(
    contractId: ContractId | string,
    gas: number,
    functionName: string,
    functionParameters: ContractFunctionParameters,
  ): Promise<TransactionResponse<any, Error>> {
    return this.buildAndSendTransaction(contractId, gas, (tx) => {
      tx.setFunction(functionName, functionParameters);
    });
  }

  private async buildAndSendTransaction(
    contractId: ContractId | string,
    gas: number,
    setup: (tx: ContractExecuteTransaction) => void,
  ): Promise<TransactionResponse<any, Error>> {
    const tx = new ContractExecuteTransaction().setContractId(contractId).setGas(gas);

    setup(tx);

    return this.signAndSendTransaction(tx);
  }

  // * Operations NOT Smart Contract related
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

  public setBusinessLogicKeysCommon(businessLogicKeys?: BusinessLogicKeys): void {
    if (businessLogicKeys) this.businessLogicKeysCommon = businessLogicKeys;
  }

  public setBusinessLogicKeysEquity(businessLogicKeys?: BusinessLogicKeys): void {
    if (businessLogicKeys) this.businessLogicKeysEquity = businessLogicKeys;
  }

  public setBusinessLogicKeysBond(businessLogicKeys?: BusinessLogicKeys): void {
    if (businessLogicKeys) this.businessLogicKeysBond = businessLogicKeys;
  }

  async createEquity(
    securityInfo: Security,
    equityInfo: EquityDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    configId: string,
    configVersion: number,
    compliance: EvmAddress,
    identityRegistryAddress: EvmAddress,
    externalPauses?: EvmAddress[],
    externalControlLists?: EvmAddress[],
    externalKycLists?: EvmAddress[],
    diamondOwnerAccount?: EvmAddress,
    factoryId?: ContractId | string,
  ): Promise<TransactionResponse> {
    try {
      if (!securityInfo.regulationType) {
        throw new MissingRegulationType();
      }
      if (!securityInfo.regulationsubType) {
        throw new MissingRegulationSubType();
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

      const resolverProxyConfiguration: ResolverProxyConfiguration = {
        key: configId,
        version: configVersion,
      };

      const security: SecurityData = {
        arePartitionsProtected: securityInfo.arePartitionsProtected,
        isMultiPartition: securityInfo.isMultiPartition,
        resolver: resolver.toString(),
        resolverProxyConfiguration: resolverProxyConfiguration,
        rbacs: rbacs,
        isControllable: securityInfo.isControllable,
        isWhiteList: securityInfo.isWhiteList,
        maxSupply: securityInfo.maxSupply ? securityInfo.maxSupply.toString() : "0",
        erc20VotesActivated: securityInfo.erc20VotesActivated,
        erc20MetadataInfo: erc20MetadataInfo,
        clearingActive: securityInfo.clearingActive,
        internalKycActivated: securityInfo.internalKycActivated,
        externalPauses: externalPauses?.map((address) => address.toString()) ?? [],
        externalControlLists: externalControlLists?.map((address) => address.toString()) ?? [],
        externalKycLists: externalKycLists?.map((address) => address.toString()) ?? [],
        compliance: compliance.toString(),
        identityRegistry: identityRegistryAddress?.toString(),
      };

      const equityDetails: EquityDetailsData = {
        votingRight: equityInfo.votingRight,
        informationRight: equityInfo.informationRight,
        liquidationRight: equityInfo.liquidationRight,
        subscriptionRight: equityInfo.subscriptionRight,
        conversionRight: equityInfo.conversionRight,
        redemptionRight: equityInfo.redemptionRight,
        putRight: equityInfo.putRight,
        dividendRight: CastDividendType.toNumber(equityInfo.dividendRight),
        currency: equityInfo.currency,
        nominalValue: equityInfo.nominalValue.toString(),
        nominalValueDecimals: equityInfo.nominalValueDecimals,
      };

      const securityTokenToCreate = new FactoryEquityToken(security, equityDetails);

      const additionalSecurityData: AdditionalSecurityData = {
        countriesControlListType: securityInfo.isCountryControlListWhiteList,
        listOfCountries: securityInfo.countries ?? "",
        info: securityInfo.info ?? "",
      };

      const factoryRegulationData = new FactoryRegulationData(
        CastRegulationType.toNumber(securityInfo.regulationType),
        CastRegulationSubType.toNumber(securityInfo.regulationsubType),
        additionalSecurityData,
      );

      LogService.logTrace(
        `Deploying equity: ${{
          security: securityTokenToCreate,
        }}`,
      );

      return this.executeWithArgs(
        new Factory__factory().attach(factory.toString()),
        "deployEquity",
        factoryId!,
        GAS.CREATE_EQUITY_ST,
        [securityTokenToCreate, factoryRegulationData],
      );
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(`Unexpected error in HederaTransactionAdapter create operation : ${error}`);
    }
  }

  async createBond(
    securityInfo: Security,
    bondInfo: BondDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    configId: string,
    configVersion: number,
    compliance: EvmAddress,
    identityRegistry: EvmAddress,
    externalPauses?: EvmAddress[],
    externalControlLists?: EvmAddress[],
    externalKycLists?: EvmAddress[],
    diamondOwnerAccount?: EvmAddress,
    proceedRecipients: EvmAddress[] = [],
    proceedRecipientsData: string[] = [],
    factoryId?: ContractId | string,
  ): Promise<TransactionResponse> {
    try {
      if (!securityInfo.regulationType) {
        throw new MissingRegulationType();
      }
      if (!securityInfo.regulationsubType) {
        throw new MissingRegulationSubType();
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

      const resolverProxyConfiguration: ResolverProxyConfiguration = {
        key: configId,
        version: configVersion,
      };

      const security: SecurityData = {
        arePartitionsProtected: securityInfo.arePartitionsProtected,
        isMultiPartition: securityInfo.isMultiPartition,
        resolver: resolver.toString(),
        resolverProxyConfiguration: resolverProxyConfiguration,
        rbacs: rbacs,
        isControllable: securityInfo.isControllable,
        isWhiteList: securityInfo.isWhiteList,
        maxSupply: securityInfo.maxSupply ? securityInfo.maxSupply.toString() : "0",
        erc20VotesActivated: securityInfo.erc20VotesActivated,
        erc20MetadataInfo: erc20MetadataInfo,
        clearingActive: securityInfo.clearingActive,
        internalKycActivated: securityInfo.internalKycActivated,
        externalPauses: externalPauses?.map((address) => address.toString()) ?? [],
        externalControlLists: externalControlLists?.map((address) => address.toString()) ?? [],
        externalKycLists: externalKycLists?.map((address) => address.toString()) ?? [],
        compliance: compliance.toString(),
        identityRegistry: identityRegistry.toString(),
      };

      const bondDetails = new BondDetailsData(
        bondInfo.currency,
        bondInfo.nominalValue.toString(),
        bondInfo.nominalValueDecimals,
        bondInfo.startingDate.toString(),
        bondInfo.maturityDate.toString(),
      );

      const securityTokenToCreate = new FactoryBondToken(
        security,
        bondDetails,
        proceedRecipients.map((addr) => addr.toString()),
        proceedRecipientsData.map((data) => (data == "" ? "0x" : data)),
      );

      const additionalSecurityData: AdditionalSecurityData = {
        countriesControlListType: securityInfo.isCountryControlListWhiteList,
        listOfCountries: securityInfo.countries ?? "",
        info: securityInfo.info ?? "",
      };

      const factoryRegulationData = new FactoryRegulationData(
        CastRegulationType.toNumber(securityInfo.regulationType),
        CastRegulationSubType.toNumber(securityInfo.regulationsubType),
        additionalSecurityData,
      );

      LogService.logTrace(
        `Deploying bond: ${{
          security: securityTokenToCreate,
        }}`,
      );

      return this.executeWithArgs(
        new Factory__factory().attach(factory.toString()),
        "deployBond",
        factoryId!,
        GAS.CREATE_BOND_ST,
        [securityTokenToCreate, factoryRegulationData],
      );
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(`Unexpected error in HederaTransactionAdapter create operation : ${error}`);
    }
  }

  async createBondFixedRate(
    securityInfo: Security,
    bondInfo: BondFixedRateDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    configId: string,
    configVersion: number,
    compliance: EvmAddress,
    identityRegistry: EvmAddress,
    externalPauses?: EvmAddress[],
    externalControlLists?: EvmAddress[],
    externalKycLists?: EvmAddress[],
    diamondOwnerAccount?: EvmAddress,
    proceedRecipients: EvmAddress[] = [],
    proceedRecipientsData: string[] = [],
    factoryId?: ContractId | string,
  ): Promise<TransactionResponse> {
    try {
      if (!securityInfo.regulationType) {
        throw new MissingRegulationType();
      }
      if (!securityInfo.regulationsubType) {
        throw new MissingRegulationSubType();
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

      const resolverProxyConfiguration: ResolverProxyConfiguration = {
        key: configId,
        version: configVersion,
      };

      const security: SecurityData = {
        arePartitionsProtected: securityInfo.arePartitionsProtected,
        isMultiPartition: securityInfo.isMultiPartition,
        resolver: resolver.toString(),
        resolverProxyConfiguration: resolverProxyConfiguration,
        rbacs: rbacs,
        isControllable: securityInfo.isControllable,
        isWhiteList: securityInfo.isWhiteList,
        maxSupply: securityInfo.maxSupply
          ? securityInfo.maxSupply.toString()
          : '0',
        erc20VotesActivated: securityInfo.erc20VotesActivated,
        erc20MetadataInfo: erc20MetadataInfo,
        clearingActive: securityInfo.clearingActive,
        internalKycActivated: securityInfo.internalKycActivated,
        externalPauses:
          externalPauses?.map((address) => address.toString()) ?? [],
        externalControlLists:
          externalControlLists?.map((address) => address.toString()) ?? [],
        externalKycLists:
          externalKycLists?.map((address) => address.toString()) ?? [],
        compliance: compliance.toString(),
        identityRegistry: identityRegistry.toString(),
      };

      const bondDetails = new BondDetailsData(
        bondInfo.currency,
        bondInfo.nominalValue.toString(),
        bondInfo.nominalValueDecimals,
        bondInfo.startingDate.toString(),
        bondInfo.maturityDate.toString(),
      );

      const securityTokenToCreate = new FactoryBondToken(
        security,
        bondDetails,
        proceedRecipients.map((addr) => addr.toString()),
        proceedRecipientsData.map((data) => (data == '' ? '0x' : data)),
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
      
      const bondFixedRateData = {
            bondData: securityTokenToCreate,
            factoryRegulationData: factoryRegulationData,
            fixedRateData: { rate: bondInfo.rate, rateDecimals: bondInfo.rateDecimals },
        };

      LogService.logTrace(
        `Deploying bond fixed rate: ${{
          security: securityTokenToCreate,
        }}`,
      );

      return this.executeWithArgs(
        new Factory__factory().attach(factory.toString()),
        'deployBondFixedRate',
        factoryId!,
        GAS.CREATE_BOND_ST,
        [bondFixedRateData],
      );
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(
        `Unexpected error in HederaTransactionAdapter create operation : ${error}`,
      );
    }
  }

  async transfer(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Transfering ${amount} securities to account ${targetId.toString()}`);

    const basicTransferInfo: BasicTransferInfo = {
      to: targetId.toString(),
      value: amount.toHexString(),
    };

    return this.executeWithArgs(
      new ERC1410TokenHolderFacet__factory().attach(security.toString()),
      "transferByPartition",
      securityId,
      GAS.TRANSFER,
      [_PARTITION_ID_1, basicTransferInfo, "0x"],
    );
  }

  async transferAndLock(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Transfering ${amount} securities to account ${targetId.toString()} and locking them until ${expirationDate.toString()}`,
    );
    return this.executeWithArgs(
      new TransferAndLockFacet__factory().attach(security.toString()),
      "transferAndLockByPartition",
      securityId,
      GAS.TRANSFER_AND_LOCK,
      [_PARTITION_ID_1, targetId.toString(), amount.toHexString(), "0x", expirationDate.toHexString()],
    );
  }

  async redeem(
    security: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Redeeming ${amount} securities from account ${security.toString()}`);
    return this.executeWithArgs(
      new ERC1410TokenHolderFacet__factory().attach(security.toString()),
      "redeemByPartition",
      securityId,
      GAS.REDEEM,
      [_PARTITION_ID_1, amount.toHexString(), "0x"],
    );
  }

  async burn(
    security: EvmAddress,
    source: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Burning ${amount} securities from account ${source.toString()}`);
    return this.executeWithArgs(
      new ERC3643OperationsFacet__factory().attach(security.toString()),
      "burn",
      securityId,
      GAS.BURN,
      [source.toString(), amount.toHexString()],
    );
  }

  async pause(security: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Pausing security: ${security.toString()}`);

    return this.executeWithParams(securityId, GAS.PAUSE, "pause", new ContractFunctionParameters());
  }

  async unpause(security: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Unpausing security: ${security.toString()}`);

    return this.executeWithParams(securityId, GAS.PAUSE, "unpause", new ContractFunctionParameters());
  }

  async grantRole(
    security: EvmAddress,
    targetId: EvmAddress,
    role: SecurityRole,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Granting role ${role.toString()} to account: ${targetId.toString()}`);

    const contract = new Contract(security.toString(), AccessControlFacet__factory.abi);

    return this.executeWithArgs(contract, "grantRole", securityId, GAS.GRANT_ROLES, [role, targetId.toString()]);
  }

  async applyRoles(
    security: EvmAddress,
    targetId: EvmAddress,
    roles: SecurityRole[],
    actives: boolean[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    let gas = roles.length * GAS.GRANT_ROLES;
    gas = gas > GAS.MAX_ROLES ? GAS.MAX_ROLES : gas;

    const contract = new Contract(security.toString(), AccessControlFacet__factory.abi);
    return this.executeWithArgs(contract, "applyRoles", securityId, gas, [roles, actives, targetId.toString()]);
  }

  async revokeRole(
    security: EvmAddress,
    targetId: EvmAddress,
    role: SecurityRole,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Revoking role ${role.toString()} to account: ${targetId.toString()}`);

    const contract = new Contract(security.toString(), AccessControlFacet__factory.abi);
    return this.executeWithArgs(contract, "revokeRole", securityId, GAS.GRANT_ROLES, [role, targetId.toString()]);
  }

  async renounceRole(
    security: EvmAddress,
    role: SecurityRole,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Renounce role ${role.toString()}`);

    const contract = new Contract(security.toString(), AccessControlFacet__factory.abi);
    return this.executeWithArgs(contract, "renounceRole", securityId, GAS.RENOUNCE_ROLES, [role]);
  }

  async issue(
    security: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Issue ${amount} ${security} to account: ${targetId.toString()}`);
    const issueData: IssueData = {
      partition: _PARTITION_ID_1,
      tokenHolder: targetId.toString(),
      value: amount.toHexString(),
      data: "0x",
    };
    return this.executeWithArgs(
      new ERC1410IssuerFacet__factory().attach(security.toString()),
      "issueByPartition",
      securityId,
      GAS.ISSUE,
      [issueData],
    );
  }

  async mint(
    security: EvmAddress,
    target: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Minting ${amount} ${security} to account: ${target.toString()}`);

    return this.executeWithArgs(
      new ERC3643OperationsFacet__factory().attach(security.toString()),
      "mint",
      securityId,
      GAS.MINT,
      [target.toString(), amount.toHexString()],
    );
  }

  async addToControlList(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Adding account ${targetId.toString()} to a control list`);
    return this.executeWithArgs(
      new ControlListFacet__factory().attach(security.toString()),
      "addToControlList",
      securityId,
      GAS.ADD_TO_CONTROL_LIST,
      [targetId.toString()],
    );
  }

  async removeFromControlList(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Removing account ${targetId.toString()} from a control list`);
    return this.executeWithArgs(
      new ControlListFacet__factory().attach(security.toString()),
      "removeFromControlList",
      securityId,
      GAS.REMOVE_FROM_CONTROL_LIST,
      [targetId.toString()],
    );
  }
  async controllerTransfer(
    security: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Controller transfer ${amount} tokens from account ${sourceId.toString()} to account ${targetId.toString()}`,
    );

    return this.executeWithArgs(
      new ERC1410ManagementFacet__factory().attach(security.toString()),
      "controllerTransferByPartition",
      securityId,
      GAS.CONTROLLER_TRANSFER,
      [_PARTITION_ID_1, sourceId.toString(), targetId.toString(), amount.toHexString(), "0x", "0x"],
    );
  }

  async forcedTransfer(
    security: EvmAddress,
    source: EvmAddress,
    target: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Forced transfer ${amount} tokens from account ${source.toString()} to account ${target.toString()}`,
    );
    return this.executeWithArgs(
      new ERC3643OperationsFacet__factory().attach(security.toString()),
      "forcedTransfer",
      securityId,
      GAS.FORCED_TRANSFER,
      [source.toString(), target.toString(), amount.toHexString()],
    );
  }

  async controllerRedeem(
    security: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Force redeem ${amount} tokens from account ${sourceId.toString()}`);
    return this.executeWithArgs(
      new ERC1410ManagementFacet__factory().attach(security.toString()),
      "controllerRedeemByPartition",
      securityId,
      GAS.CONTROLLER_REDEEM,
      [_PARTITION_ID_1, sourceId.toString(), amount.toHexString(), "0x", "0x"],
    );
  }

  async setDividends(
    security: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `equity: ${security} ,
      recordDate :${recordDate} , 
      executionDate: ${executionDate},
      amount : ${amount}  `,
    );

    const dividend = {
      recordDate: recordDate.toHexString(),
      executionDate: executionDate.toHexString(),
      amount: amount.toHexString(),
      amountDecimals: amount.decimals,
    };
    return this.executeWithArgs(
      new EquityUSAFacet__factory().attach(security.toString()),
      "setDividends",
      securityId,
      GAS.SET_DIVIDENDS,
      [dividend],
    );
  }

  async setVotingRights(
    security: EvmAddress,
    recordDate: BigDecimal,
    data: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `equity: ${security} ,
      recordDate :${recordDate} , `,
    );

    const voting = {
      recordDate: recordDate.toHexString(),
      data: data,
    };
    return this.executeWithArgs(
      new EquityUSAFacet__factory().attach(security.toString()),
      "setVoting",
      securityId,
      GAS.SET_VOTING_RIGHTS,
      [voting],
    );
  }

  async setCoupon(
    security: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    rate: BigDecimal,
    startDate: BigDecimal,
    endDate: BigDecimal,
    fixingDate: BigDecimal,
    rateStatus: RateStatus,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `bond: ${security} ,
      recordDate :${recordDate} , 
      executionDate: ${executionDate},
      rate : ${rate},
       startDate: ${startDate},
      endDate: ${endDate},
      fixingDate: ${fixingDate},
      rateStatus: ${rateStatus}`,
    );

    const coupon = {
      recordDate: recordDate.toHexString(),
      executionDate: executionDate.toHexString(),
      rate: rate.toHexString(),
      rateDecimals: rate.decimals,
      startDate: startDate.toBigNumber(),
      endDate: endDate.toBigNumber(),
      fixingDate: fixingDate.toBigNumber(),
      rateStatus: CastRateStatus.toNumber(rateStatus),
    };
    return this.executeWithArgs(
      new BondUSAFacet__factory().attach(security.toString()),
      "setCoupon",
      securityId,
      GAS.SET_COUPON,
      [coupon],
    );
  }

  async takeSnapshot(security: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Take snapshot of: ${security.toString()}`);

    return this.executeWithArgs(
      new SnapshotsFacet__factory().attach(security.toString()),
      "takeSnapshot",
      securityId,
      GAS.TAKE_SNAPSHOT,
      [],
    );
  }

  async setDocument(
    security: EvmAddress,
    name: string,
    uri: string,
    hash: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Setting document: ${name}, with ${uri}, and hash ${hash} for security ${security.toString()}`);
    return this.executeWithArgs(
      new ERC1643Facet__factory().attach(security.toString()),
      "setDocument",
      securityId,
      GAS.SET_DOCUMENT,
      [name, uri, hash],
    );
  }

  async removeDocument(
    security: EvmAddress,
    name: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Removing document: ${name} for security ${security.toString()}`);
    return this.executeWithArgs(
      new ERC1643Facet__factory().attach(security.toString()),
      "removeDocument",
      securityId,
      GAS.REMOVE_DOCUMENT,
      [name],
    );
  }

  async authorizeOperator(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`authorizing operator: ${targetId.toString()} for security ${security.toString()}`);
    return this.executeWithArgs(
      new ERC1410TokenHolderFacet__factory().attach(security.toString()),
      "authorizeOperator",
      securityId,
      GAS.AUTHORIZE_OPERATOR,
      [targetId.toString()],
    );
  }

  async revokeOperator(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`revoking operator: ${targetId.toString()} for security ${security.toString()}`);
    return this.executeWithArgs(
      new ERC1410TokenHolderFacet__factory().attach(security.toString()),
      "revokeOperator",
      securityId,
      GAS.REVOKE_OPERATOR,
      [targetId.toString()],
    );
  }

  async authorizeOperatorByPartition(
    security: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `authorizing operator: ${targetId.toString()} for security ${security.toString()} and partition ${partitionId}`,
    );
    return this.executeWithArgs(
      new ERC1410TokenHolderFacet__factory().attach(security.toString()),
      "authorizeOperatorByPartition",
      securityId,
      GAS.AUTHORIZE_OPERATOR,
      [partitionId, targetId.toString()],
    );
  }

  async revokeOperatorByPartition(
    security: EvmAddress,
    targetId: EvmAddress,
    partitionId: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `revoking operator: ${targetId.toString()} for security ${security.toString()} and partition ${partitionId}`,
    );
    return this.executeWithArgs(
      new ERC1410TokenHolderFacet__factory().attach(security.toString()),
      "revokeOperatorByPartition",
      securityId,
      GAS.REVOKE_OPERATOR,
      [partitionId, targetId.toString()],
    );
  }

  async operatorTransferByPartition(
    security: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    partitionId: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Transfering ${amount} securities to account ${targetId.toString()} from account ${sourceId.toString()} on partition ${partitionId}`,
    );

    const operatorTransferData: OperatorTransferData = {
      partition: partitionId,
      from: sourceId.toString(),
      to: targetId.toString(),
      value: amount.toHexString(),
      data: "0x",
      operatorData: "0x",
    };
    return this.executeWithArgs(
      new ERC1410ManagementFacet__factory().attach(security.toString()),
      "operatorTransferByPartition",
      securityId,
      GAS.TRANSFER_OPERATOR,
      [operatorTransferData],
    );
  }

  async setMaxSupply(
    security: EvmAddress,
    maxSupply: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Setting max supply ${maxSupply} for security ${security.toString()}`);

    return this.executeWithArgs(
      new CapFacet__factory().attach(security.toString()),
      "setMaxSupply",
      securityId,
      GAS.SET_MAX_SUPPLY,
      [maxSupply.toHexString()],
    );
  }

  async triggerPendingScheduledSnapshots(
    security: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Triggering pending scheduled snapshots for ${security.toString()}`);
    return this.executeWithArgs(
      new ScheduledCrossOrderedTasksFacet__factory().attach(security.toString()),
      "triggerPendingScheduledCrossOrderedTasks",
      securityId,
      GAS.TRIGGER_PENDING_SCHEDULED_SNAPSHOTS,
      [],
    );
  }

  async triggerScheduledSnapshots(
    security: EvmAddress,
    max: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Triggering up to ${max.toString()} pending scheduled snapshots for ${security.toString()}`);
    return this.executeWithArgs(
      new ScheduledCrossOrderedTasksFacet__factory().attach(security.toString()),
      "triggerScheduledCrossOrderedTasks",
      securityId,
      GAS.TRIGGER_PENDING_SCHEDULED_SNAPSHOTS,
      [max.toHexString()],
    );
  }

  async lock(
    security: EvmAddress,
    sourceId: EvmAddress,
    amount: BigDecimal,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Locking ${amount} tokens from account ${sourceId.toString()} until ${expirationDate}`);
    return this.executeWithArgs(
      new LockFacet__factory().attach(security.toString()),
      "lockByPartition",
      securityId,
      GAS.LOCK,
      [_PARTITION_ID_1, amount.toHexString(), sourceId.toString(), expirationDate.toHexString()],
    );
  }

  async release(
    security: EvmAddress,
    sourceId: EvmAddress,
    lockId: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Releasing lock ${lockId} from account ${sourceId.toString()}`);
    return this.executeWithArgs(
      new LockFacet__factory().attach(security.toString()),
      "releaseByPartition",
      securityId,
      GAS.RELEASE,
      [_PARTITION_ID_1, lockId.toHexString(), sourceId.toString()],
    );
  }

  async updateConfigVersion(
    security: EvmAddress,
    configVersion: number,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Updating config version`);
    return this.executeWithArgs(
      new DiamondFacet__factory().attach(security.toString()),
      "updateConfigVersion",
      securityId,
      GAS.UPDATE_CONFIG_VERSION,
      [configVersion],
    );
  }

  async updateConfig(
    security: EvmAddress,
    configId: string,
    configVersion: number,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Updating config`);
    return this.executeWithArgs(
      new DiamondFacet__factory().attach(security.toString()),
      "updateConfig",
      securityId,
      GAS.UPDATE_CONFIG,
      [configId, configVersion],
    );
  }

  async updateResolver(
    security: EvmAddress,
    resolver: EvmAddress,
    configVersion: number,
    configId: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Updating Resolver`);
    return this.executeWithArgs(
      new DiamondFacet__factory().attach(security.toString()),
      "updateResolver",
      securityId,
      GAS.UPDATE_RESOLVER,
      [resolver.toString(), configId, configVersion],
    );
  }

  async updateMaturityDate(
    security: EvmAddress,
    maturityDate: number,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Updating bond maturity date ${maturityDate} for security ${security.toString()}`);
    const contract = new Contract(security.toString(), Bond__factory.abi);
    return this.executeWithArgs(contract, "updateMaturityDate", securityId, GAS.UPDATE_MATURITY_DATE, [maturityDate]);
  }

  async setScheduledBalanceAdjustment(
    security: EvmAddress,
    executionDate: BigDecimal,
    factor: BigDecimal,
    decimals: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `equity: ${security} ,
      executionDate :${executionDate} , 
      factor: ${factor},
      decimals : ${decimals}  `,
    );

    const scheduleBalanceAdjustment = {
      executionDate: executionDate.toHexString(),
      factor: factor.toHexString(),
      decimals: decimals.toHexString(),
    };
    return this.executeWithArgs(
      new EquityUSAFacet__factory().attach(security.toString()),
      "setScheduledBalanceAdjustment",
      securityId,
      GAS.SET_SCHEDULED_BALANCE_ADJUSTMENT,
      [scheduleBalanceAdjustment],
    );
  }

  async protectPartitions(
    security: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Protecting Partitions for security: ${security.toString()}`);
    return this.executeWithParams(
      securityId,
      GAS.PROTECT_PARTITION,
      "protectPartitions",
      new ContractFunctionParameters(),
    );
  }

  async unprotectPartitions(
    security: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Unprotecting Partitions for security: ${security.toString()}`);
    return this.executeWithParams(
      securityId,
      GAS.UNPROTECT_PARTITION,
      "unprotectPartitions",
      new ContractFunctionParameters(),
    );
  }

  async protectedRedeemFromByPartition(
    security: EvmAddress,
    partitionId: string,
    sourceId: EvmAddress,
    amount: BigDecimal,
    deadline: BigDecimal,
    nounce: BigDecimal,
    signature: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Protected Redeeming ${amount} securities from account ${sourceId.toString()}`);

    const protectionData: ProtectionData = {
      deadline: deadline.toBigNumber(),
      nounce: nounce.toBigNumber(),
      signature: signature,
    };

    return this.executeWithArgs(
      new ERC1410ManagementFacet__factory().attach(security.toString()),
      "protectedRedeemFromByPartition",
      securityId,
      GAS.PROTECTED_REDEEM,
      [partitionId, sourceId.toString(), amount.toBigNumber(), protectionData],
    );
  }

  async protectedTransferFromByPartition(
    security: EvmAddress,
    partitionId: string,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    deadline: BigDecimal,
    nounce: BigDecimal,
    signature: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Protected Transfering ${amount} securities from account ${sourceId.toString()} to account ${targetId.toString()}`,
    );

    const protectionData: ProtectionData = {
      deadline: deadline.toBigNumber(),
      nounce: nounce.toBigNumber(),
      signature: signature,
    };

    return this.executeWithArgs(
      new ERC1410ManagementFacet__factory().attach(security.toString()),
      "protectedTransferFromByPartition",
      securityId,
      GAS.PROTECTED_TRANSFER,
      [partitionId, sourceId.toString(), targetId.toString(), amount.toBigNumber(), protectionData],
    );
  }

  async createHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Holding ${amount} tokens from account ${targetId.toString()} until ${expirationDate} with escrow ${escrowId}`,
    );
    const hold: Hold = {
      amount: amount.toBigNumber(),
      expirationTimestamp: expirationDate.toBigNumber(),
      escrow: escrowId.toString(),
      to: targetId.toString(),
      data: "0x",
    };
    return this.executeWithArgs(
      new HoldTokenHolderFacet__factory().attach(security.toString()),
      "createHoldByPartition",
      securityId,
      GAS.CREATE_HOLD,
      [partitionId, hold],
    );
  }

  async createHoldFromByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Holding ${amount} tokens from account ${sourceId.toString()} until ${expirationDate} with escrow ${escrowId}`,
    );

    const hold: Hold = {
      amount: amount.toBigNumber(),
      expirationTimestamp: expirationDate.toBigNumber(),
      escrow: escrowId.toString(),
      to: targetId.toString(),
      data: "0x",
    };
    return this.executeWithArgs(
      new HoldTokenHolderFacet__factory().attach(security.toString()),
      "createHoldFromByPartition",
      securityId,
      GAS.CREATE_HOLD_FROM,
      [partitionId, sourceId.toString(), hold, "0x"],
    );
  }

  async controllerCreateHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Controller Holding ${amount} tokens from account ${sourceId.toString()} until ${expirationDate} with escrow ${escrowId}`,
    );

    const hold: Hold = {
      amount: amount.toBigNumber(),
      expirationTimestamp: expirationDate.toBigNumber(),
      escrow: escrowId.toString(),
      to: targetId.toString(),
      data: "0x",
    };

    return this.executeWithArgs(
      new HoldManagementFacet__factory().attach(security.toString()),
      "controllerCreateHoldByPartition",
      securityId,
      GAS.CONTROLLER_CREATE_HOLD,
      [partitionId, sourceId.toString(), hold, "0x"],
    );
  }

  async protectedCreateHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    escrowId: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    deadline: BigDecimal,
    nonce: BigDecimal,
    signature: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Protected Holding ${amount} tokens from account ${sourceId.toString()} until ${expirationDate} with escrow ${escrowId}`,
    );

    const hold: Hold = {
      amount: amount.toBigNumber(),
      expirationTimestamp: expirationDate.toBigNumber(),
      escrow: escrowId.toString(),
      to: targetId.toString(),
      data: "0x",
    };
    const protectedHold: ProtectedHold = {
      hold: hold,
      deadline: deadline.toBigNumber(),
      nonce: nonce.toBigNumber(),
    };

    return this.executeWithArgs(
      new HoldManagementFacet__factory().attach(security.toString()),
      "protectedCreateHoldByPartition",
      securityId,
      GAS.PROTECTED_CREATE_HOLD,
      [partitionId, sourceId.toString(), protectedHold, signature],
    );
  }

  async releaseHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    holdId: number,
    targetId: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Releasing hold amount ${amount} from account ${targetId.toString()}}`);

    const holdIdentifier: HoldIdentifier = {
      partition: partitionId,
      tokenHolder: targetId.toString(),
      holdId,
    };

    return this.executeWithArgs(
      new HoldTokenHolderFacet__factory().attach(security.toString()),
      "releaseHoldByPartition",
      securityId,
      GAS.RELEASE_HOLD,
      [holdIdentifier, amount.toBigNumber()],
    );
  }

  async reclaimHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    holdId: number,
    targetId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Reclaiming hold from account ${targetId.toString()}}`);

    const holdIdentifier: HoldIdentifier = {
      partition: partitionId,
      tokenHolder: targetId.toString(),
      holdId,
    };

    return this.executeWithArgs(
      new HoldTokenHolderFacet__factory().attach(security.toString()),
      "reclaimHoldByPartition",
      securityId,
      GAS.RECLAIM_HOLD,
      [holdIdentifier],
    );
  }

  async executeHoldByPartition(
    security: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    amount: BigDecimal,
    partitionId: string,
    holdId: number,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(
      `Executing hold with Id ${holdId} from account ${sourceId.toString()} to account ${targetId.toString()}`,
    );

    const holdIdentifier: HoldIdentifier = {
      partition: partitionId,
      tokenHolder: sourceId.toString(),
      holdId,
    };

    return this.executeWithArgs(
      new HoldTokenHolderFacet__factory().attach(security.toString()),
      "executeHoldByPartition",
      securityId,
      GAS.EXECUTE_HOLD_BY_PARTITION,
      [holdIdentifier, targetId.toString(), amount.toBigNumber()],
    );
  }

  async addIssuer(
    security: EvmAddress,
    issuer: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Adding issuer ${issuer}`);

    return this.executeWithArgs(
      new SsiManagementFacet__factory().attach(security.toString()),
      "addIssuer",
      securityId,
      GAS.ADD_ISSUER,
      [issuer.toString()],
    );
  }

  async setRevocationRegistryAddress(
    security: EvmAddress,
    revocationRegistry: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Setting revocation registry address ${revocationRegistry}`);
    return this.executeWithArgs(
      new SsiManagementFacet__factory().attach(security.toString()),
      "setRevocationRegistryAddress",
      securityId,
      GAS.SET_REVOCATION_REGISTRY,
      [revocationRegistry.toString()],
    );
  }

  async removeIssuer(
    security: EvmAddress,
    issuer: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Removing issuer ${issuer}`);

    return this.executeWithArgs(
      new SsiManagementFacet__factory().attach(security.toString()),
      "removeIssuer",
      securityId,
      GAS.REMOVE_ISSUER,
      [issuer.toString()],
    );
  }

  async grantKyc(
    security: EvmAddress,
    targetId: EvmAddress,
    vcBase64: string,
    validFrom: BigDecimal,
    validTo: BigDecimal,
    issuer: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Granting KYC from issuer ${issuer.toString()} to address ${targetId.toString()} with VC ${vcBase64}`,
    );

    return this.executeWithArgs(
      new KycFacet__factory().attach(security.toString()),
      "grantKyc",
      securityId,
      GAS.GRANT_KYC,
      [targetId.toString(), vcBase64, validFrom.toBigNumber(), validTo.toBigNumber(), issuer.toString()],
    );
  }

  async revokeKyc(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Revoking KYC to address ${targetId.toString()}`);

    return this.executeWithArgs(
      new KycFacet__factory().attach(security.toString()),
      "revokeKyc",
      securityId,
      GAS.REVOKE_KYC,
      [targetId.toString()],
    );
  }

  async activateClearing(security: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Activate Clearing to address ${security.toString()}`);

    return this.executeWithParams(
      securityId,
      GAS.ACTIVATE_CLEARING,
      "activateClearing",
      new ContractFunctionParameters(),
    );
  }

  async deactivateClearing(security: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Deactivate Clearing to address ${security.toString()}`);
    return this.executeWithParams(
      securityId,
      GAS.DEACTIVATE_CLEARING,
      "deactivateClearing",
      new ContractFunctionParameters(),
    );
  }

  async clearingTransferByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Clearing Transfer By Partition to address ${security.toString()}`);

    const clearingOperation: ClearingOperation = {
      partition: partitionId,
      expirationTimestamp: expirationDate.toBigNumber(),
      data: "0x",
    };

    return this.executeWithArgs(
      new ClearingTransferFacet__factory().attach(security.toString()),
      "clearingTransferByPartition",
      securityId,
      GAS.CLEARING_TRANSFER_BY_PARTITION,
      [clearingOperation, amount.toBigNumber(), targetId.toString()],
    );
  }

  async clearingTransferFromByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Clearing Transfer From By Partition to address ${security.toString()}`);

    const clearingOperationFrom: ClearingOperationFrom = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: expirationDate.toBigNumber(),
        data: "0x",
      },
      from: sourceId.toString(),
      operatorData: "0x",
    };

    return this.executeWithArgs(
      new ClearingTransferFacet__factory().attach(security.toString()),
      "clearingTransferFromByPartition",
      securityId,
      GAS.CLEARING_TRANSFER_FROM_BY_PARTITION,
      [clearingOperationFrom, amount.toBigNumber(), targetId.toString()],
    );
  }

  async protectedClearingTransferByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    deadline: BigDecimal,
    nonce: BigDecimal,
    signature: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Protected Clearing Transfer By Partition to address ${security.toString()}`);

    const protectedClearingOperation: ProtectedClearingOperation = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: expirationDate.toBigNumber(),
        data: "0x",
      },
      from: sourceId.toString(),
      deadline: deadline.toBigNumber(),
      nonce: nonce.toBigNumber(),
    };

    return this.executeWithArgs(
      new ClearingTransferFacet__factory().attach(security.toString()),
      "protectedClearingTransferByPartition",
      securityId,
      GAS.PROTECTED_CLEARING_TRANSFER_BY_PARTITION,
      [protectedClearingOperation, amount.toBigNumber(), targetId.toString(), signature],
    );
  }

  async approveClearingOperationByPartition(
    security: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
    clearingId: number,
    clearingOperationType: ClearingOperationType,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Approve Clearing Operation By Partition to address ${security.toString()}`);

    const clearingOperationIdentifier: ClearingOperationIdentifier = {
      partition: partitionId,
      tokenHolder: targetId.toString(),
      clearingOperationType: CastClearingOperationType.toNumber(clearingOperationType),
      clearingId: clearingId,
    };

    return this.executeWithArgs(
      new ClearingActionsFacet__factory().attach(security.toString()),
      "approveClearingOperationByPartition",
      securityId,
      GAS.APPROVE_CLEARING_TRANSFER_BY_PARTITION,
      [clearingOperationIdentifier],
    );
  }

  async cancelClearingOperationByPartition(
    security: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
    clearingId: number,
    clearingOperationType: ClearingOperationType,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Cancel Clearing Operation By Partition to address ${security.toString()}`);

    const clearingOperationIdentifier: ClearingOperationIdentifier = {
      partition: partitionId,
      tokenHolder: targetId.toString(),
      clearingOperationType: CastClearingOperationType.toNumber(clearingOperationType),
      clearingId: clearingId,
    };

    return this.executeWithArgs(
      new ClearingActionsFacet__factory().attach(security.toString()),
      "cancelClearingOperationByPartition",
      securityId,
      GAS.CANCEL_CLEARING_TRANSFER_BY_PARTITION,
      [clearingOperationIdentifier],
    );
  }

  async reclaimClearingOperationByPartition(
    security: EvmAddress,
    partitionId: string,
    targetId: EvmAddress,
    clearingId: number,
    clearingOperationType: ClearingOperationType,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Reclaim Clearing Operation By Partition to address ${security.toString()}`);

    const clearingOperationIdentifier: ClearingOperationIdentifier = {
      partition: partitionId,
      tokenHolder: targetId.toString(),
      clearingOperationType: CastClearingOperationType.toNumber(clearingOperationType),
      clearingId: clearingId,
    };

    return this.executeWithArgs(
      new ClearingActionsFacet__factory().attach(security.toString()),
      "reclaimClearingOperationByPartition",
      securityId,
      GAS.RECLAIM_CLEARING_TRANSFER_BY_PARTITION,
      [clearingOperationIdentifier],
    );
  }

  async clearingRedeemByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Clearing Redeem By Partition to address ${security.toString()}`);

    const clearingOperation: ClearingOperation = {
      partition: partitionId,
      expirationTimestamp: expirationDate.toBigNumber(),
      data: "0x",
    };

    return this.executeWithArgs(
      new ClearingRedeemFacet__factory().attach(security.toString()),
      "clearingRedeemByPartition",
      securityId,
      GAS.CLEARING_REDEEM_BY_PARTITION,
      [clearingOperation, amount.toBigNumber()],
    );
  }

  async clearingRedeemFromByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Clearing Redeem From By Partition to address ${security.toString()}`);

    const clearingOperationFrom: ClearingOperationFrom = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: expirationDate.toBigNumber(),
        data: "0x",
      },
      from: sourceId.toString(),
      operatorData: "0x",
    };

    return this.executeWithArgs(
      new ClearingRedeemFacet__factory().attach(security.toString()),
      "clearingRedeemFromByPartition",
      securityId,
      GAS.CLEARING_REDEEM_FROM_BY_PARTITION,
      [clearingOperationFrom, amount.toBigNumber()],
    );
  }

  async protectedClearingRedeemByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    expirationDate: BigDecimal,
    deadline: BigDecimal,
    nonce: BigDecimal,
    signature: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Protected Clearing Redeem By Partition to address ${security.toString()}`);

    const protectedClearingOperation: ProtectedClearingOperation = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: expirationDate.toBigNumber(),
        data: "0x",
      },
      from: sourceId.toString(),
      deadline: deadline.toBigNumber(),
      nonce: nonce.toBigNumber(),
    };

    return this.executeWithArgs(
      new ClearingRedeemFacet__factory().attach(security.toString()),
      "protectedClearingRedeemByPartition",
      securityId,
      GAS.PROTECTED_CLEARING_REDEEM_BY_PARTITION,
      [protectedClearingOperation, amount.toBigNumber(), signature],
    );
  }

  async clearingCreateHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    targetId: EvmAddress,
    clearingExpirationDate: BigDecimal,
    holdExpirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Clearing Create Hold By Partition to address ${security.toString()}`);

    const clearingOperation: ClearingOperation = {
      partition: partitionId,
      expirationTimestamp: clearingExpirationDate.toBigNumber(),
      data: "0x",
    };

    const hold: Hold = {
      amount: amount.toBigNumber(),
      expirationTimestamp: holdExpirationDate.toBigNumber(),
      escrow: escrowId.toString(),
      to: targetId.toString(),
      data: "0x",
    };

    return this.executeWithArgs(
      new ClearingHoldCreationFacet__factory().attach(security.toString()),
      "clearingCreateHoldByPartition",
      securityId,
      GAS.CLEARING_CREATE_HOLD_BY_PARTITION,
      [clearingOperation, hold],
    );
  }

  async clearingCreateHoldFromByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    clearingExpirationDate: BigDecimal,
    holdExpirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Clearing Create Hold From By Partition to address ${security.toString()}`);

    const clearingOperationFrom: ClearingOperationFrom = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: clearingExpirationDate.toBigNumber(),
        data: "0x",
      },
      from: sourceId.toString(),
      operatorData: "0x",
    };

    const hold: Hold = {
      amount: amount.toBigNumber(),
      expirationTimestamp: holdExpirationDate.toBigNumber(),
      escrow: escrowId.toString(),
      to: targetId.toString(),
      data: "0x",
    };

    return this.executeWithArgs(
      new ClearingHoldCreationFacet__factory().attach(security.toString()),
      "clearingCreateHoldFromByPartition",
      securityId,
      GAS.CLEARING_CREATE_HOLD_FROM_BY_PARTITION,
      [clearingOperationFrom, hold],
    );
  }

  async protectedClearingCreateHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    escrowId: EvmAddress,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    clearingExpirationDate: BigDecimal,
    holdExpirationDate: BigDecimal,
    deadline: BigDecimal,
    nonce: BigDecimal,
    signature: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse<any, Error>> {
    LogService.logTrace(`Protected Clearing Create Hold By Partition to address ${security.toString()}`);

    const protectedClearingOperation: ProtectedClearingOperation = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: clearingExpirationDate.toBigNumber(),
        data: "0x",
      },
      from: sourceId.toString(),
      deadline: deadline.toBigNumber(),
      nonce: nonce.toBigNumber(),
    };

    const hold: Hold = {
      amount: amount.toBigNumber(),
      expirationTimestamp: holdExpirationDate.toBigNumber(),
      escrow: escrowId.toString(),
      to: targetId.toString(),
      data: "0x",
    };

    return this.executeWithArgs(
      new ClearingHoldCreationFacet__factory().attach(security.toString()),
      "protectedClearingCreateHoldByPartition",
      securityId,
      GAS.PROTECTED_CLEARING_CREATE_HOLD_BY_PARTITION,
      [protectedClearingOperation, hold, signature],
    );
  }

  async operatorClearingCreateHoldByPartition(
    security: EvmAddress,
    partitionId: string,
    escrowId: EvmAddress,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    clearingExpirationDate: BigDecimal,
    holdExpirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Operator Clearing Create Hold By Partition to address ${security.toString()}`);

    const clearingOperationFrom: ClearingOperationFrom = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: clearingExpirationDate.toBigNumber(),
        data: "0x",
      },
      from: sourceId.toString(),
      operatorData: "0x",
    };

    const hold: Hold = {
      amount: amount.toBigNumber(),
      expirationTimestamp: holdExpirationDate.toBigNumber(),
      escrow: escrowId.toString(),
      to: targetId.toString(),
      data: "0x",
    };

    return this.executeWithArgs(
      new ClearingHoldCreationFacet__factory().attach(security.toString()),
      "operatorClearingCreateHoldByPartition",
      securityId,
      GAS.OPERATOR_CLEARING_CREATE_HOLD_BY_PARTITION,
      [clearingOperationFrom, hold],
    );
  }

  async operatorClearingRedeemByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Operator Clearing Redeem By Partition to address ${security.toString()}`);

    const clearingOperationFrom: ClearingOperationFrom = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: expirationDate.toBigNumber(),
        data: "0x",
      },
      from: sourceId.toString(),
      operatorData: "0x",
    };

    return this.executeWithArgs(
      new ClearingRedeemFacet__factory().attach(security.toString()),
      "operatorClearingRedeemByPartition",
      securityId,
      GAS.OPERATOR_CLEARING_REDEEM_BY_PARTITION,
      [clearingOperationFrom, amount.toBigNumber()],
    );
  }

  async operatorClearingTransferByPartition(
    security: EvmAddress,
    partitionId: string,
    amount: BigDecimal,
    sourceId: EvmAddress,
    targetId: EvmAddress,
    expirationDate: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Operator Clearing Transfer By Partition to address ${security.toString()}`);

    const clearingOperationFrom: ClearingOperationFrom = {
      clearingOperation: {
        partition: partitionId,
        expirationTimestamp: expirationDate.toBigNumber(),
        data: "0x",
      },
      from: sourceId.toString(),
      operatorData: "0x",
    };

    return this.executeWithArgs(
      new ClearingTransferFacet__factory().attach(security.toString()),
      "operatorClearingTransferByPartition",
      securityId,
      GAS.OPERATOR_CLEARING_TRANSFER_BY_PARTITION,
      [clearingOperationFrom, amount.toBigNumber(), targetId.toString()],
    );
  }

  async updateExternalPauses(
    security: EvmAddress,
    externalPausesAddresses: EvmAddress[],
    actives: boolean[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Updating External Pauses for security ${security.toString()}`);

    return this.executeWithArgs(
      new ExternalPauseManagementFacet__factory().attach(security.toString()),
      "updateExternalPauses",
      securityId,
      GAS.UPDATE_EXTERNAL_PAUSES,
      [externalPausesAddresses.map((address) => address.toString()), actives],
    );
  }

  async addExternalPause(
    security: EvmAddress,
    externalPauseAddress: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Adding External Pause for security ${security.toString()}`);

    return this.executeWithArgs(
      new ExternalPauseManagementFacet__factory().attach(security.toString()),
      "addExternalPause",
      securityId,
      GAS.ADD_EXTERNAL_PAUSE,
      [externalPauseAddress.toString()],
    );
  }

  async removeExternalPause(
    security: EvmAddress,
    externalPauseAddress: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Removing External Pause for security ${security.toString()}`);

    return this.executeWithArgs(
      new ExternalPauseManagementFacet__factory().attach(security.toString()),
      "removeExternalPause",
      securityId,
      GAS.REMOVE_EXTERNAL_PAUSE,
      [externalPauseAddress.toString()],
    );
  }

  async setPausedMock(
    contract: EvmAddress,
    paused: boolean,
    contractId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Setting paused to external pause mock contract ${contract.toString()}`);

    return this.executeWithArgs(
      new MockedExternalPause__factory().attach(contract.toString()),
      "setPaused",
      contractId,
      GAS.SET_PAUSED_MOCK,
      [paused],
    );
  }

  async createExternalPauseMock(): Promise<TransactionResponse> {
    LogService.logTrace(`Deploying External Pause Mock contract`);

    const bytecodeHex = MockedExternalPause__factory.bytecode.startsWith("0x")
      ? MockedExternalPause__factory.bytecode.slice(2)
      : MockedExternalPause__factory.bytecode;
    const bytecode = Uint8Array.from(Buffer.from(bytecodeHex, "hex"));

    const contractCreate = new ContractCreateTransaction().setBytecode(bytecode).setGas(GAS.CREATE_EXTERNAL_PAUSE_MOCK);
    //TODO: Review signandsend
    return this.signAndSendTransaction(contractCreate);
  }

  async updateExternalControlLists(
    security: EvmAddress,
    externalControlListsAddresses: EvmAddress[],
    actives: boolean[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Updating External Control Lists for security ${security.toString()}`);

    return this.executeWithArgs(
      new ExternalControlListManagementFacet__factory().attach(security.toString()),
      "updateExternalControlLists",
      securityId,
      GAS.UPDATE_EXTERNAL_CONTROL_LISTS,
      [externalControlListsAddresses.map((address) => address.toString()), actives],
    );
  }

  async addExternalControlList(
    security: EvmAddress,
    externalControlListAddress: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Adding External Control Lists for security ${security.toString()}`);

    return this.executeWithArgs(
      new ExternalControlListManagementFacet__factory().attach(security.toString()),
      "addExternalControlList",
      securityId,
      GAS.ADD_EXTERNAL_CONTROL_LIST,
      [externalControlListAddress.toString()],
    );
  }

  async removeExternalControlList(
    security: EvmAddress,
    externalControlListAddress: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Removing External Control Lists for security ${security.toString()}`);

    return this.executeWithArgs(
      new ExternalControlListManagementFacet__factory().attach(security.toString()),
      "removeExternalControlList",
      securityId,
      GAS.REMOVE_EXTERNAL_CONTROL_LIST,
      [externalControlListAddress.toString()],
    );
  }

  async addToBlackListMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Adding address ${targetId.toString()} to external Control black List mock ${contract.toString()}`,
    );

    return this.executeWithArgs(
      new MockedBlacklist__factory().attach(contract.toString()),
      "addToBlacklist",
      contractId,
      GAS.ADD_TO_BLACK_LIST_MOCK,
      [targetId.toString()],
    );
  }

  async addToWhiteListMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Adding address ${targetId.toString()} to external Control white List mock ${contract.toString()}`,
    );

    return this.executeWithArgs(
      new MockedWhitelist__factory().attach(contract.toString()),
      "addToWhitelist",
      contractId,
      GAS.ADD_TO_WHITE_LIST_MOCK,
      [targetId.toString()],
    );
  }

  async removeFromBlackListMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Removing address ${targetId.toString()} from external Control black List mock ${contract.toString()}`,
    );

    return this.executeWithArgs(
      new MockedBlacklist__factory().attach(contract.toString()),
      "removeFromBlacklist",
      contractId,
      GAS.REMOVE_FROM_BLACK_LIST_MOCK,
      [targetId.toString()],
    );
  }

  async removeFromWhiteListMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Removing address ${targetId.toString()} from external Control white List mock ${contract.toString()}`,
    );

    return this.executeWithArgs(
      new MockedWhitelist__factory().attach(contract.toString()),
      "removeFromWhitelist",
      contractId,
      GAS.REMOVE_FROM_WHITE_LIST_MOCK,
      [targetId.toString()],
    );
  }

  async createExternalBlackListMock(): Promise<TransactionResponse> {
    LogService.logTrace(`Deploying External Control Black List Mock contract`);

    const bytecodeHex = MockedBlacklist__factory.bytecode.startsWith("0x")
      ? MockedBlacklist__factory.bytecode.slice(2)
      : MockedBlacklist__factory.bytecode;
    const bytecode = Uint8Array.from(Buffer.from(bytecodeHex, "hex"));

    const contractCreate = new ContractCreateTransaction()
      .setBytecode(bytecode)
      .setGas(GAS.CREATE_EXTERNAL_BLACK_LIST_MOCK);

    return this.signAndSendTransaction(contractCreate);
  }

  async createExternalWhiteListMock(): Promise<TransactionResponse> {
    LogService.logTrace(`Deploying External Control White List Mock contract`);

    const bytecodeHex = MockedWhitelist__factory.bytecode.startsWith("0x")
      ? MockedWhitelist__factory.bytecode.slice(2)
      : MockedWhitelist__factory.bytecode;
    const bytecode = Uint8Array.from(Buffer.from(bytecodeHex, "hex"));

    const contractCreate = new ContractCreateTransaction()
      .setBytecode(bytecode)
      .setGas(GAS.CREATE_EXTERNAL_WHITE_LIST_MOCK);

    return this.signAndSendTransaction(contractCreate);
  }

  async updateExternalKycLists(
    security: EvmAddress,
    externalKycListsAddresses: EvmAddress[],
    actives: boolean[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Updating External Kyc Lists for security ${security.toString()}`);

    return this.executeWithArgs(
      new ExternalKycListManagementFacet__factory().attach(security.toString()),
      "updateExternalKycLists",
      securityId,
      GAS.UPDATE_EXTERNAL_KYC_LISTS,
      [externalKycListsAddresses.map((address) => address.toString()), actives],
    );
  }

  async addExternalKycList(
    security: EvmAddress,
    externalKycListAddress: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Adding External kyc Lists for security ${security.toString()}`);

    return this.executeWithArgs(
      new ExternalKycListManagementFacet__factory().attach(security.toString()),
      "addExternalKycList",
      securityId,
      GAS.ADD_EXTERNAL_KYC_LIST,
      [externalKycListAddress.toString()],
    );
  }

  async removeExternalKycList(
    security: EvmAddress,
    externalKycListAddress: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Removing External kyc Lists for security ${security.toString()}`);

    return this.executeWithArgs(
      new ExternalKycListManagementFacet__factory().attach(security.toString()),
      "removeExternalKycList",
      securityId,
      GAS.REMOVE_EXTERNAL_KYC_LIST,
      [externalKycListAddress.toString()],
    );
  }

  async grantKycMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Grant kyc address ${targetId.toString()} to external kyc mock ${contract.toString()}`);

    return this.executeWithArgs(
      new MockedExternalKycList__factory().attach(contract.toString()),
      "grantKyc",
      contractId,
      GAS.GRANT_KYC_MOCK,
      [targetId.toString()],
    );
  }

  async revokeKycMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Revoke kyc address ${targetId.toString()} to external kyc mock ${contract.toString()}`);

    return this.executeWithArgs(
      new MockedExternalKycList__factory().attach(contract.toString()),
      "revokeKyc",
      contractId,
      GAS.REVOKE_KYC_MOCK,
      [targetId.toString()],
    );
  }

  async createExternalKycListMock(): Promise<TransactionResponse> {
    LogService.logTrace(`Deploying External Kyc List List Mock contract`);

    const bytecodeHex = MockedExternalKycList__factory.bytecode.startsWith("0x")
      ? MockedExternalKycList__factory.bytecode.slice(2)
      : MockedExternalKycList__factory.bytecode;
    const bytecode = Uint8Array.from(Buffer.from(bytecodeHex, "hex"));

    const contractCreate = new ContractCreateTransaction()
      .setBytecode(bytecode)
      .setGas(GAS.CREATE_EXTERNAL_KYC_LIST_MOCK);

    return this.signAndSendTransaction(contractCreate);
  }

  async activateInternalKyc(security: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Activate Internal Kyc to address ${security.toString()}`);
    return this.executeWithParams(
      securityId,
      GAS.ACTIVATE_INTERNAL_KYC,
      "activateInternalKyc",
      new ContractFunctionParameters(),
    );
  }

  async deactivateInternalKyc(security: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Deactivate Internal Kyc to address ${security.toString()}`);
    return this.executeWithParams(
      securityId,
      GAS.DEACTIVATE_INTERNAL_KYC,
      "deactivateInternalKyc",
      new ContractFunctionParameters(),
    );
  }

  async setName(security: EvmAddress, name: string, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Setting name to ${security.toString()}`);

    return this.executeWithArgs(
      new ERC3643ManagementFacet__factory().attach(security.toString()),
      "setName",
      securityId,
      GAS.SET_NAME,
      [name],
    );
  }

  async setSymbol(security: EvmAddress, symbol: string, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Setting symbol to ${security.toString()}`);

    return this.executeWithArgs(
      new ERC3643ManagementFacet__factory().attach(security.toString()),
      "setSymbol",
      securityId,
      GAS.SET_SYMBOL,
      [symbol],
    );
  }

  async setOnchainID(
    security: EvmAddress,
    onchainID: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Setting onchainID to ${security.toString()}`);

    return this.executeWithArgs(
      new ERC3643ManagementFacet__factory().attach(security.toString()),
      "setOnchainID",
      securityId,
      GAS.SET_ONCHAIN_ID,
      [onchainID.toString()],
    );
  }

  async setIdentityRegistry(
    security: EvmAddress,
    identityRegistry: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Setting identity registry to ${security.toString()}`);

    return this.executeWithArgs(
      new ERC3643ManagementFacet__factory().attach(security.toString()),
      "setIdentityRegistry",
      securityId,
      GAS.SET_IDENTITY_REGISTRY,
      [identityRegistry.toString()],
    );
  }

  async setCompliance(
    security: EvmAddress,
    compliance: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Setting compliance to ${security.toString()}`);

    return this.executeWithArgs(
      new ERC3643ManagementFacet__factory().attach(security.toString()),
      "setCompliance",
      securityId,
      GAS.SET_COMPLIANCE,
      [compliance.toString()],
    );
  }

  async freezePartialTokens(
    security: EvmAddress,
    amount: BigDecimal,
    targetId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Freezing ${amount} tokens ${security.toString()} to account ${targetId.toString()}`);

    return this.executeWithArgs(
      new FreezeFacet__factory().attach(security.toString()),
      "freezePartialTokens",
      securityId,
      GAS.FREEZE_PARTIAL_TOKENS,
      [targetId.toString(), amount.toBigNumber()],
    );
  }

  async unfreezePartialTokens(
    security: EvmAddress,
    amount: BigDecimal,
    targetId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Unfreezing ${amount} tokens ${security.toString()} to account ${targetId.toString()}`);

    return this.executeWithArgs(
      new FreezeFacet__factory().attach(security.toString()),
      "unfreezePartialTokens",
      securityId,
      GAS.UNFREEZE_PARTIAL_TOKENS,
      [targetId.toString(), amount.toBigNumber()],
    );
  }

  async recoveryAddress(
    security: EvmAddress,
    lostWalletId: EvmAddress,
    newWalletId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Recovering address ${lostWalletId.toString()} to ${newWalletId.toString()}`);

    return this.executeWithArgs(
      new ERC3643ManagementFacet__factory().attach(security.toString()),
      "recoveryAddress",
      securityId,
      GAS.RECOVERY_ADDRESS,
      [lostWalletId.toString(), newWalletId.toString(), EVM_ZERO_ADDRESS],
    );
  }

  async addAgent(
    security: EvmAddress,
    agentId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Granting agent role to ${agentId.toString()}`);

    return this.executeWithArgs(
      new ERC3643ManagementFacet__factory().attach(security.toString()),
      "addAgent",
      securityId,
      GAS.ADD_AGENT,
      [agentId.toString()],
    );
  }

  async removeAgent(
    security: EvmAddress,
    agentId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Revoking agent role from ${agentId.toString()}`);

    return this.executeWithArgs(
      new ERC3643ManagementFacet__factory().attach(security.toString()),
      "removeAgent",
      securityId,
      GAS.REMOVE_AGENT,
      [agentId.toString()],
    );
  }

  async batchTransfer(
    security: EvmAddress,
    amountList: BigDecimal[],
    toList: EvmAddress[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Batch transferring ${amountList.length} tokens from ${security.toString()} to ${toList.map((item) => item.toString())}`,
    );

    return this.executeWithArgs(
      new ERC3643BatchFacet__factory().attach(security.toString()),
      "batchTransfer",
      securityId,
      GAS.BATCH_TRANSFER,
      [toList.map((addr) => addr.toString()), amountList.map((amount) => amount.toBigNumber())],
    );
  }

  async batchForcedTransfer(
    security: EvmAddress,
    amountList: BigDecimal[],
    fromList: EvmAddress[],
    toList: EvmAddress[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Batch forced transferring ${amountList.length} tokens from ${fromList.map((item) => item.toString())} to ${toList.map((item) => item.toString())}`,
    );

    return this.executeWithArgs(
      new ERC3643BatchFacet__factory().attach(security.toString()),
      "batchForcedTransfer",
      securityId,
      GAS.BATCH_FORCED_TRANSFER,
      [
        fromList.map((addr) => addr.toString()),
        toList.map((addr) => addr.toString()),
        amountList.map((amount) => amount.toBigNumber()),
      ],
    );
  }

  async batchMint(
    security: EvmAddress,
    amountList: BigDecimal[],
    toList: EvmAddress[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Batch minting ${amountList.length} tokens to ${toList.map((item) => item.toString())}`);

    return this.executeWithArgs(
      new ERC3643BatchFacet__factory().attach(security.toString()),
      "batchMint",
      securityId,
      GAS.BATCH_MINT,
      [toList.map((addr) => addr.toString()), amountList.map((amount) => amount.toBigNumber())],
    );
  }

  async batchBurn(
    security: EvmAddress,
    amountList: BigDecimal[],
    targetList: EvmAddress[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Batch burning ${amountList.length} tokens from ${targetList.map((item) => item.toString())}`);

    return this.executeWithArgs(
      new ERC3643BatchFacet__factory().attach(security.toString()),
      "batchBurn",
      securityId,
      GAS.BATCH_BURN,
      [targetList.map((addr) => addr.toString()), amountList.map((amount) => amount.toBigNumber())],
    );
  }

  async batchSetAddressFrozen(
    security: EvmAddress,
    freezeList: boolean[],
    targetList: EvmAddress[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Batch setting freeze status for ${targetList.length} addresses`);

    return this.executeWithArgs(
      new FreezeFacet__factory().attach(security.toString()),
      "batchSetAddressFrozen",
      securityId,
      GAS.BATCH_SET_ADDRESS_FROZEN,
      [targetList.map((addr) => addr.toString()), freezeList],
    );
  }

  async batchFreezePartialTokens(
    security: EvmAddress,
    amountList: BigDecimal[],
    targetList: EvmAddress[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Batch freezing partial tokens for ${targetList.length} addresses`);

    return this.executeWithArgs(
      new FreezeFacet__factory().attach(security.toString()),
      "batchFreezePartialTokens",
      securityId,
      GAS.BATCH_FREEZE_PARTIAL_TOKENS,
      [targetList.map((addr) => addr.toString()), amountList.map((amount) => amount.toBigNumber())],
    );
  }

  async batchUnfreezePartialTokens(
    security: EvmAddress,
    amountList: BigDecimal[],
    targetList: EvmAddress[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Batch unfreezing partial tokens for ${targetList.length} addresses`);

    return this.executeWithArgs(
      new FreezeFacet__factory().attach(security.toString()),
      "batchUnfreezePartialTokens",
      securityId,
      GAS.BATCH_UNFREEZE_PARTIAL_TOKENS,
      [targetList.map((addr) => addr.toString()), amountList.map((amount) => amount.toBigNumber())],
    );
  }

  async setAddressFrozen(
    security: EvmAddress,
    status: boolean,
    target: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Freezing address ${target.toString()}`);

    return this.executeWithArgs(
      new FreezeFacet__factory().attach(security.toString()),
      "setAddressFrozen",
      securityId,
      GAS.SET_ADDRESS_FROZEN,
      [target.toString(), status],
    );
  }

  async redeemAtMaturityByPartition(
    security: EvmAddress,
    partitionId: string,
    sourceId: EvmAddress,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Redeeming at maturity by partition to address ${security.toString()}`);
    const contract = new Contract(security.toString(), Bond__factory.abi);
    return this.executeWithArgs(
      contract,
      "redeemAtMaturityByPartition",
      securityId,
      GAS.REDEEM_AT_MATURITY_BY_PARTITION_GAS,
      [sourceId.toString(), partitionId, amount.toBigNumber()],
    );
  }

  async fullRedeemAtMaturity(
    security: EvmAddress,
    sourceId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Redeeming at maturity by partition to address ${security.toString()}`);
    const contract = new Contract(security.toString(), Bond__factory.abi);
    return this.executeWithArgs(contract, "fullRedeemAtMaturity", securityId, GAS.FULL_REDEEM_AT_MATURITY_GAS, [
      sourceId.toString(),
    ]);
  }

  async createTrexSuiteBond(
    salt: string,
    owner: string,
    irs: string,
    onchainId: string,
    irAgents: string[],
    tokenAgents: string[],
    compliancesModules: string[],
    complianceSettings: string[],
    claimTopics: number[],
    issuers: string[],
    issuerClaims: number[][],
    security: Security,
    bondDetails: BondDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    configId: string,
    configVersion: number,
    compliance: EvmAddress,
    identityRegistryAddress: EvmAddress,
    diamondOwnerAccount: EvmAddress,
    proceedRecipients: EvmAddress[] = [],
    proceedRecipientsData: string[] = [],
    externalPauses?: EvmAddress[],
    externalControlLists?: EvmAddress[],
    externalKycLists?: EvmAddress[],
    factoryId?: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Deploying trex suite bond: ${security.toString()}`);
    if (!security.regulationType) {
      throw new MissingRegulationType();
    }
    if (!security.regulationsubType) {
      throw new MissingRegulationSubType();
    }

    const rbacAdmin: Rbac = {
      role: SecurityRole._DEFAULT_ADMIN_ROLE,
      members: [diamondOwnerAccount!.toString()],
    };
    const rbacs: Rbac[] = [rbacAdmin];

    const erc20MetadataInfo: ERC20MetadataInfo = {
      name: security.name,
      symbol: security.symbol,
      isin: security.isin,
      decimals: security.decimals,
    };

    const resolverProxyConfiguration: ResolverProxyConfiguration = {
      key: configId,
      version: configVersion,
    };

    const securityData: SecurityData = {
      arePartitionsProtected: security.arePartitionsProtected,
      isMultiPartition: security.isMultiPartition,
      resolver: resolver.toString(),
      resolverProxyConfiguration: resolverProxyConfiguration,
      rbacs: rbacs,
      isControllable: security.isControllable,
      isWhiteList: security.isWhiteList,
      maxSupply: security.maxSupply ? security.maxSupply.toString() : "0",
      erc20MetadataInfo: erc20MetadataInfo,
      clearingActive: security.clearingActive,
      internalKycActivated: security.internalKycActivated,
      externalPauses: externalPauses?.map((address) => address.toString()) ?? [],
      externalControlLists: externalControlLists?.map((address) => address.toString()) ?? [],
      externalKycLists: externalKycLists?.map((address) => address.toString()) ?? [],
      compliance: compliance.toString(),
      identityRegistry: identityRegistryAddress.toString(),
      erc20VotesActivated: security.erc20VotesActivated,
    };

    const bondDetailsData = new BondDetailsData(
      bondDetails.currency,
      bondDetails.nominalValue.toString(),
      bondDetails.nominalValueDecimals,
      bondDetails.startingDate.toString(),
      bondDetails.maturityDate.toString(),
    );

    const securityTokenToCreate = new FactoryBondToken(
      securityData,
      bondDetailsData,
      proceedRecipients.map((b) => b.toString()),
      proceedRecipientsData.map((data) => (data == "" ? "0x" : data)),
    );

    const additionalSecurityData: AdditionalSecurityData = {
      countriesControlListType: security.isCountryControlListWhiteList,
      listOfCountries: security.countries ?? "",
      info: security.info ?? "",
    };

    const factoryRegulationData = new FactoryRegulationData(
      CastRegulationType.toNumber(security.regulationType),
      CastRegulationSubType.toNumber(security.regulationsubType),
      additionalSecurityData,
    );
    const contract = new Contract(factory.toString(), TREXFactoryAts__factory.abi);
    try {
      return this.executeWithArgs(contract, "deployTREXSuiteAtsBond", factoryId!, GAS.TREX_CREATE_SUITE, [
        salt,
        {
          owner,
          irs,
          ONCHAINID: onchainId,
          irAgents,
          tokenAgents,
          complianceModules: compliancesModules,
          complianceSettings,
        },
        {
          claimTopics,
          issuers,
          issuerClaims,
        },
        securityTokenToCreate,
        factoryRegulationData,
      ]);
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(`Unexpected error in TREXFactoryAts__factory deploy operation : ${error}`);
    }
  }

  async createTrexSuiteEquity(
    salt: string,
    owner: string,
    irs: string,
    onchainId: string,
    irAgents: string[],
    tokenAgents: string[],
    compliancesModules: string[],
    complianceSettings: string[],
    claimTopics: number[],
    issuers: string[],
    issuerClaims: number[][],
    security: Security,
    equityDetails: EquityDetails,
    factory: EvmAddress,
    resolver: EvmAddress,
    configId: string,
    configVersion: number,
    compliance: EvmAddress,
    identityRegistryAddress: EvmAddress,
    diamondOwnerAccount: EvmAddress,
    externalPauses?: EvmAddress[],
    externalControlLists?: EvmAddress[],
    externalKycLists?: EvmAddress[],
    factoryId?: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Deploying trex suite equity: ${security.toString()}`);
    try {
      if (!security.regulationType) {
        throw new MissingRegulationType();
      }
      if (!security.regulationsubType) {
        throw new MissingRegulationSubType();
      }

      const rbacAdmin: Rbac = {
        role: SecurityRole._DEFAULT_ADMIN_ROLE,
        members: [diamondOwnerAccount!.toString()],
      };
      const rbacs: Rbac[] = [rbacAdmin];

      const erc20MetadataInfo: ERC20MetadataInfo = {
        name: security.name,
        symbol: security.symbol,
        isin: security.isin,
        decimals: security.decimals,
      };

      const resolverProxyConfiguration: ResolverProxyConfiguration = {
        key: configId,
        version: configVersion,
      };

      const securityData: SecurityData = {
        arePartitionsProtected: security.arePartitionsProtected,
        isMultiPartition: security.isMultiPartition,
        resolver: resolver.toString(),
        resolverProxyConfiguration: resolverProxyConfiguration,
        rbacs: rbacs,
        isControllable: security.isControllable,
        isWhiteList: security.isWhiteList,
        maxSupply: security.maxSupply ? security.maxSupply.toString() : "0",
        erc20MetadataInfo: erc20MetadataInfo,
        clearingActive: security.clearingActive,
        internalKycActivated: security.internalKycActivated,
        externalPauses: externalPauses?.map((address) => address.toString()) ?? [],
        externalControlLists: externalControlLists?.map((address) => address.toString()) ?? [],
        externalKycLists: externalKycLists?.map((address) => address.toString()) ?? [],
        compliance: compliance.toString(),
        identityRegistry: identityRegistryAddress?.toString(),
        erc20VotesActivated: security.erc20VotesActivated,
      };

      const equityDetailsData: EquityDetailsData = {
        votingRight: equityDetails.votingRight,
        informationRight: equityDetails.informationRight,
        liquidationRight: equityDetails.liquidationRight,
        subscriptionRight: equityDetails.subscriptionRight,
        conversionRight: equityDetails.conversionRight,
        redemptionRight: equityDetails.redemptionRight,
        putRight: equityDetails.putRight,
        dividendRight: CastDividendType.toNumber(equityDetails.dividendRight),
        currency: equityDetails.currency,
        nominalValue: equityDetails.nominalValue.toString(),
        nominalValueDecimals: equityDetails.nominalValueDecimals,
      };

      const securityTokenToCreate = new FactoryEquityToken(securityData, equityDetailsData);

      const additionalSecurityData: AdditionalSecurityData = {
        countriesControlListType: security.isCountryControlListWhiteList,
        listOfCountries: security.countries ?? "",
        info: security.info ?? "",
      };

      const factoryRegulationData = new FactoryRegulationData(
        CastRegulationType.toNumber(security.regulationType),
        CastRegulationSubType.toNumber(security.regulationsubType),
        additionalSecurityData,
      );

      LogService.logTrace(
        `Deploying equity: ${{
          security: securityTokenToCreate,
        }}`,
      );
      const contract = new Contract(factory.toString(), TREXFactoryAts__factory.abi);
      return this.executeWithArgs(contract, "deployTREXSuiteAtsEquity", factoryId!, GAS.TREX_CREATE_SUITE, [
        salt,
        {
          owner,
          irs,
          ONCHAINID: onchainId,
          irAgents,
          tokenAgents,
          complianceModules: compliancesModules,
          complianceSettings,
        },
        {
          claimTopics,
          issuers,
          issuerClaims,
        },
        securityTokenToCreate,
        factoryRegulationData,
      ]);
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(`Unexpected error in HederaTransactionAdapter create operation : ${error}`);
    }
  }

  addProceedRecipient(
    security: EvmAddress,
    proceedRecipient: EvmAddress,
    data: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Adding proceedRecipient: ${proceedRecipient} to security: ${security}`);

    return this.executeWithArgs(
      new ProceedRecipientsFacet__factory().attach(security.toString()),
      "addProceedRecipient",
      securityId!,
      GAS.ADD_PROCEED_RECIPIENT,
      [proceedRecipient.toString(), data],
    );
  }
  removeProceedRecipient(
    security: EvmAddress,
    proceedRecipient: EvmAddress,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Removing proceedRecipient: ${proceedRecipient} from security: ${security}`);
    return this.executeWithArgs(
      new ProceedRecipientsFacet__factory().attach(security.toString()),
      "removeProceedRecipient",
      securityId!,
      GAS.REMOVE_PROCEED_RECIPIENT,
      [proceedRecipient.toString()],
    );
  }
  updateProceedRecipientData(
    security: EvmAddress,
    proceedRecipient: EvmAddress,
    data: string,
    securityId?: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Updating proceedRecipient: ${proceedRecipient} data in security: ${security}`);
    return this.executeWithArgs(
      new ProceedRecipientsFacet__factory().attach(security.toString()),
      "updateProceedRecipientData",
      securityId!,
      GAS.UPDATE_PROCEED_RECIPIENT,
      [proceedRecipient.toString(), data],
    );
  }

  setRate(security: EvmAddress, rate: BigDecimal, rateDecimals: number, securityId?: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(
      `Setting Rate ${rate.toString()} with decimals ${rateDecimals} for security ${security.toString()}`,
    );
    return this.executeWithArgs(
      new FixedRate__factory().attach(security.toString()),
      "setRate",
      securityId!,
      GAS.SET_RATE,
      [rate.toBigNumber(), rateDecimals],
    );
  }

  // * Definition of the abstract methods
  abstract signAndSendTransaction(
    transaction: Transaction,
    transactionType?: TransactionType,
    functionName?: string,
    abi?: object[],
  ): Promise<TransactionResponse>;
}
