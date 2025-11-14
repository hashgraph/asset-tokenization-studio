// SPDX-License-Identifier: Apache-2.0

/**
 * Equity token test fixtures.
 *
 * Provides fixtures for deploying equity tokens with various configurations.
 * All fixtures extend the base ATS infrastructure fixture.
 *
 * @see https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture
 */

import { deployAtsInfrastructureFixture } from "../infrastructure.fixture";
import { deployEquityFromFactory, CURRENCIES, DeployEquityFromFactoryParams, DeepPartial } from "../../../scripts";
import {
  AccessControlFacet__factory,
  PauseFacet__factory,
  KycFacet__factory,
  ControlListFacet__factory,
} from "@contract-types";
import { DividendRight, EquityDetailsDataParams, FactoryRegulationDataParams } from "@scripts/domain";
import { getRegulationData, getSecurityData } from "./common.fixture";

/**
 * Default equity token parameters.
 * Override by passing custom params to fixture functions.
 */
export const DEFAULT_EQUITY_PARAMS = {
  votingRight: false,
  informationRight: false,
  liquidationRight: false,
  subscriptionRight: true,
  conversionRight: true,
  redemptionRight: true,
  putRight: false,
  dividendRight: DividendRight.PREFERRED,
  currency: CURRENCIES.USD,
  nominalValue: 100,
} as const;

export function getEquityDetails(params?: DeepPartial<EquityDetailsDataParams>) {
  return {
    votingRight: params?.votingRight ?? DEFAULT_EQUITY_PARAMS.votingRight,
    informationRight: params?.informationRight ?? DEFAULT_EQUITY_PARAMS.informationRight,
    liquidationRight: params?.liquidationRight ?? DEFAULT_EQUITY_PARAMS.liquidationRight,
    subscriptionRight: params?.subscriptionRight ?? DEFAULT_EQUITY_PARAMS.subscriptionRight,
    conversionRight: params?.conversionRight ?? DEFAULT_EQUITY_PARAMS.conversionRight,
    redemptionRight: params?.redemptionRight ?? DEFAULT_EQUITY_PARAMS.redemptionRight,
    putRight: params?.putRight ?? DEFAULT_EQUITY_PARAMS.putRight,
    dividendRight: params?.dividendRight ?? DEFAULT_EQUITY_PARAMS.dividendRight,
    currency: params?.currency ?? DEFAULT_EQUITY_PARAMS.currency,
    nominalValue: params?.nominalValue ?? DEFAULT_EQUITY_PARAMS.nominalValue,
  };
}
/**
 * Fixture: Deploy ATS infrastructure + single Equity token
 *
 * Extends deployAtsInfrastructureFixture with a deployed equity token
 * using default parameters (single partition, controllable, internal KYC).
 *
 * @param tokenParams - Optional custom token parameters (merged with defaults)
 * @returns Infrastructure + deployed equity token + connected facets
 */
//1893456035
export async function deployEquityTokenFixture({
  equityDataParams,
  regulationTypeParams,
}: {
  equityDataParams?: DeepPartial<DeployEquityFromFactoryParams>;
  regulationTypeParams?: DeepPartial<FactoryRegulationDataParams>;
} = {}) {
  const infrastructure = await deployAtsInfrastructureFixture();
  const { factory, blr, deployer } = infrastructure;
  const securityData = getSecurityData(blr, equityDataParams?.securityData);
  const equityDetails = getEquityDetails(equityDataParams?.equityDetails);
  // Deploy equity token using factory helper
  const diamond = await deployEquityFromFactory(
    {
      adminAccount: deployer.address,
      factory,
      securityData,
      equityDetails,
    },
    getRegulationData(regulationTypeParams),
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
