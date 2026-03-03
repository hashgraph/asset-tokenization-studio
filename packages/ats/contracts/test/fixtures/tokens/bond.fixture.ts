// SPDX-License-Identifier: Apache-2.0

import { deployAtsInfrastructureFixture } from "../infrastructure.fixture";
import { CURRENCIES, DeepPartial, TIME_PERIODS_S, BOND_CONFIG_ID } from "../../../scripts";
import {
  AccessControlFacet__factory,
  PauseFacet__factory,
  KycFacet__factory,
  ControlListFacet__factory,
} from "@contract-types";
import { DeployBondFromFactoryParams, deployBondFromFactory, BondRateType } from "@scripts/domain";
import { BondDetailsDataParams, FactoryRegulationDataParams } from "@scripts/domain";
import { getRegulationData, getSecurityData } from "./common.fixture";
import { getDltTimestamp } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { GAS_LIMIT } from "@scripts/infrastructure";
import { ResolverProxy__factory } from "@contract-types";
import { ethers, type EventLog, type ContractTransaction } from "ethers";

/**
 * Default bond token parameters.
 * Override by passing custom params to fixture functions.
 */
export const DEFAULT_BOND_PARAMS = {
  currency: CURRENCIES.USD,
  nominalValue: 100,
  nominalValueDecimals: 2,
  proceedRecipients: [] as string[],
  proceedRecipientsData: [] as string[],
  startingDate: async () => {
    return (await getDltTimestamp()) + 3600; //block.timestamp + 1 hour
  },
} as const;

/** Default parameters for fixed-rate bonds. */
export const DEFAULT_BOND_FIXED_RATE_PARAMS = {
  rate: 50,
  rateDecimals: 1,
} as const;

/** Default parameters for KPI-linked-rate bonds. */
export const DEFAULT_BOND_KPI_LINKED_RATE_PARAMS = {
  maxRate: 100,
  baseRate: 75,
  minRate: 50,
  startPeriod: 1000,
  startRate: 60,
  missedPenalty: 10,
  reportPeriod: 2000,
  rateDecimals: 1,
  maxDeviationCap: 1000,
  baseLine: 750,
  maxDeviationFloor: 500,
  impactDataDecimals: 2,
  adjustmentPrecision: 2,
} as const;

/** Default parameters for SPT-rate bonds. */
export const DEFAULT_BOND_SPT_RATE_PARAMS = {
  baseRate: 50,
  startPeriod: 1000,
  startRate: 50,
  rateDecimals: 1,
  baseLine: 750,
  baseLineMode: 0, // MINIMUM
  deltaRate: 10,
  impactDataMode: 0, // PENALTY
  projects: [] as string[],
} as const;

export async function getBondDetails(params?: DeepPartial<BondDetailsDataParams>) {
  const maturityDate =
    params?.maturityDate ??
    (params?.startingDate
      ? params.startingDate + TIME_PERIODS_S.YEAR
      : (await DEFAULT_BOND_PARAMS.startingDate()) + TIME_PERIODS_S.YEAR);
  return {
    currency: params?.currency ?? DEFAULT_BOND_PARAMS.currency,
    nominalValue: params?.nominalValue ?? DEFAULT_BOND_PARAMS.nominalValue,
    nominalValueDecimals: params?.nominalValueDecimals ?? DEFAULT_BOND_PARAMS.nominalValueDecimals,
    startingDate: params?.startingDate ?? (await DEFAULT_BOND_PARAMS.startingDate()),
    maturityDate: maturityDate,
  };
}

/**
 * Fixture: Deploy ATS infrastructure + single Bond token
 *
 * Supports all rate types via the `rateType` parameter.
 * For Fixed, KPI-linked, and SPT rates, supply the corresponding
 * rate data parameters (`fixedRateParams`, `interestRateParams`,
 * `impactDataParams`, `projects`).
 *
 * @param rateType         - Bond rate type (default: Variable)
 * @param bondDataParams   - Optional custom token parameters
 * @param regulationTypeParams - Optional regulation parameters
 * @param fixedRateParams  - Fixed-rate specific data (rateType = Fixed)
 * @param interestRateParams - KPI/SPT interest rate data
 * @param impactDataParams - KPI impact data (single object) or SPT impact data (array)
 * @param projects         - SPT project addresses
 * @param useLoadFixture   - Whether to wrap in loadFixture (default true)
 * @returns Infrastructure + deployed bond token + connected facets
 */
export async function deployBondTokenFixture({
  rateType = BondRateType.Variable,
  bondDataParams,
  regulationTypeParams,
  fixedRateParams,
  interestRateParams,
  impactDataParams,
  projects,
  useLoadFixture = true,
}: {
  rateType?: BondRateType;
  bondDataParams?: DeepPartial<DeployBondFromFactoryParams>;
  regulationTypeParams?: DeepPartial<FactoryRegulationDataParams>;
  fixedRateParams?: {
    rate?: number;
    rateDecimals?: number;
  };
  interestRateParams?: {
    maxRate?: number;
    baseRate?: number;
    minRate?: number;
    startPeriod?: number;
    startRate?: number;
    missedPenalty?: number;
    reportPeriod?: number;
    rateDecimals?: number;
  };
  impactDataParams?:
    | {
        maxDeviationCap?: number;
        baseLine?: number;
        maxDeviationFloor?: number;
        impactDataDecimals?: number;
        adjustmentPrecision?: number;
      }
    | Array<{
        baseLine?: number;
        baseLineMode?: number;
        deltaRate?: number;
        impactDataMode?: number;
      }>;
  projects?: string[];
  useLoadFixture?: boolean;
} = {}) {
  const infrastructure = useLoadFixture
    ? await loadFixture(deployAtsInfrastructureFixture)
    : await deployAtsInfrastructureFixture();
  const { factory, blr, deployer } = infrastructure;

  const securityData = getSecurityData(blr, {
    ...bondDataParams?.securityData,
    resolverProxyConfiguration: {
      key: BOND_CONFIG_ID,
      version: 1,
    },
  });
  const bondDetails = await getBondDetails(bondDataParams?.bondDetails);

  // Build the shared bond data structure
  const rbacs = [
    {
      role: "0x0000000000000000000000000000000000000000000000000000000000000000" as const,
      members: [deployer.address],
    },
    ...((bondDataParams?.securityData?.rbacs as any[]) ?? []),
  ];
  const resolverProxyConfiguration = { key: BOND_CONFIG_ID, version: 1 };
  const secData = {
    arePartitionsProtected: securityData.arePartitionsProtected,
    isMultiPartition: securityData.isMultiPartition,
    resolver: securityData.resolver,
    resolverProxyConfiguration,
    rbacs,
    isControllable: securityData.isControllable,
    isWhiteList: securityData.isWhiteList,
    maxSupply: securityData.maxSupply,
    erc20MetadataInfo: securityData.erc20MetadataInfo,
    clearingActive: securityData.clearingActive,
    internalKycActivated: securityData.internalKycActivated,
    externalPauses: securityData.externalPauses,
    externalControlLists: securityData.externalControlLists,
    externalKycLists: securityData.externalKycLists,
    erc20VotesActivated: securityData.erc20VotesActivated,
    compliance: securityData.compliance,
    identityRegistry: securityData.identityRegistry,
  };

  const proceedRecipients = [
    ...((bondDataParams?.proceedRecipients as string[]) ?? DEFAULT_BOND_PARAMS.proceedRecipients),
  ];
  const proceedRecipientsData = [
    ...((bondDataParams?.proceedRecipientsData as string[]) ?? DEFAULT_BOND_PARAMS.proceedRecipientsData),
  ];

  const bondData = {
    security: secData,
    bondDetails,
    proceedRecipients,
    proceedRecipientsData,
  };

  const regulationData = getRegulationData(regulationTypeParams);
  const factoryRegulationData = {
    regulationType: regulationData.regulationType,
    regulationSubType: regulationData.regulationSubType,
    additionalSecurityData: regulationData.additionalSecurityData,
  };

  let diamondAddress: string;
  let eventName: string;
  let tx: ContractTransaction;

  // Build rate-specific data based on bond type
  const fixedRateData = fixedRateParams
    ? {
        rate: fixedRateParams.rate ?? DEFAULT_BOND_FIXED_RATE_PARAMS.rate,
        rateDecimals: fixedRateParams.rateDecimals ?? DEFAULT_BOND_FIXED_RATE_PARAMS.rateDecimals,
      }
    : { rate: DEFAULT_BOND_FIXED_RATE_PARAMS.rate, rateDecimals: DEFAULT_BOND_FIXED_RATE_PARAMS.rateDecimals };

  switch (rateType) {
    case BondRateType.Fixed: {
      const bondFixedRateData = {
        bondData,
        factoryRegulationData,
        fixedRateData,
      };
      tx = await factory.deployBondFixedRate(bondFixedRateData, { gasLimit: GAS_LIMIT.high });
      eventName = "BondFixedRateDeployed";
      break;
    }
    case BondRateType.Variable: {
      tx = await factory.deployBond(bondData, factoryRegulationData, { gasLimit: GAS_LIMIT.high });
      eventName = "BondDeployed";
      break;
    }
    case BondRateType.KpiLinked: {
      // For KPI Linked - need interestRate and impactData
      const interestRate = interestRateParams ?? {
        maxRate: 100,
        baseRate: 50,
        minRate: 10,
        startPeriod: 3600,
        startRate: 50,
        missedPenalty: 5,
        reportPeriod: 86400,
        rateDecimals: 2,
      };
      const impactData = impactDataParams ?? {
        maxDeviationCap: 2000,
        baseLine: 1000,
        maxDeviationFloor: 500,
        impactDataDecimals: 2,
        adjustmentPrecision: 1,
      };
      const bondKpiLinkedData = {
        bondData,
        factoryRegulationData,
        interestRate,
        impactData,
      };
      tx = await factory.deployBondKpiLinkedRate(bondKpiLinkedData, { gasLimit: GAS_LIMIT.high });
      eventName = "BondKpiLinkedRateDeployed";
      break;
    }
    case BondRateType.Spt: {
      // For SPT - need interestRate, impactData array, and projects
      const interestRate = interestRateParams ?? {
        maxRate: 100,
        baseRate: 50,
        minRate: 10,
        startPeriod: 3600,
        startRate: 50,
        missedPenalty: 5,
        reportPeriod: 86400,
        rateDecimals: 2,
      };
      // SPT ImpactData has different structure than KPI
      // baseLineMode: 0 = FIXED, 1 = PERCENTAGE
      // impactDataMode: 0 = PENALTY, 1 = BONUS
      const sptImpactData = impactDataParams ?? {
        baseLine: 1000,
        baseLineMode: 0, // FIXED
        deltaRate: 5,
        impactDataMode: 0, // PENALTY
      };
      const bondSptData = {
        bondData,
        factoryRegulationData,
        interestRate,
        impactData: [sptImpactData],
        // SPT requires projects.length == impactData.length
        projects: projects ?? [ethers.Wallet.createRandom().address],
      };
      tx = await factory.deployBondSustainabilityPerformanceTargetRate(bondSptData, { gasLimit: GAS_LIMIT.high });
      eventName = "BondSustainabilityPerformanceTargetRateDeployed";
      break;
    }
    default: {
      tx = await factory.deployBond(bondData, factoryRegulationData, { gasLimit: GAS_LIMIT.high });
      eventName = "BondDeployed";
    }
  }

  const receipt = await tx.wait();
  const event = receipt?.logs.find((log) => "eventName" in log && (log as EventLog).eventName === eventName) as
    | EventLog
    | undefined;
  if (!event || !event.args) {
    throw new Error(`${eventName} event not found in deployment transaction.`);
  }
  diamondAddress = event.args.bondAddress || event.args[1];
  if (!diamondAddress || diamondAddress === ethers.ZeroAddress) {
    throw new Error(`Invalid diamond address from event.`);
  }

  const diamond = ResolverProxy__factory.connect(diamondAddress, deployer);

  // FixedRate is initialized by the Factory during deployment.
  // We only call initialize if rate is still 0 (not set by Factory)
  if (rateType === BondRateType.Fixed && fixedRateParams) {
    const FixedRateFacet = await import("@contract-types").then((m) => m.FixedRateFacet__factory);
    const fixedRateFacet = FixedRateFacet.connect(diamond.target as string, deployer);
    const [currentRate] = await fixedRateFacet.getRate();
    if (currentRate === 0n) {
      const fixedRate = fixedRateParams.rate ?? DEFAULT_BOND_FIXED_RATE_PARAMS.rate;
      const fixedRateDecimals = fixedRateParams.rateDecimals ?? DEFAULT_BOND_FIXED_RATE_PARAMS.rateDecimals;
      try {
        // Grant role and initialize
        const AccessControlFacet = await import("@contract-types").then((m) => m.AccessControlFacet__factory);
        const accessControl = AccessControlFacet.connect(diamond.target as string, deployer);
        const INTEREST_RATE_MANAGER_ROLE = "0xa174f099c94c902831d8b8a07810700505da86a76ea0bcb7629884ef26cf682e";
        await accessControl.grantRole(INTEREST_RATE_MANAGER_ROLE, deployer.address);
        await fixedRateFacet.initialize_FixedRate({ rate: fixedRate, rateDecimals: fixedRateDecimals });
      } catch {
        // Already initialized by Factory - that's fine
      }
    }
  }

  // Connect commonly used facets to diamond
  const accessControlFacet = AccessControlFacet__factory.connect(diamond.target as string, deployer);
  const pauseFacet = PauseFacet__factory.connect(diamond.target as string, deployer);
  const kycFacet = KycFacet__factory.connect(diamond.target as string, deployer);
  const controlListFacet = ControlListFacet__factory.connect(diamond.target as string, deployer);

  // Register test accounts in KYC if internal KYC is activated
  if (secData.internalKycActivated) {
    const { deployer, user1, user2, user3, user4, user5 } = infrastructure;
    const testAccounts = [deployer.address, user1.address, user2.address, user3.address, user4.address, user5.address];
    for (const account of testAccounts) {
      try {
        await kycFacet.addAddressToKycList(account);
      } catch {
        // Address might already be in KYC list
      }
    }
  }

  // For SPT bonds, register projects as proceed recipients if needed
  if (rateType === BondRateType.Spt && projects && projects.length > 0) {
    try {
      const { ProceedRecipientsFacet__factory } = await import("@contract-types");
      const proceedRecipientsFacet = ProceedRecipientsFacet__factory.connect(diamond.target as string, deployer);

      // Grant PROCEED_RECIPIENT_MANAGER_ROLE to deployer
      const PROCEED_RECIPIENT_MANAGER_ROLE = "0x96c2747c46e5702b086ad9f58206dbd0a69ac861e2f88b228cc1f86e218ced1e";
      await accessControlFacet.grantRole(PROCEED_RECIPIENT_MANAGER_ROLE, deployer.address);

      // Add each project as proceed recipient
      for (const project of projects) {
        try {
          await proceedRecipientsFacet.addProceedRecipient(project, "0x");
        } catch {
          // Project might already be registered
        }
      }
    } catch (error) {
      // ProceedRecipientsFacet might not be available for this bond type
      console.warn("Could not register SPT projects as proceed recipients:", error);
    }
  }

  return {
    ...infrastructure,

    // Token
    diamond,
    tokenAddress: diamond.target as string,

    // Connected facets (most commonly used)
    accessControlFacet,
    pauseFacet,
    kycFacet,
    controlListFacet,
  };
}
