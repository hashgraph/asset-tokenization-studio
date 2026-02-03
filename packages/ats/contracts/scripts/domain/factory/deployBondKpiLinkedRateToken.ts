// SPDX-License-Identifier: Apache-2.0

import { ethers, EventLog } from "ethers";
import type { ResolverProxy } from "@contract-types";
import { ResolverProxy__factory } from "@contract-types";
import { GAS_LIMIT } from "@scripts/infrastructure";
import {
  ATS_ROLES,
  BOND_KPI_LINKED_RATE_CONFIG_ID,
  DeployBondFromFactoryParams,
  FactoryRegulationDataParams,
  Rbac,
} from "@scripts/domain";

// ============================================================================
// Types
// ============================================================================

export interface InterestRateParams {
  maxRate: number;
  baseRate: number;
  minRate: number;
  startPeriod: number;
  startRate: number;
  missedPenalty: number;
  reportPeriod: number;
  rateDecimals: number;
}

export interface ImpactDataParams {
  maxDeviationCap: number;
  baseLine: number;
  maxDeviationFloor: number;
  impactDataDecimals: number;
  adjustmentPrecision: number;
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Deploy a bond token using the Factory contract.
 *
 * This function constructs the required data structures and calls the factory's
 * deployBond method to create a new bond token with a diamond proxy.
 *
 * @param bondData - Bond deployment parameters
 * @returns Deployed ResolverProxy (diamond) contract instance
 *
 * @example
 * ```typescript
 * const bond = await deployBondFromFactory({
 *   adminAccount: deployer.address,
 *   isWhiteList: true,
 *   isControllable: true,
 *   isMultiPartition: false,
 *   name: 'My Bond',
 *   symbol: 'MBND',
 *   decimals: 18,
 *   isin: 'US0378331005',
 *   votingRight: true,
 *   // ... other params
 *   regulationType: RegulationType.REG_S,
 *   regulationSubType: RegulationSubType.NONE,
 *   factory: factoryContract,
 *   businessLogicResolver: blrAddress,
 * });
 * ```
 */
export async function deployBondKpiLinkedRateFromFactory(
  bondDataParams: DeployBondFromFactoryParams,
  regulationTypeParams: FactoryRegulationDataParams,
  interestRateParams: InterestRateParams,
  impactDataParams: ImpactDataParams,
): Promise<ResolverProxy> {
  const {
    factory,
    adminAccount,
    securityData: securityDataParams,
    bondDetails: bondDetailsParams,
    proceedRecipients,
    proceedRecipientsData,
  } = bondDataParams;

  // Build RBAC array with admin
  const rbacs: Rbac[] = [
    {
      role: ATS_ROLES._DEFAULT_ADMIN_ROLE,
      members: [adminAccount],
    },
    ...securityDataParams.rbacs,
  ];

  // Build resolver proxy configuration
  const resolverProxyConfiguration = {
    key: BOND_KPI_LINKED_RATE_CONFIG_ID,
    version: 1,
  };

  // Build security data structure
  const securityData = {
    arePartitionsProtected: securityDataParams.arePartitionsProtected,
    isMultiPartition: securityDataParams.isMultiPartition,
    resolver: securityDataParams.resolver,
    resolverProxyConfiguration,
    rbacs,
    isControllable: securityDataParams.isControllable,
    isWhiteList: securityDataParams.isWhiteList,
    maxSupply: securityDataParams.maxSupply,
    erc20MetadataInfo: {
      name: securityDataParams.erc20MetadataInfo.name,
      symbol: securityDataParams.erc20MetadataInfo.symbol,
      isin: securityDataParams.erc20MetadataInfo.isin,
      decimals: securityDataParams.erc20MetadataInfo.decimals,
    },
    clearingActive: securityDataParams.clearingActive,
    internalKycActivated: securityDataParams.internalKycActivated,
    erc20VotesActivated: securityDataParams.erc20VotesActivated,
    externalPauses: securityDataParams.externalPauses,
    externalControlLists: securityDataParams.externalControlLists,
    externalKycLists: securityDataParams.externalKycLists,
    compliance: securityDataParams.compliance,
    identityRegistry: securityDataParams.identityRegistry,
  };

  // Build bond details structure
  const bondDetails = {
    currency: bondDetailsParams.currency,
    nominalValue: bondDetailsParams.nominalValue,
    nominalValueDecimals: bondDetailsParams.nominalValueDecimals,
    startingDate: bondDetailsParams.startingDate || Math.floor(Date.now() / 1000),
    maturityDate: bondDetailsParams.maturityDate || 0,
  };

  // Build bond data
  const bondData = {
    security: securityData,
    bondDetails,
    proceedRecipients: proceedRecipients,
    proceedRecipientsData: proceedRecipientsData,
  };

  // Build regulation data
  const factoryRegulationData = {
    regulationType: regulationTypeParams.regulationType,
    regulationSubType: regulationTypeParams.regulationSubType,
    additionalSecurityData: {
      countriesControlListType: regulationTypeParams.additionalSecurityData.countriesControlListType,
      listOfCountries: regulationTypeParams.additionalSecurityData.listOfCountries,
      info: regulationTypeParams.additionalSecurityData.info,
    },
  };

  const bondKpiLinkedRateData = {
    bondData: bondData,
    factoryRegulationData: factoryRegulationData,
    interestRate: interestRateParams,
    impactData: impactDataParams,
  };

  // Deploy bond token via factory
  const tx = await factory.deployBondKpiLinkedRate(bondKpiLinkedRateData, {
    gasLimit: GAS_LIMIT.high,
  });
  const receipt = await tx.wait();

  // Find BondDeployed event to get diamond address
  const event = receipt?.logs.find(
    (log): log is EventLog => log instanceof EventLog && log.eventName === "BondKpiLinkedRateDeployed",
  );
  if (!event || !event.args) {
    throw new Error(
      `BondKpiLinkedRateDeployed event not found in deployment transaction. Events: ${JSON.stringify(
        receipt?.logs.filter((log): log is EventLog => log instanceof EventLog).map((e) => e.eventName),
      )}`,
    );
  }

  const diamondAddress = event.args.diamondProxyAddress || event.args[1];

  if (!diamondAddress || diamondAddress === ethers.ZeroAddress) {
    throw new Error(`Invalid diamond address from event. Args: ${JSON.stringify(event.args)}`);
  }

  // Return diamond proxy as ResolverProxy contract
  return ResolverProxy__factory.connect(diamondAddress, factory.runner);
}
