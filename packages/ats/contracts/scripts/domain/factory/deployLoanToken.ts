// SPDX-License-Identifier: Apache-2.0

import { ethers, type EventLog } from "ethers";
import type { IFactory, ResolverProxy } from "@contract-types";
import { ResolverProxy__factory, ERC20Facet__factory } from "@contract-types";
import { GAS_LIMIT } from "@scripts/infrastructure";
import { ATS_ROLES } from "../constants";
import { LoanDetailsDataParams, FactoryRegulationDataParams, Rbac, SecurityDataParams } from "./types";

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
  /** Proceed recipients for payment distribution */
  proceedRecipients: string[];
  /** Proceed recipients data */
  proceedRecipientsData: string[];
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Deploy a loan token using the Factory contract.
 *
 * This function constructs the required data structures and calls the factory's
 * deployProxy method to create a new loan token with a diamond proxy.
 *
 * @param params - Loan deployment parameters
 * @param regulationTypeParams - Regulation type parameters
 * @returns Deployed ResolverProxy (diamond) contract instance
 */
export async function deployLoanFromFactory(
  params: DeployLoanFromFactoryParams,
  _regulationTypeParams: FactoryRegulationDataParams,
): Promise<ResolverProxy> {
  const { adminAccount, factory, securityData: securityDataParams } = params;

  // Build RBAC array with admin
  const rbacs: Rbac[] = [
    {
      role: ATS_ROLES._DEFAULT_ADMIN_ROLE,
      members: [adminAccount],
    },
    ...securityDataParams.rbacs,
  ];

  // Build resolver proxy configuration
  const resolverProxyConfiguration = securityDataParams.resolverProxyConfiguration;

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

  // Deploy loan token via factory using deployProxy (generic proxy deployer)
  const tx = await factory.deployProxy(
    securityData.resolver,
    resolverProxyConfiguration.key,
    resolverProxyConfiguration.version,
    rbacs,
    {
      gasLimit: GAS_LIMIT.high,
    },
  );
  const receipt = await tx.wait();

  // Find ProxyDeployed event to get diamond address
  const event = receipt?.logs.find((log) => "eventName" in log && (log as EventLog).eventName === "ProxyDeployed") as
    | EventLog
    | undefined;
  if (!event || !event.args) {
    throw new Error(
      `ProxyDeployed event not found in deployment transaction. Events: ${JSON.stringify(
        receipt?.logs.filter((log) => "eventName" in log).map((e) => (e as EventLog).eventName),
      )}`,
    );
  }

  const diamondAddress = event.args.proxyAddress || event.args[0];

  if (!diamondAddress || diamondAddress === ethers.ZeroAddress) {
    throw new Error(`Invalid diamond address from event. Args: ${JSON.stringify(event.args)}`);
  }

  // Initialize ERC20 metadata (name, symbol, decimals)
  const diamond = ResolverProxy__factory.connect(diamondAddress, factory.runner);
  const erc20Facet = ERC20Facet__factory.connect(diamondAddress, factory.runner);

  const erc20Metadata = {
    info: {
      name: securityData.erc20MetadataInfo.name,
      symbol: securityData.erc20MetadataInfo.symbol,
      isin: securityData.erc20MetadataInfo.isin,
      decimals: securityData.erc20MetadataInfo.decimals,
    },
    securityType: 5,
  };

  // Initialize ERC20
  await erc20Facet.initialize_ERC20(erc20Metadata, { gasLimit: GAS_LIMIT.medium });

  // Return diamond proxy as ResolverProxy contract
  return diamond;
}
