// SPDX-License-Identifier: Apache-2.0

import { deployAtsInfrastructureFixture } from "../infrastructure.fixture";
import { CURRENCIES, DeepPartial, BOND_FIXED_RATE_CONFIG_ID } from "../../../scripts";
import {
  AccessControlFacet__factory,
  PauseFacet__factory,
  KycFacet__factory,
  ControlListFacet__factory,
} from "@contract-types";
import { DeployBondFromFactoryParams, FixedRateParams, deployBondFixedRateFromFactory } from "@scripts/domain";
import { FactoryRegulationDataParams } from "@scripts/domain";
import { getRegulationData, getSecurityData } from "./common.fixture";
import { getBondDetails } from "./bond.fixture";
import { getDltTimestamp } from "@test";

/**
 * Default bond token parameters.
 * Override by passing custom params to fixture functions.
 */
export const DEFAULT_BOND_FIXED_RATE_PARAMS = {
  currency: CURRENCIES.USD,
  nominalValue: 100,
  nominalValueDecimals: 2,
  proceedRecipients: [] as string[],
  proceedRecipientsData: [] as string[],
  startingDate: async () => {
    return (await getDltTimestamp()) + 3600; //block.timestamp + 1 hour
  },
  rate: 50,
  rateDecimals: 1,
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
export async function deployBondFixedRateTokenFixture({
  bondDataParams,
  regulationTypeParams,
  fixedRateParams,
}: {
  bondDataParams?: DeepPartial<DeployBondFromFactoryParams>;
  regulationTypeParams?: DeepPartial<FactoryRegulationDataParams>;
  fixedRateParams?: DeepPartial<FixedRateParams>;
} = {}) {
  const infrastructure = await deployAtsInfrastructureFixture();
  const { factory, blr, deployer } = infrastructure;

  const securityData = getSecurityData(blr, {
    ...bondDataParams?.securityData,
    resolverProxyConfiguration: {
      key: BOND_FIXED_RATE_CONFIG_ID,
      version: 1,
    },
  });
  const bondDetails = await getBondDetails(bondDataParams?.bondDetails);

  const diamond = await deployBondFixedRateFromFactory(
    {
      adminAccount: deployer.address,
      factory: factory,
      securityData,
      bondDetails,
      proceedRecipients: [
        ...((bondDataParams?.proceedRecipients as string[]) ?? DEFAULT_BOND_FIXED_RATE_PARAMS.proceedRecipients),
      ],
      proceedRecipientsData: [
        ...((bondDataParams?.proceedRecipientsData as string[]) ??
          DEFAULT_BOND_FIXED_RATE_PARAMS.proceedRecipientsData),
      ],
    },
    getRegulationData(regulationTypeParams),
    {
      rate: fixedRateParams?.rate ?? DEFAULT_BOND_FIXED_RATE_PARAMS.rate,
      rateDecimals: fixedRateParams?.rateDecimals ?? DEFAULT_BOND_FIXED_RATE_PARAMS.rateDecimals,
    },
  );

  // Connect commonly used facets to diamond
  const accessControlFacet = AccessControlFacet__factory.connect(diamond.target as string, deployer);
  const pauseFacet = PauseFacet__factory.connect(diamond.target as string, deployer);
  const kycFacet = KycFacet__factory.connect(diamond.target as string, deployer);
  const controlListFacet = ControlListFacet__factory.connect(diamond.target as string, deployer);

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
