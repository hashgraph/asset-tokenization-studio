import { deployAtsInfrastructureFixture } from "../infrastructure.fixture";
import {
  CURRENCIES,
  DeepPartial,
  BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_CONFIG_ID,
  ADDRESS_ZERO,
} from "../../../scripts";
import {
  AccessControlFacet__factory,
  PauseFacet__factory,
  KycFacet__factory,
  ControlListFacet__factory,
} from "@contract-types";
import {
  DeployBondFromFactoryParams,
  InterestRateParamsSPT,
  ImpactDataParamsSPT,
  deployBondSustainabilityPerformanceTargetRateFromFactory,
} from "@scripts/domain";
import { FactoryRegulationDataParams } from "@scripts/domain";
import { getRegulationData, getSecurityData } from "./common.fixture";
import { getBondDetails } from "./bond.fixture";
import { getDltTimestamp } from "@test";

/**
 * Default bond sustainability performance target rate token parameters.
 * Override by passing custom params to fixture functions.
 */
export const DEFAULT_BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_PARAMS = {
  currency: CURRENCIES.USD,
  nominalValue: 100,
  nominalValueDecimals: 2,
  proceedRecipients: [] as string[],
  proceedRecipientsData: [] as string[],
  startingDate: async () => {
    return (await getDltTimestamp()) + 3600; //block.timestamp + 1 hour
  },
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

/**
 * Fixture: Deploy ATS infrastructure + single Bond Sustainability Performance Target Rate token
 *
 * Extends deployAtsInfrastructureFixture with a deployed bond token
 * using default parameters (single partition, controllable, internal KYC).
 *
 * @param tokenParams - Optional custom token parameters (merged with defaults)
 * @returns Infrastructure + deployed bond token + connected facets
 */
export async function deployBondSustainabilityPerformanceTargetRateTokenFixture({
  bondDataParams,
  regulationTypeParams,
  interestRateParams,
  impactDataParams,
  projects,
}: {
  bondDataParams?: DeepPartial<DeployBondFromFactoryParams>;
  regulationTypeParams?: DeepPartial<FactoryRegulationDataParams>;
  interestRateParams?: DeepPartial<InterestRateParamsSPT>;
  impactDataParams?: DeepPartial<ImpactDataParamsSPT>[];
  projects?: string[];
} = {}) {
  const infrastructure = await deployAtsInfrastructureFixture();
  const { factory, blr, deployer } = infrastructure;

  const securityData = getSecurityData(blr, {
    internalKycActivated: false,
    ...bondDataParams?.securityData,
    resolverProxyConfiguration: {
      key: BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_CONFIG_ID,
      version: 1,
    },
  });
  const bondDetails = await getBondDetails(bondDataParams?.bondDetails);
  const interestRate = {
    baseRate: interestRateParams?.baseRate ?? 0,
    startPeriod: interestRateParams?.startPeriod ?? 0,
    startRate: interestRateParams?.startRate ?? 0,
    rateDecimals: interestRateParams?.rateDecimals ?? 0,
  };

  // Use default project if none provided
  const projectsList = projects ?? [];

  // Create impact data array (one per project)
  const impactDataArray: ImpactDataParamsSPT[] = projectsList
    ? projectsList.map((_, index) => {
        const params = impactDataParams?.[index];
        return {
          baseLine: params?.baseLine ?? 0,
          baseLineMode: params?.baseLineMode ?? 0,
          deltaRate: params?.deltaRate ?? 0,
          impactDataMode: params?.impactDataMode ?? 0,
        };
      })
    : [];

  const diamond = await deployBondSustainabilityPerformanceTargetRateFromFactory(
    {
      adminAccount: deployer.address,
      factory: factory,
      securityData,
      bondDetails,
      proceedRecipients: [
        ...((bondDataParams?.proceedRecipients as string[]) ??
          DEFAULT_BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_PARAMS.proceedRecipients),
      ],
      proceedRecipientsData: [
        ...((bondDataParams?.proceedRecipientsData as string[]) ??
          DEFAULT_BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_PARAMS.proceedRecipientsData),
      ],
    },
    getRegulationData(regulationTypeParams),
    interestRate,
    impactDataArray,
    projectsList,
  );

  // Connect commonly used facets to diamond
  const accessControlFacet = AccessControlFacet__factory.connect(diamond.address, deployer);
  const pauseFacet = PauseFacet__factory.connect(diamond.address, deployer);
  const kycFacet = KycFacet__factory.connect(diamond.address, deployer);
  const controlListFacet = ControlListFacet__factory.connect(diamond.address, deployer);

  return {
    ...infrastructure,

    // Token
    diamond,
    tokenAddress: diamond.address,

    // Connected facets (most commonly used)
    accessControlFacet,
    pauseFacet,
    kycFacet,
    controlListFacet,
  };
}
