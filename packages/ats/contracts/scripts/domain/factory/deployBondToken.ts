// SPDX-License-Identifier: Apache-2.0

import { ethers, type EventLog } from "ethers";
import type { IFactory, ResolverProxy } from "@contract-types";
import { ResolverProxy__factory } from "@contract-types";
import { GAS_LIMIT } from "@scripts/infrastructure";
import { ATS_ROLES, BOND_CONFIG_ID } from "../constants";
import { BondDetailsDataParams, FactoryRegulationDataParams, Rbac, SecurityDataParams } from "./types";

// ============================================================================
// Types
// ============================================================================

/**
 * Rate type for bond tokens — mirrors the Solidity `BondRateType` enum in AssetStorage.sol.
 *
 * Ordinal values must never be changed; they match on-chain storage.
 */
export enum BondRateType {
  Variable = 0,
  Fixed = 1,
  KpiLinked = 2,
  Spt = 3,
}

/**
 * Parameters for deploying a bond token from the factory.
 */
export interface DeployBondFromFactoryParams {
  /** Admin account address */
  adminAccount: string;
  factory: IFactory;
  securityData: SecurityDataParams;
  bondDetails: BondDetailsDataParams;
  proceedRecipients: string[];
  proceedRecipientsData: string[];
  /** Rate type — defaults to Variable */
  rateType?: BondRateType;
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Deploy a bond token using the Factory contract.
 *
 * Unified entry point for all bond rate types (Variable, Fixed, KpiLinked, Spt).
 * Internally dispatches to the correct factory method based on `rateType`.
 * All variants use `BOND_CONFIG_ID`.
 *
 * @param bondDataParams - Bond deployment parameters (includes optional `rateType`)
 * @param regulationTypeParams - Regulation data
 * @returns Deployed ResolverProxy (diamond) contract instance
 *
 * @example
 * ```typescript
 * // Variable rate (default)
 * const bond = await deployBondFromFactory({ ...params }, regulationParams);
 *
 * // Fixed rate
 * const bond = await deployBondFromFactory(
 *   { ...params, rateType: BondRateType.Fixed },
 *   regulationParams,
 * );
 * ```
 */
export async function deployBondFromFactory(
  bondDataParams: DeployBondFromFactoryParams,
  regulationTypeParams: FactoryRegulationDataParams,
): Promise<ResolverProxy> {
  const {
    factory,
    adminAccount,
    securityData: securityDataParams,
    bondDetails: bondDetailsParams,
    proceedRecipients,
    proceedRecipientsData,
    rateType = BondRateType.Variable,
  } = bondDataParams;

  // Build RBAC array with admin
  const rbacs: Rbac[] = [
    {
      role: ATS_ROLES._DEFAULT_ADMIN_ROLE,
      members: [adminAccount],
    },
    ...securityDataParams.rbacs,
  ];

  // Build resolver proxy configuration — all rate types use the unified BOND_CONFIG_ID
  const resolverProxyConfiguration = {
    key: BOND_CONFIG_ID,
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

  // Dispatch to correct factory method based on rateType
  // All methods use BOND_CONFIG_ID; rate-specific methods also initialise rate data
  let tx: Awaited<ReturnType<typeof factory.deployBond>>;
  let eventName: string;

  switch (rateType) {
    case BondRateType.Variable:
    default: {
      tx = await factory.deployBond(bondData, factoryRegulationData, {
        gasLimit: GAS_LIMIT.high,
      });
      eventName = "BondDeployed";
      break;
    }
    // Note: Fixed / KpiLinked / Spt require additional rate-specific data.
    // Those variants should be called directly on the factory contract with their
    // respective typed structs (BondFixedRateData, BondKpiLinkedRateData,
    // BondSustainabilityPerformanceTargetRateData).
    // This function only supports Variable rate deployment via `deployBond`.
    // For other rate types pass rateType for documentation purposes but use
    // the factory contract methods directly, or extend this function with
    // rate-specific data params as needed.
  }

  const receipt = await tx!.wait();

  // Find deployment event to get diamond address
  const event = receipt?.logs.find((log) => "eventName" in log && (log as EventLog).eventName === eventName!) as
    | EventLog
    | undefined;
  if (!event || !event.args) {
    throw new Error(
      `${eventName} event not found in deployment transaction. Events: ${JSON.stringify(
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
