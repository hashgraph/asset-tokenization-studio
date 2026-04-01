// SPDX-License-Identifier: Apache-2.0

import { ethers, type EventLog } from "ethers";
import type { IFactory, ResolverProxy } from "@contract-types";
import { ResolverProxy__factory } from "@contract-types";
import { GAS_LIMIT } from "@scripts/infrastructure";
import { ATS_ROLES, LOAN_CONFIG_ID } from "../constants";
import { FactoryRegulationDataParams, LoanDetailsDataParams, Rbac, SecurityDataParams } from "./types";

// ============================================================================
// Types
// ============================================================================

/**
 * Parameters for deploying a loan token from the factory.
 */
export interface DeployLoanFromFactoryParams {
  /** Admin account address */
  adminAccount: string;
  factory: IFactory;
  securityData: SecurityDataParams;
  loanDetails: LoanDetailsDataParams;
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Deploy a loan token using the Factory contract.
 *
 * @param loanDataParams - Loan deployment parameters
 * @param regulationTypeParams - Regulation data
 * @returns Deployed ResolverProxy (diamond) contract instance
 */
export async function deployLoanFromFactory(
  loanDataParams: DeployLoanFromFactoryParams,
  regulationTypeParams: FactoryRegulationDataParams,
): Promise<ResolverProxy> {
  const { factory, adminAccount, securityData: securityDataParams, loanDetails: loanDetailsParams } = loanDataParams;

  // Build RBAC array with admin
  const rbacs: Rbac[] = [
    {
      role: ATS_ROLES._DEFAULT_ADMIN_ROLE,
      members: [adminAccount],
    },
    {
      role: ATS_ROLES._NOMINAL_VALUE_ROLE,
      members: [adminAccount],
    },
    ...securityDataParams.rbacs,
  ];

  // Build resolver proxy configuration
  const resolverProxyConfiguration = {
    key: LOAN_CONFIG_ID,
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

  // Build loan data
  const loanData = {
    security: securityData,
    loanDetails: loanDetailsParams,
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

  // Deploy loan token via factory
  const tx = await factory.deployLoan(loanData, factoryRegulationData, {
    gasLimit: GAS_LIMIT.high,
  });
  const receipt = await tx.wait();

  // Find LoanDeployed event to get diamond address
  const event = receipt?.logs.find((log) => "eventName" in log && (log as EventLog).eventName === "LoanDeployed") as
    | EventLog
    | undefined;
  if (!event || !event.args) {
    throw new Error(
      `LoanDeployed event not found in deployment transaction. Events: ${JSON.stringify(
        receipt?.logs.filter((log) => "eventName" in log).map((e) => (e as EventLog).eventName),
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
