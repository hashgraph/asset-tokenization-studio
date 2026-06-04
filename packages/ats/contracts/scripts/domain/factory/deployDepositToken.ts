// SPDX-License-Identifier: Apache-2.0

import { ethers, type EventLog } from "ethers";
import type { IFactory, ResolverProxy } from "@contract-types";
import { ResolverProxy__factory } from "@contract-types";
import { GAS_LIMIT } from "@scripts/infrastructure";
import { ATS_ROLES, DEPOSIT_TOKEN_CONFIG_ID } from "../constants";
import { FactoryRegulationDataParams, Rbac, SecurityDataParams } from "./types";

// ============================================================================
// Types
// ============================================================================

/**
 * Parameters for deploying a deposit token from the factory.
 *
 * DepositToken is a minimal cash-style asset, so the input only carries the
 * shared `SecurityData`. No nominal value, coupon, maturity or interest rate
 * detail data is required.
 */
export interface DeployDepositTokenFromFactoryParams {
  /** Admin account address */
  adminAccount: string;
  factory: IFactory;
  securityData: SecurityDataParams;
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Deploy a deposit token using the Factory contract.
 *
 * This function constructs the required data structures and calls the factory's
 * `deployDepositToken` method to create a new deposit token with a diamond
 * proxy bound to `DEPOSIT_TOKEN_CONFIG_ID`.
 *
 * Recommended defaults for `securityDataParams` on a cash token:
 * - `clearingActive: false` — the hold verbs require `onlyClearingDisabled`.
 * - `arePartitionsProtected: false` — the configuration does not include
 *   `ProtectedByPartitionFacet`, so the protected-partition flow is not
 *   reachable from the diamond.
 *
 * @param params - Deposit token deployment parameters
 * @param regulationTypeParams - Regulation type / sub-type to apply
 * @returns Deployed ResolverProxy (diamond) contract instance
 */
export async function deployDepositTokenFromFactory(
  params: DeployDepositTokenFromFactoryParams,
  regulationTypeParams: FactoryRegulationDataParams,
): Promise<ResolverProxy> {
  const { factory, adminAccount, securityData: securityDataParams } = params;

  // Build RBAC array with admin
  const rbacs: Rbac[] = [
    {
      role: ATS_ROLES.DEFAULT_ADMIN_ROLE,
      members: [adminAccount],
    },
    ...securityDataParams.rbacs,
  ];

  // Build resolver proxy configuration
  const resolverProxyConfiguration = {
    key: DEPOSIT_TOKEN_CONFIG_ID,
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

  // Build deposit token data
  const depositTokenData = {
    security: securityData,
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

  // Deploy deposit token via factory
  const tx = await factory.deployDepositToken(depositTokenData, factoryRegulationData, {
    gasLimit: GAS_LIMIT.high,
  });
  const receipt = await tx.wait();

  // Find DepositTokenDeployed event to get diamond address
  const event = receipt?.logs.find(
    (log) => "eventName" in log && (log as EventLog).eventName === "DepositTokenDeployed",
  ) as EventLog | undefined;
  if (!event || !event.args) {
    throw new Error(
      `DepositTokenDeployed event not found in deployment transaction. Events: ${JSON.stringify(
        receipt?.logs.filter((log) => "eventName" in log).map((e) => (e as EventLog).eventName),
      )}`,
    );
  }

  const diamondAddress = event.args.depositTokenAddress || event.args[1];

  if (!diamondAddress || diamondAddress === ethers.ZeroAddress) {
    throw new Error(`Invalid diamond address from event. Args: ${JSON.stringify(event.args)}`);
  }

  // Return diamond proxy as ResolverProxy contract
  return ResolverProxy__factory.connect(diamondAddress, factory.runner);
}
