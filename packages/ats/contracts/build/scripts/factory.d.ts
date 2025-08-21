import { IFactory } from '@typechain';
export interface Rbac {
    role: string;
    members: string[];
}
export interface ResolverProxyConfiguration {
    key: string;
    version: number;
}
export interface ERC20MetadataInfo {
    name: string;
    symbol: string;
    isin: string;
    decimals: number;
}
export interface ERC20Metadata {
    info: ERC20MetadataInfo;
    securityType: number;
}
export declare enum DividendType {
    NONE = 0,
    PREFERRED = 1,
    COMMON = 2
}
export declare enum SecurityType {
    BOND = 0,
    EQUITY = 1
}
export interface EquityDetailsData {
    votingRight: boolean;
    informationRight: boolean;
    liquidationRight: boolean;
    subscriptionRight: boolean;
    conversionRight: boolean;
    redemptionRight: boolean;
    putRight: boolean;
    dividendRight: DividendType;
    currency: string;
    nominalValue: number;
}
export interface BondDetailsData {
    currency: string;
    nominalValue: number;
    startingDate: number;
    maturityDate: number;
}
export interface CouponDetailsData {
    couponFrequency: number;
    couponRate: number;
    firstCouponDate: number;
}
export interface SecurityData {
    arePartitionsProtected: boolean;
    isMultiPartition: boolean;
    resolver: string;
    resolverProxyConfiguration: ResolverProxyConfiguration;
    rbacs: Rbac[];
    isControllable: boolean;
    isWhiteList: boolean;
    maxSupply: bigint;
    erc20MetadataInfo: ERC20MetadataInfo;
    clearingActive: boolean;
    internalKycActivated: boolean;
    externalPauses: string[];
    externalControlLists: string[];
    externalKycLists: string[];
    compliance: string;
    identityRegistry: string;
}
export interface EquityData {
    security: SecurityData;
    equityDetails: EquityDetailsData;
}
export interface BondData {
    security: SecurityData;
    bondDetails: BondDetailsData;
    couponDetails: CouponDetailsData;
}
export interface AdditionalSecurityData {
    countriesControlListType: boolean;
    listOfCountries: string;
    info: string;
}
export interface FactoryRegulationData {
    regulationType: number;
    regulationSubType: number;
    additionalSecurityData: AdditionalSecurityData;
}
export declare const RegulationType: {
    NONE: number;
    REG_S: number;
    REG_D: number;
};
export declare const RegulationSubType: {
    NONE: number;
    REG_D_506_B: number;
    REG_D_506_C: number;
};
export declare function setFactoryRegulationData(regulationType: number, regulationSubType: number, countriesControlListType: boolean, listOfCountries: string, info: string): Promise<FactoryRegulationData>;
export declare function setEquityData({ adminAccount, isWhiteList, isControllable, isMultiPartition, arePartitionsProtected, clearingActive, internalKycActivated, name, symbol, decimals, isin, votingRight, informationRight, liquidationRight, subscriptionRight, conversionRight, redemptionRight, putRight, dividendRight, currency, numberOfShares, nominalValue, init_rbacs, addAdmin, businessLogicResolver, externalPauses, externalControlLists, externalKycLists, compliance, identityRegistry, }: {
    adminAccount: string;
    isWhiteList: boolean;
    isControllable: boolean;
    isMultiPartition: boolean;
    arePartitionsProtected: boolean;
    clearingActive: boolean;
    internalKycActivated: boolean;
    name: string;
    symbol: string;
    decimals: number;
    isin: string;
    votingRight: boolean;
    informationRight: boolean;
    liquidationRight: boolean;
    subscriptionRight: boolean;
    conversionRight: boolean;
    redemptionRight: boolean;
    putRight: boolean;
    dividendRight: DividendType;
    currency: string;
    numberOfShares: bigint;
    nominalValue: number;
    init_rbacs?: Rbac[];
    addAdmin?: boolean;
    businessLogicResolver: string;
    externalPauses?: string[];
    externalControlLists?: string[];
    externalKycLists?: string[];
    compliance?: string;
    identityRegistry?: string;
}): Promise<EquityData>;
export declare function setBondData({ adminAccount, isWhiteList, isControllable, isMultiPartition, arePartitionsProtected, clearingActive, internalKycActivated, name, symbol, decimals, isin, currency, numberOfUnits, nominalValue, startingDate, maturityDate, couponFrequency, couponRate, firstCouponDate, init_rbacs, addAdmin, businessLogicResolver, externalPauses, externalControlLists, externalKycLists, compliance, identityRegistry, }: {
    adminAccount: string;
    isWhiteList: boolean;
    isControllable: boolean;
    isMultiPartition: boolean;
    arePartitionsProtected: boolean;
    clearingActive: boolean;
    internalKycActivated: boolean;
    name: string;
    symbol: string;
    decimals: number;
    isin: string;
    currency: string;
    numberOfUnits: bigint;
    nominalValue: number;
    startingDate: number;
    maturityDate: number;
    couponFrequency: number;
    couponRate: number;
    firstCouponDate: number;
    init_rbacs?: Rbac[];
    addAdmin: boolean;
    businessLogicResolver: string;
    externalPauses?: string[];
    externalControlLists?: string[];
    externalKycLists?: string[];
    compliance?: string;
    identityRegistry?: string;
}): Promise<BondData>;
export declare function deployEquityFromFactory({ adminAccount, isWhiteList, isControllable, isMultiPartition, arePartitionsProtected, clearingActive, internalKycActivated, compliance, identityRegistry, name, symbol, decimals, isin, votingRight, informationRight, liquidationRight, subscriptionRight, conversionRight, redemptionRight, putRight, dividendRight, currency, numberOfShares, nominalValue, regulationType, regulationSubType, countriesControlListType, listOfCountries, info, init_rbacs, addAdmin, businessLogicResolver, factory, }: {
    adminAccount: string;
    isWhiteList: boolean;
    isControllable: boolean;
    isMultiPartition: boolean;
    arePartitionsProtected: boolean;
    clearingActive: boolean;
    internalKycActivated: boolean;
    compliance?: string;
    identityRegistry?: string;
    name: string;
    symbol: string;
    decimals: number;
    isin: string;
    votingRight: boolean;
    informationRight: boolean;
    liquidationRight: boolean;
    subscriptionRight: boolean;
    conversionRight: boolean;
    redemptionRight: boolean;
    putRight: boolean;
    dividendRight: DividendType;
    currency: string;
    numberOfShares: bigint;
    nominalValue: number;
    regulationType: number;
    regulationSubType: number;
    countriesControlListType: boolean;
    listOfCountries: string;
    info: string;
    init_rbacs?: Rbac[];
    addAdmin?: boolean;
    businessLogicResolver: string;
    factory: IFactory;
}): Promise<import("@typechain").Equity>;
export declare function deployBondFromFactory({ adminAccount, isWhiteList, isControllable, isMultiPartition, arePartitionsProtected, clearingActive, internalKycActivated, name, symbol, decimals, isin, currency, numberOfUnits, nominalValue, startingDate, maturityDate, couponFrequency, couponRate, firstCouponDate, regulationType, regulationSubType, countriesControlListType, listOfCountries, info, init_rbacs, addAdmin, factory, businessLogicResolver, compliance, identityRegistry, }: {
    adminAccount: string;
    isWhiteList: boolean;
    isControllable: boolean;
    isMultiPartition: boolean;
    arePartitionsProtected: boolean;
    clearingActive: boolean;
    internalKycActivated: boolean;
    name: string;
    symbol: string;
    decimals: number;
    isin: string;
    currency: string;
    numberOfUnits: number;
    nominalValue: number;
    startingDate: number;
    maturityDate: number;
    couponFrequency: number;
    couponRate: number;
    firstCouponDate: number;
    regulationType: number;
    regulationSubType: number;
    countriesControlListType: boolean;
    listOfCountries: string;
    info: string;
    init_rbacs?: Rbac[];
    addAdmin?: boolean;
    factory: IFactory;
    businessLogicResolver: string;
    compliance?: string;
    identityRegistry?: string;
}): Promise<import("@typechain").Bond>;
