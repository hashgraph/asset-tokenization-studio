// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ContractId } from "@hiero-ledger/sdk";
import { ethers } from "ethers";
import {
  Factory__factory,
  TREXFactoryAts__factory,
} from "@hashgraph/asset-tokenization-contracts";
import { EVM_ZERO_ADDRESS, GAS } from "@core/Constants";
import {
  FactoryBondFixedRateToken,
  FactoryBondToken,
  FactoryEquityToken,
  FactoryRegulationData,
} from "@domain/context/factory/FactorySecurityToken";
import { CastRegulationSubType, CastRegulationType } from "@domain/context/factory/RegulationType";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import { Security } from "@domain/context/security/Security";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { ERC20MetadataInfo } from "@domain/context/factory/ERC20Metadata";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { BondDetails } from "@domain/context/bond/BondDetails";
import { BondDetailsData } from "@domain/context/factory/BondDetailsData";
import { EquityDetails } from "@domain/context/equity/EquityDetails";
import { EquityDetailsData } from "@domain/context/factory/EquityDetailsData";
import { SecurityData } from "@domain/context/factory/SecurityData";
import { CastDividendType } from "@domain/context/equity/DividendType";
import { AdditionalSecurityData } from "@domain/context/factory/AdditionalSecurityData";
import { ResolverProxyConfiguration } from "@domain/context/factory/ResolverProxyConfiguration";
import { Rbac } from "@domain/context/factory/Rbac";
import { MissingRegulationSubType } from "@domain/context/factory/error/MissingRegulationSubType";
import { MissingRegulationType } from "@domain/context/factory/error/MissingRegulationType";
import { SigningError } from "@port/out/error/SigningError";
import LogService from "@service/log/LogService";
import { BondFixedRateDetails } from "@domain/context/bond/BondFixedRateDetails";
import { BondKpiLinkedRateDetails } from "@domain/context/bond/BondKpiLinkedRateDetails";
import { InterestRate } from "@domain/context/bond/InterestRate";
import { ImpactData } from "@domain/context/bond/ImpactData";
import { TransactionExecutor } from "../TransactionExecutor";

export class FactoryOperations {
  constructor(private readonly executor: TransactionExecutor) {}

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
      if (!securityInfo.regulationType) throw new MissingRegulationType();
      if (!securityInfo.regulationsubType) throw new MissingRegulationSubType();

      const rbacAdmin: Rbac = {
        role: SecurityRole._DEFAULT_ADMIN_ROLE,
        members: [diamondOwnerAccount!.toString()],
      };
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
        resolverProxyConfiguration,
        rbacs: [rbacAdmin],
        isControllable: securityInfo.isControllable,
        isWhiteList: securityInfo.isWhiteList,
        maxSupply: securityInfo.maxSupply ? securityInfo.maxSupply.toString() : "0",
        erc20VotesActivated: securityInfo.erc20VotesActivated,
        erc20MetadataInfo,
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
      LogService.logTrace(`Deploying equity: ${{ security: securityTokenToCreate }}`);
      return this.executor.executeContractCall(
        factoryId!.toString(),
        Factory__factory.createInterface(),
        "deployEquity",
        [securityTokenToCreate, factoryRegulationData],
        GAS.CREATE_EQUITY_ST,
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
      if (!securityInfo.regulationType) throw new MissingRegulationType();
      if (!securityInfo.regulationsubType) throw new MissingRegulationSubType();

      const rbacAdmin: Rbac = {
        role: SecurityRole._DEFAULT_ADMIN_ROLE,
        members: [diamondOwnerAccount!.toString()],
      };
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
        resolverProxyConfiguration,
        rbacs: [rbacAdmin],
        isControllable: securityInfo.isControllable,
        isWhiteList: securityInfo.isWhiteList,
        maxSupply: securityInfo.maxSupply ? securityInfo.maxSupply.toString() : "0",
        erc20VotesActivated: securityInfo.erc20VotesActivated,
        erc20MetadataInfo,
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
      LogService.logTrace(`Deploying bond: ${{ security: securityTokenToCreate }}`);
      return this.executor.executeContractCall(
        factoryId!.toString(),
        Factory__factory.createInterface(),
        "deployBond",
        [securityTokenToCreate, factoryRegulationData],
        GAS.CREATE_BOND_ST,
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
      if (!securityInfo.regulationType) throw new MissingRegulationType();
      if (!securityInfo.regulationsubType) throw new MissingRegulationSubType();

      const rbacAdmin: Rbac = {
        role: SecurityRole._DEFAULT_ADMIN_ROLE,
        members: [diamondOwnerAccount!.toString()],
      };
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
        resolverProxyConfiguration,
        rbacs: [rbacAdmin],
        isControllable: securityInfo.isControllable,
        isWhiteList: securityInfo.isWhiteList,
        maxSupply: securityInfo.maxSupply ? securityInfo.maxSupply.toString() : "0",
        erc20VotesActivated: securityInfo.erc20VotesActivated,
        erc20MetadataInfo,
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
      const bondFixedRateData = {
        bondData: securityTokenToCreate,
        factoryRegulationData: factoryRegulationData,
        fixedRateData: { rate: bondInfo.rate, rateDecimals: bondInfo.rateDecimals },
      };
      LogService.logTrace(`Deploying bond fixed rate: ${{ security: securityTokenToCreate }}`);
      return this.executor.executeContractCall(
        factoryId!.toString(),
        Factory__factory.createInterface(),
        "deployBondFixedRate",
        [bondFixedRateData],
        GAS.CREATE_BOND_ST,
      );
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(`Unexpected error in HederaTransactionAdapter create operation : ${error}`);
    }
  }

  async createBondKpiLinkedRate(
    securityInfo: Security,
    bondInfo: BondKpiLinkedRateDetails,
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
      if (!securityInfo.regulationType) throw new MissingRegulationType();
      if (!securityInfo.regulationsubType) throw new MissingRegulationSubType();

      const rbacAdmin: Rbac = {
        role: SecurityRole._DEFAULT_ADMIN_ROLE,
        members: [diamondOwnerAccount!.toString()],
      };
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
        resolverProxyConfiguration,
        rbacs: [rbacAdmin],
        isControllable: securityInfo.isControllable,
        isWhiteList: securityInfo.isWhiteList,
        maxSupply: securityInfo.maxSupply ? securityInfo.maxSupply.toString() : "0",
        erc20VotesActivated: securityInfo.erc20VotesActivated,
        erc20MetadataInfo,
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
      const interestRate = new InterestRate(
        bondInfo.interestRate.maxRate,
        bondInfo.interestRate.baseRate,
        bondInfo.interestRate.minRate,
        bondInfo.interestRate.startPeriod,
        bondInfo.interestRate.startRate,
        bondInfo.interestRate.missedPenalty,
        bondInfo.interestRate.reportPeriod,
        bondInfo.interestRate.rateDecimals,
      );
      const impactData = new ImpactData(
        bondInfo.impactData.maxDeviationCap,
        bondInfo.impactData.baseLine,
        bondInfo.impactData.maxDeviationFloor,
        bondInfo.impactData.impactDataDecimals,
        bondInfo.impactData.adjustmentPrecision,
      );
      const bondKpiLinkedRateData = {
        bondData: securityTokenToCreate,
        factoryRegulationData: factoryRegulationData,
        interestRate: interestRate,
        impactData: impactData,
        kpiOracle: EVM_ZERO_ADDRESS,
      };
      LogService.logTrace(`Deploying bond kpi linked rate: ${{ security: securityTokenToCreate }}`);
      return this.executor.executeContractCall(
        factoryId!.toString(),
        Factory__factory.createInterface(),
        "deployBondKpiLinkedRate",
        [bondKpiLinkedRateData],
        GAS.CREATE_BOND_ST,
      );
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(`Unexpected error in HederaTransactionAdapter create operation : ${error}`);
    }
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
    if (!security.regulationType) throw new MissingRegulationType();
    if (!security.regulationsubType) throw new MissingRegulationSubType();

    const rbacAdmin: Rbac = {
      role: SecurityRole._DEFAULT_ADMIN_ROLE,
      members: [diamondOwnerAccount!.toString()],
    };
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
      resolverProxyConfiguration,
      rbacs: [rbacAdmin],
      isControllable: security.isControllable,
      isWhiteList: security.isWhiteList,
      maxSupply: security.maxSupply ? security.maxSupply.toString() : "0",
      erc20MetadataInfo,
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
    try {
      return this.executor.executeContractCall(
        factoryId!.toString(),
        new ethers.Interface(TREXFactoryAts__factory.abi as ethers.InterfaceAbi),
        "deployTREXSuiteAtsBond",
        [
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
          { claimTopics, issuers, issuerClaims },
          securityTokenToCreate,
          factoryRegulationData,
        ],
        GAS.TREX_CREATE_SUITE,
      );
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
      if (!security.regulationType) throw new MissingRegulationType();
      if (!security.regulationsubType) throw new MissingRegulationSubType();

      const rbacAdmin: Rbac = {
        role: SecurityRole._DEFAULT_ADMIN_ROLE,
        members: [diamondOwnerAccount!.toString()],
      };
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
        resolverProxyConfiguration,
        rbacs: [rbacAdmin],
        isControllable: security.isControllable,
        isWhiteList: security.isWhiteList,
        maxSupply: security.maxSupply ? security.maxSupply.toString() : "0",
        erc20MetadataInfo,
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
      LogService.logTrace(`Deploying equity: ${{ security: securityTokenToCreate }}`);
      return this.executor.executeContractCall(
        factoryId!.toString(),
        new ethers.Interface(TREXFactoryAts__factory.abi as ethers.InterfaceAbi),
        "deployTREXSuiteAtsEquity",
        [
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
          { claimTopics, issuers, issuerClaims },
          securityTokenToCreate,
          factoryRegulationData,
        ],
        GAS.TREX_CREATE_SUITE,
      );
    } catch (error) {
      LogService.logError(error);
      throw new SigningError(`Unexpected error in HederaTransactionAdapter create operation : ${error}`);
    }
  }
}
