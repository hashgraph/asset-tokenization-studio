import { ethers } from "ethers";
import { AtsRoleName, AtsRoleHash } from "../constants";
export interface Rbac {
  // eslint-disable-next-line @typescript-eslint/ban-types
  role: AtsRoleName | AtsRoleHash | (string & {});
  members: string[];
}

export interface SecurityDataParams {
  /** Protect partitions from unauthorized access */
  arePartitionsProtected: boolean;
  /** Enable multi-partition support */
  isMultiPartition: boolean;
  /** BusinessLogicResolver address */
  resolver: string;
  /** Enable controllable transfers */
  isControllable: boolean;
  /** Enable whitelist mode */
  isWhiteList: boolean;
  /** Maximum supply of tokens */
  maxSupply: ethers.BigNumberish;
  erc20MetadataInfo: {
    /** ERC20 metadata information */
    /** Token name */
    name: string;
    /** Token symbol */
    symbol: string;
    /** Token decimals */
    decimals: number;
    /** ISIN identifier */
    isin: string;
  };
  /** Enable clearing functionality */
  clearingActive: boolean;
  /** Activate internal KYC */
  internalKycActivated: boolean;
  /** External pause addresses */
  externalPauses: string[];
  /** External control list addresses */
  externalControlLists: string[];
  /** External KYC list addresses */
  externalKycLists: string[];
  /** ERC20 votes activation flag */
  erc20VotesActivated: boolean;
  /** Compliance contract address */
  compliance: string;
  /** Identity registry contract address */
  identityRegistry: string;
  resolverProxyConfiguration: {
    key: string;
    version: number;
  };
  /** RBAC roles and their assigned addresses */
  rbacs: Rbac[];
}

export interface BondDetailsDataParams {
  currency: string;
  nominalValue: ethers.BigNumberish;
  nominalValueDecimals: number;
  startingDate: number;
  maturityDate: number;
}

export enum DividendRight {
  NONE = 0,
  PREFERRED = 1,
  COMMON = 2,
}

export interface EquityDetailsDataParams {
  votingRight: boolean;
  informationRight: boolean;
  liquidationRight: boolean;
  subscriptionRight: boolean;
  conversionRight: boolean;
  redemptionRight: boolean;
  putRight: boolean;
  dividendRight: DividendRight;
  currency: string;
  nominalValue: ethers.BigNumberish;
  nominalValueDecimals: number;
}

export interface FactoryRegulationDataParams {
  /** Regulation type */
  regulationType: number;
  /** Regulation sub-type */
  regulationSubType: number;

  additionalSecurityData: {
    /** Countries control list type (true = whitelist, false = blacklist) */
    countriesControlListType: boolean;
    /** Comma-separated country codes */
    listOfCountries: string;
    /** Additional security information */
    info: string;
  };
}

export interface FixedRateDataParams {
  rate: number;
  rateDecimals: number;
}

export enum SecurityType {
  BOND = 0,
  EQUITY = 1,
}
