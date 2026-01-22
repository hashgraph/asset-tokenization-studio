import { deployAtsInfrastructureFixture } from "../infrastructure.fixture";
import { CURRENCIES, DeepPartial, BOND_KPI_LINKED_RATE_CONFIG_ID, ADDRESS_ZERO } from "../../../scripts";
import {
  AccessControlFacet__factory,
  PauseFacet__factory,
  KycFacet__factory,
  ControlListFacet__factory,
} from "@contract-types";
import {
  DeployBondFromFactoryParams,
  InterestRateParams,
  ImpactDataParams,
  deployBondKpiLinkedRateFromFactory,
} from "@scripts/domain";
import { FactoryRegulationDataParams } from "@scripts/domain";
import { getRegulationData, getSecurityData } from "./common.fixture";
import { getBondDetails } from "./bond.fixture";
import { getDltTimestamp } from "@test";

/**
 * Default bond token parameters.
 * Override by passing custom params to fixture functions.
 */
export const DEFAULT_BOND_KPI_LINKED_RATE_PARAMS = {
  currency: CURRENCIES.USD,
  nominalValue: 100,
  nominalValueDecimals: 2,
  proceedRecipients: [] as string[],
  proceedRecipientsData: [] as string[],
  startingDate: async () => {
    return (await getDltTimestamp()) + 3600; //block.timestamp + 1 hour
  },
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

/**
 * Fixture: Deploy ATS infrastructure + single Bond token
 *
 * Extends deployAtsInfrastructureFixture with a deployed bond token
 * using default parameters (single partition, controllable, internal KYC).
 *
 * @param tokenParams - Optional custom token parameters (merged with defaults)
 * @returns Infrastructure + deployed bond token + connected facets
 */
export async function deployBondKpiLinkedRateTokenFixture({
  bondDataParams,
  regulationTypeParams,
  interestRateParams,
  impactDataParams,
}: {
  bondDataParams?: DeepPartial<DeployBondFromFactoryParams>;
  regulationTypeParams?: DeepPartial<FactoryRegulationDataParams>;
  interestRateParams?: DeepPartial<InterestRateParams>;
  impactDataParams?: DeepPartial<ImpactDataParams>;
} = {}) {
  const infrastructure = await deployAtsInfrastructureFixture();
  const { factory, blr, deployer } = infrastructure;

  const securityData = getSecurityData(blr, {
    internalKycActivated: false,
    ...bondDataParams?.securityData,
    resolverProxyConfiguration: {
      key: BOND_KPI_LINKED_RATE_CONFIG_ID,
      version: 1,
    },
  });
  const bondDetails = await getBondDetails(bondDataParams?.bondDetails);
  const interestRate = {
    maxRate: interestRateParams?.maxRate ?? 0,
    baseRate: interestRateParams?.baseRate ?? 0,
    minRate: interestRateParams?.minRate ?? 0,
    startPeriod: interestRateParams?.startPeriod ?? 0,
    startRate: interestRateParams?.startRate ?? 0,
    missedPenalty: interestRateParams?.missedPenalty ?? 0,
    reportPeriod: interestRateParams?.reportPeriod ?? 0,
    rateDecimals: interestRateParams?.rateDecimals ?? 0,
  };
  const impactData = {
    maxDeviationCap: impactDataParams?.maxDeviationCap ?? 0,
    baseLine: impactDataParams?.baseLine ?? 0,
    maxDeviationFloor: impactDataParams?.maxDeviationFloor ?? 0,
    impactDataDecimals: impactDataParams?.impactDataDecimals ?? 0,
    adjustmentPrecision: impactDataParams?.adjustmentPrecision ?? 0,
  };

  const diamond = await deployBondKpiLinkedRateFromFactory(
    {
      adminAccount: deployer.address,
      factory: factory,
      securityData,
      bondDetails,
      proceedRecipients: [
        ...((bondDataParams?.proceedRecipients as string[]) ?? DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.proceedRecipients),
      ],
      proceedRecipientsData: [
        ...((bondDataParams?.proceedRecipientsData as string[]) ??
          DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.proceedRecipientsData),
      ],
    },
    getRegulationData(regulationTypeParams),
    interestRate,
    impactData,
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
