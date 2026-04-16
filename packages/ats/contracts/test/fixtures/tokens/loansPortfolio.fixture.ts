// SPDX-License-Identifier: Apache-2.0

import { deployAtsInfrastructureFixture } from "../infrastructure.fixture";
import { CURRENCIES, DeepPartial, TIME_PERIODS_S, EQUITY_CONFIG_ID } from "../../../scripts";
import {
  AccessControlFacet__factory,
  PauseFacet__factory,
  KycFacet__factory,
  ControlListFacet__factory,
} from "@contract-types";
import { DeployLoansPortfolioFromFactoryParams, deployLoansPortfolioFromFactory } from "@scripts/domain";
import { LoansPortfolioDetailsDataParams, FactoryRegulationDataParams } from "@scripts/domain";
import { getRegulationData, getSecurityData } from "./common.fixture";
import { getDltTimestamp } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

/**
 * Default loans portfolio token parameters.
 * Override by passing custom params to fixture functions.
 */
export const DEFAULT_LOANS_PORTFOLIO_PARAMS = {
  currency: CURRENCIES.USD,
  nominalValue: 100,
  nominalValueDecimals: 2,
  proceedRecipients: [] as string[],
  proceedRecipientsData: [] as string[],
  startingDate: async () => {
    return (await getDltTimestamp()) + 3600;
  },
} as const;

export async function getLoansPortfolioDetails(params?: DeepPartial<LoansPortfolioDetailsDataParams>) {
  const maturityDate =
    params?.maturityDate ??
    (params?.startingDate
      ? params.startingDate + TIME_PERIODS_S.YEAR
      : (await DEFAULT_LOANS_PORTFOLIO_PARAMS.startingDate()) + TIME_PERIODS_S.YEAR);
  return {
    currency: params?.currency ?? DEFAULT_LOANS_PORTFOLIO_PARAMS.currency,
    nominalValue: params?.nominalValue ?? DEFAULT_LOANS_PORTFOLIO_PARAMS.nominalValue,
    nominalValueDecimals: params?.nominalValueDecimals ?? DEFAULT_LOANS_PORTFOLIO_PARAMS.nominalValueDecimals,
    startingDate: params?.startingDate ?? (await DEFAULT_LOANS_PORTFOLIO_PARAMS.startingDate()),
    maturityDate: maturityDate,
  };
}

/**
 * Fixture: Deploy ATS infrastructure + single Loans Portfolio token
 *
 * Extends deployAtsInfrastructureFixture with a deployed loans portfolio token
 * using default parameters (single partition, controllable, internal KYC).
 *
 * @param tokenParams - Optional custom token parameters (merged with defaults)
 * @returns Infrastructure + deployed loans portfolio token + connected facets
 */
export async function deployLoansPortfolioTokenFixture({
  loansPortfolioDataParams,
  regulationTypeParams,
  useLoadFixture = true,
}: {
  loansPortfolioDataParams?: DeepPartial<DeployLoansPortfolioFromFactoryParams>;
  regulationTypeParams?: DeepPartial<FactoryRegulationDataParams>;
  useLoadFixture?: boolean;
} = {}) {
  const infrastructure = useLoadFixture
    ? await loadFixture(deployAtsInfrastructureFixture)
    : await deployAtsInfrastructureFixture();
  const { factory, blr, deployer } = infrastructure;

  const securityData = getSecurityData(blr, {
    ...loansPortfolioDataParams?.securityData,
    resolverProxyConfiguration: {
      key: EQUITY_CONFIG_ID,
      version: 1,
    },
  });
  const loansPortfolioDetails = await getLoansPortfolioDetails(loansPortfolioDataParams?.loansPortfolioDetails);

  const diamond = await deployLoansPortfolioFromFactory(
    {
      adminAccount: deployer.address,
      factory: factory,
      securityData,
      loansPortfolioDetails,
      proceedRecipients: [
        ...((loansPortfolioDataParams?.proceedRecipients as string[]) ??
          DEFAULT_LOANS_PORTFOLIO_PARAMS.proceedRecipients),
      ],
      proceedRecipientsData: [
        ...((loansPortfolioDataParams?.proceedRecipientsData as string[]) ??
          DEFAULT_LOANS_PORTFOLIO_PARAMS.proceedRecipientsData),
      ],
    },
    getRegulationData(regulationTypeParams),
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
